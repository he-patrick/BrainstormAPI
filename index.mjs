// index.mjs
import { processMessages } from './openai.mjs';

export const handler = async (event) => {
  try {
    // Parse the incoming event body
    const body = JSON.parse(event.body);
    const userMessages = body.messages || [];

    // Format messages for OpenAI API
    const messages = userMessages.map((message) => ({
      role: 'user',
      content: message.text,
    }));

    // Process messages to get graph nodes
    const nodes = await processMessages(messages);

    // Construct the response
    const response = {
      statusCode: 200,
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
      body: JSON.stringify({
        status: 'error',
        message: error.message || 'Internal Server Error',
      }),
    };
  }
};