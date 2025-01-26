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

    // Create a script element and set its content
    const scriptContent = [
      '// Create a unique namespace for our code to avoid conflicts with React',
      'window.BrainstormGraph = window.BrainstormGraph || {};',
      '',
      '// Define constants and types in our namespace',
      'BrainstormGraph.RelationType = {',
      '  PARENT_CHILD: "parent_child",',
      '  RELATED: "related",',
      '  SUPPORTS: "supports",',
      '  CONTRADICTS: "contradicts"',
      '};',
      '',
      '// Define classes in our namespace',
      nodeJs.replace(/export class Node/, 'BrainstormGraph.Node = class Node'),
      '',
      edgeJs.replace(/export class Edge/, 'BrainstormGraph.Edge = class Edge'),
      '',
      graphManagerJs
        .replace(/import [^;]+;/g, '')
        .replace(/export class GraphManager/, 'BrainstormGraph.GraphManager = class GraphManager')
        .replace(/new Node/g, 'new BrainstormGraph.Node')
        .replace(/new Edge/g, 'new BrainstormGraph.Edge'),
      '',
      visualizationJs
        .replace(/import [^;]+;/g, '')
        .replace(/export class VisualizationManager/, 'BrainstormGraph.VisualizationManager = class VisualizationManager')
        .replace(/new GraphManager/g, 'new BrainstormGraph.GraphManager'),
      '',
      '// Initialize visualization when the container is ready',
      'const initBrainstormGraph = () => {',
      '  const container = document.getElementById("brainstorm-graph");',
      '  if (!container) {',
      '    // If container isn\'t ready, try again in a moment',
      '    setTimeout(initBrainstormGraph, 100);',
      '    return;',
      '  }',
      '',
      '  const graphManager = new BrainstormGraph.GraphManager();',
      '  const visualizationManager = new BrainstormGraph.VisualizationManager(container, graphManager);',
      '',
      '  // Initialize with the provided data',
      `  const graphData = ${JSON.stringify(graphData)};`,
      '  graphManager.constructFromJSON(graphData);',
      '  visualizationManager.updateVisualization();',
      '  visualizationManager.centerGraph();',
      '};',
      '',
      '// Start initialization',
      'initBrainstormGraph();'
    ].join('\n');

    const inlineScripts = `<script nonce="abc">${scriptContent}</script>
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
