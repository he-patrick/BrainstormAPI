// openai.mjs
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export async function processMessages(rootIdea, messages) {
  try {
    if (!rootIdea || typeof rootIdea !== 'string') {
      throw new Error('Invalid input: "rootIdea" must be a non-empty string.');
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error('Invalid input: "messages" must be a non-empty array.');
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `The brainstorming session is centered around the root idea: "${rootIdea}". You are tasked with identifying distinct ideas derived from user messages and outputting them as nodes and edges for a graph structure. For each idea, include:
          
**Nodes**:
- "id": A unique identifier for each node, starting with 1 for "${rootIdea}".
- "label": A concise name for the idea.
- "description": A brief explanation of the idea.

**Edges**:
- "source": The ID of the parent node.
- "destination": The ID of the child node.

Ensure all ideas are connected to "${rootIdea}" as the starting node. Output the result as a JSON object enclosed in triple backticks with two arrays: "nodes" and "edges".

Example output:
\`\`\`json
{
  "nodes": [
    { "id": 1, "label": "Root Idea", "description": "Description of the root idea." },
    { "id": 2, "label": "Idea 1", "description": "An idea that falls under the root idea." },
    { "id": 3, "label": "Idea 2", "description": "An idea that falls under Idea 1." },
    { "id": 4, "label": "Idea 3", "description": "An idea that falls under Idea 1." },
    { "id": 5, "label": "Idea 4", "description": "An idea that falls under the root idea." },
    { "id": 6, "label": "Idea 5", "description": "An idea that falls under Idea 3." }
  ],
  "edges": [
    { "source": 1, "destination": 2 },
    { "source": 2, "destination": 3 },
    { "source": 2, "destination": 4 },
    { "source": 1, "destination": 5 },
    { "source": 4, "destination": 6 }
  ]
}
\`\`\`

Ensure that:
1. The IDs are sequential and unique.
2. Every node except the root has at least one parent.
3. Read the messages and identify which ones should be grouped together under the same node. You should make edges that create this structure, were two siimilar ideas, such as an AI chat autocompleter and an AI messsage summarizer both fall under AI chat applications extensions for example`,
        },
        ...messages,
      ],
    });

    const aiMessage = completion.choices[0].message.content;

    // Extract JSON from the AI's response
    const jsonMatch = aiMessage.match(/```json\s*([\s\S]*?)\s*```/);

    if (jsonMatch && jsonMatch[1]) {
      const jsonString = jsonMatch[1];

      try {
        const graph = JSON.parse(jsonString);
        console.log(graph);
        return graph;
      } catch (parseError) {
        throw new Error(`JSON parsing failed: ${parseError.message}`);
      }
    } else {
      throw new Error('Failed to extract JSON from AI response.');
    }
  } catch (error) {
    console.error('Error processing messages:', error.message || error);
    throw error;
  }
}
