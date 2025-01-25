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

    const messages = userMessages.map((message) => ({
      role: 'user',
      content: message.text,
    }));

    const nodes = await processMessages(messages);

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