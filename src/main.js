// Function to check if vis.js is loaded
function checkVisLoaded() {
    return typeof vis !== 'undefined';
}

// Function to load vis.js if not present
function loadVis() {
    return new Promise((resolve, reject) => {
        if (checkVisLoaded()) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/vis-network/standalone/umd/vis-network.min.js';
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load vis.js'));
        document.head.appendChild(script);
    });
}

// Initialize the application
async function initializeApp() {
    try {
        // Ensure vis.js is loaded
        await loadVis();
        
        // Import our modules
        const { GraphManager } = await import('./core/graph-manager.js');
        const { VisualizationManager } = await import('./core/visualization.js');

        // Export classes to global scope
        window.GraphManager = GraphManager;
        window.VisualizationManager = VisualizationManager;

        return { GraphManager, VisualizationManager };
    } catch (error) {
        console.error('Failed to initialize application:', error);
        throw error;
    }
}

// Wait for DOM and initialize
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { GraphManager, VisualizationManager } = await initializeApp();
        const graphManager = new GraphManager();
        
        // Initialize visualization
        const container = document.getElementById('brainstorm-graph');
        if (!container) {
            console.error('Graph container not found');
            return;
        }

        const visualizationManager = new VisualizationManager(container, graphManager);
        
        // Expose method to construct graph from JSON
        window.constructGraphFromJSON = async (jsonData) => {
            try {
                // Ensure vis.js is still loaded (in case of dynamic content refresh)
                if (!checkVisLoaded()) {
                    await loadVis();
                }

                graphManager.constructFromJSON(jsonData);
                visualizationManager.updateVisualization();
                visualizationManager.centerGraph();
                
                console.log('Graph constructed and visualized successfully');
            } catch (error) {
                console.error('Error constructing graph:', error);
                throw error;
            }
        };

        console.log('Brainstorm visualization initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Brainstorm visualization:', error);
    }
});
