// openai.mjs
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export async function processMessages(messages) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Use 'gpt-4' or another appropriate model available to you
      messages: [
        {
          role: 'system',
          content: `You are an assistant helping to brainstorm ideas from user messages. For each distinct idea in the messages, please provide:
- "label": A concise name for the idea.
- "description": A brief explanation of the idea.
- "connections": An array of labels of related ideas.

Please output the result as a JSON array enclosed in triple backticks like so:

\`\`\`json
[
  {
    "label": "Idea 1",
    "description": "Description of idea 1.",
    "connections": ["Idea 2", "Idea 3"]
  },
  {
    "label": "Idea 2",
    "description": "Description of idea 2.",
    "connections": ["Idea 1"]
  }
]
\`\`\`

Do not include any additional text or explanation.`,
        },
        ...messages,
      ],
    });

    const aiMessage = completion.choices[0].message.content;

    // Extract JSON from the AI's response
    const jsonMatch = aiMessage.match(/```json\s*([\s\S]*?)\s*```/);

    if (jsonMatch && jsonMatch[1]) {
      const jsonString = jsonMatch[1];
      const nodes = JSON.parse(jsonString);
      return nodes;
    } else {
      throw new Error('Failed to parse JSON from AI response.');
    }
  } catch (error) {
    console.error('Error processing messages:', error);
    throw error;
  }
}