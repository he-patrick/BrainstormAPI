import { GraphManager } from './core/graph-manager.js';
import { VisualizationManager } from './core/visualization.js';

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
