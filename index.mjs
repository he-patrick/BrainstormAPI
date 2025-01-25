import * as https from 'node:https';

/**
 * Pass the data to send as `event.data`, and the request options as
 * `event.options`. For more information see the HTTPS module documentation
 * at https://nodejs.org/api/https.html.
 *
 * Will succeed with the response body.
 */
export const handler = async (event) => {
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello, World!'),
    };
    return response;
};


