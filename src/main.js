// Make classes globally available since we're using inline scripts
const { GraphManager } = await import('./core/graph-manager.js');
const { VisualizationManager } = await import('./core/visualization.js');

// Export classes to global scope
window.GraphManager = GraphManager;
window.VisualizationManager = VisualizationManager;

document.addEventListener('DOMContentLoaded', () => {
    const graphManager = new GraphManager();
    
    // Initialize visualization
    const container = document.getElementById('graph');
    if (!container) {
        console.error('Graph container not found');
        return;
    }

    const visualizationManager = new VisualizationManager(container, graphManager);
    
    // Expose method to construct graph from JSON
    window.constructGraphFromJSON = (jsonData) => {
        try {
            graphManager.constructFromJSON(jsonData);
            visualizationManager.updateVisualization();
            visualizationManager.centerGraph();
        } catch (error) {
            console.error('Error constructing graph:', error);
            throw error;
        }
    };
});
