# BrainstormAPI

A Node.js API that generates and visualizes idea graphs from natural language input using GPT-4. The API processes messages about a central topic and creates an interactive graph visualization showing the relationships between different ideas.

## Features

- Processes natural language input using GPT-4 to extract ideas and relationships
- Generates a hierarchical graph structure with the main topic as the root node
- Returns an interactive HTML visualization using vis.js
- Color-coded nodes based on hierarchy level:
  - Green: High-level ideas
  - Blue: Mid-level ideas
  - Purple: Details/implementation
- Interactive graph features:
  - Zoom and pan
  - Node selection for detailed information
  - Automatic layout with physics simulation
  - Smooth animations for graph updates

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/BrainstormAPI.git
cd BrainstormAPI
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your OpenAI API key:
```
OPENAI_API_KEY=your-api-key-here
```

## Usage

### API Endpoint

The API accepts POST requests with the following JSON structure:

```json
{
  "rootIdea": "Main Topic",
  "messages": [
    { "text": "First idea or message" },
    { "text": "Second idea or message" }
  ]
}
```

Example using curl:
```bash
curl -X POST http://your-api-endpoint \
  -H "Content-Type: application/json" \
  -d '{
    "rootIdea": "AI Applications",
    "messages": [
      { "text": "We could use AI for content generation" },
      { "text": "AI could help with code completion" }
    ]
  }'
```

### Response

The API returns a complete HTML page containing:
- An interactive graph visualization
- Node details sidebar
- Color-coded legend
- All necessary JavaScript for graph interaction

## Dependencies

- OpenAI API for natural language processing
- vis.js for graph visualization
- Node.js and npm for runtime and package management

## License

Apache License 2.0
