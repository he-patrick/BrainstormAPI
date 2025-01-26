import { processMessages } from './openai.mjs';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function generateHtmlResponse(graphData) {
  try {
    // Read all necessary files
    const htmlTemplate = await fs.readFile(path.join(__dirname, 'index.html'), 'utf-8');
    const typesJs = await fs.readFile(path.join(__dirname, 'src/core/types.js'), 'utf-8');
    const nodeJs = await fs.readFile(path.join(__dirname, 'src/core/node.js'), 'utf-8');
    const edgeJs = await fs.readFile(path.join(__dirname, 'src/core/edge.js'), 'utf-8');
    const graphManagerJs = await fs.readFile(path.join(__dirname, 'src/core/graph-manager.js'), 'utf-8');
    const visualizationJs = await fs.readFile(path.join(__dirname, 'src/core/visualization.js'), 'utf-8');
    const mainJs = await fs.readFile(path.join(__dirname, 'src/main.js'), 'utf-8');

    // Combine all modules into a single script with proper ordering
    const inlineScripts = `
      <script type="module">
        // Define all modules in the global scope
        ${typesJs}

        // Node and Edge have no dependencies
        ${nodeJs}
        ${edgeJs}

        // GraphManager depends on Node and Edge
        ${graphManagerJs}

        // VisualizationManager depends on GraphManager
        ${visualizationJs}

        // Main depends on GraphManager and VisualizationManager
        ${mainJs}

        // Initialize graph with data
        document.addEventListener('DOMContentLoaded', () => {
          const graphData = ${JSON.stringify(graphData)};
          window.constructGraphFromJSON(graphData);
        });
      </script>
    `;

    // Replace the module script tags with our inline versions
    let modifiedHtml = htmlTemplate;
    modifiedHtml = modifiedHtml.replace(/<script type="module"[^>]*>[^<]*<\/script>/g, '');
    modifiedHtml = modifiedHtml.replace('</body>', `${inlineScripts}</body>`);

    return modifiedHtml;
  } catch (error) {
    console.error('Error generating HTML:', error);
    throw error;
  }
}

export const handler = async (event) => {
  try {
    let body;

    if (event.body) {
      body = JSON.parse(event.body);
    } else {
      body = event;
    }

    const userMessages = body.messages || [];
    const rootIdea = body.rootIdea;

    const messages = userMessages.map((message) => ({
      role: 'user',
      content: message.text,
    }));

    const graphData = await processMessages(rootIdea, messages);
    const htmlContent = await generateHtmlResponse(graphData);

    const response = {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: htmlContent,
    };

    return response;
  } catch (error) {
    console.error('Error in handler:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: `
        <html>
          <body>
            <h1>Error</h1>
            <p>${error.message || 'Internal Server Error'}</p>
          </body>
        </html>
      `,
    };
  }
};
