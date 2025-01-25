import { GraphManager } from './core/graph-manager';
import { VisualizationManager } from './core/visualization';
import { RelationType } from './core/types';
document.addEventListener('DOMContentLoaded', () => {
    const graphManager = new GraphManager();
    // Initialize visualization
    const container = document.getElementById('graph');
    if (!container) {
        console.error('Graph container not found');
        return;
    }
    const visualizationManager = new VisualizationManager(container, graphManager);
    // Create root node
    console.log('Creating root node...');
    const rootNode = graphManager.addNode({
        sessionId: 'demo-session',
        label: 'Brainstorming Topic',
        description: 'Central topic for the brainstorming session. Add child nodes to break down ideas and concepts.',
        level: 0,
        priority: 5,
        messageIds: [],
        parentId: undefined,
        metadata: {
            created: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            frequency: 1
        }
    });
    visualizationManager.updateVisualization();
    visualizationManager.centerGraph();
    // Add node button handler
    const addNodeBtn = document.getElementById('addNodeBtn');
    const nodeLabelInput = document.getElementById('nodeLabel');
    const parentNodeSelect = document.getElementById('parentNode');
    if (addNodeBtn && nodeLabelInput && parentNodeSelect) {
        // Add root node to parent select
        const option = document.createElement('option');
        option.value = rootNode.id;
        option.textContent = rootNode.label;
        parentNodeSelect.appendChild(option);
        addNodeBtn.addEventListener('click', () => {
            const label = nodeLabelInput.value;
            const description = document.getElementById('nodeDescription').value;
            const parentId = parentNodeSelect.value;
            if (!label) {
                alert('Please enter a node label');
                return;
            }
            if (!parentId) {
                alert('Please select a parent node');
                return;
            }
            const node = graphManager.addNode({
                sessionId: 'demo-session',
                label,
                description,
                level: 0,
                priority: 3,
                messageIds: [],
                metadata: {
                    created: new Date().toISOString(),
                    lastUpdated: new Date().toISOString(),
                    frequency: 1
                }
            });
            graphManager.addEdge(parentId, node.id, RelationType.PARENT_CHILD, 1);
            visualizationManager.updateVisualization();
            visualizationManager.animateNewNode(node.id);
            const select = document.getElementById('parentNode');
            if (select) {
                const option = document.createElement('option');
                option.value = node.id;
                option.textContent = node.label;
                select.appendChild(option);
            }
            nodeLabelInput.value = '';
            document.getElementById('nodeDescription').value = '';
        });
    }
});
//# sourceMappingURL=main.js.map