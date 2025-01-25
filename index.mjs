import { processMessages } from './openai.mjs';

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

    const nodes = await processMessages(rootIdea, messages);

    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // Adjust this to your needs
        'Access-Control-Allow-Headers': 'Content-Type',
        // Include other headers if necessary
      },
      body: JSON.stringify({
        status: 'success',
        data: nodes,
      }),
    };

    return response;
  } catch (error) {
    console.error('Error in handler:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*', // Ensure headers are included in error responses too
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({
        status: 'error',
        message: error.message || 'Internal Server Error',
      }),
    };
  }
};
