import { GraphManager } from './graph-manager.js';

export class VisualizationManager {
    constructor(container, graphManager) {
        this.graphManager = graphManager;
        this.baseRadius = 150;
        
        const options = {
            nodes: {
                shape: 'dot',
                scaling: {
                    min: 20,
                    max: 50
                },
                font: {
                    size: 14
                },
                fixed: {
                    x: false,
                    y: false
                }
            },
            edges: {
                smooth: {
                    enabled: true,
                    type: 'straightCross',
                    roundness: 0.2
                },
                color: {
                    inherit: false
                },
                length: undefined
            },
            physics: {
                enabled: true,
                stabilization: {
                    enabled: true,
                    iterations: 200,
                    updateInterval: 25,
                    fit: true
                },
                barnesHut: {
                    gravitationalConstant: -2000,
                    centralGravity: 0.1,
                    springLength: 100,
                    springConstant: 0.2,
                    damping: 0.3,
                    avoidOverlap: 0.5
                },
                minVelocity: 0.1
            },
            interaction: {
                dragNodes: true,
                hover: true,
                navigationButtons: true,
                keyboard: true
            }
        };

        this.network = new vis.Network(container, { nodes: [], edges: [] }, options);
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.network.on('selectNode', (params) => {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                const node = this.graphManager.getNode(nodeId);
                if (node) {
                    this.updateNodeDetails(node);
                }
            }
        });

        this.network.on('deselectNode', () => {
            this.clearNodeDetails();
        });

        this.network.on('stabilizationIterationsDone', () => {
            console.log('Graph stabilized');
        });
    }

    calculateNodeAngle(nodeId) {
        const node = this.graphManager.getNode(nodeId);
        if (!node || !node.parentId) return Math.random() * 2 * Math.PI;

        const parent = this.graphManager.getNode(node.parentId);
        if (!parent) return Math.random() * 2 * Math.PI;

        if (!parent.parentId) {
            const siblings = this.graphManager.getAllNodes()
                .filter(n => n.parentId === parent.id);
            const index = siblings.findIndex(n => n.id === nodeId);
            return (index / siblings.length) * 2 * Math.PI;
        }

        const parentPos = this.network.getPosition(parent.id);
        const parentAngle = Math.atan2(parentPos.y, parentPos.x);
        return parentAngle + (Math.random() - 0.5) * Math.PI * 0.4;
    }

    updateNodeDetails(node) {
        const detailsDiv = document.getElementById('nodeDetails');
        if (!detailsDiv) return;

        detailsDiv.innerHTML = `
            <h3>${node.label}</h3>
            <div style="margin: 10px 0; padding: 10px; background: #f9f9f9; border-radius: 4px;">
                <p style="white-space: pre-wrap; margin: 0;">${node.description || 'No description provided'}</p>
            </div>
            <hr style="margin: 10px 0; border: none; border-top: 1px solid #eee;">
            <p><strong>Level:</strong> ${node.level}</p>
            <p><strong>Priority:</strong> ${node.priority}</p>
        `;
    }

    clearNodeDetails() {
        const detailsDiv = document.getElementById('nodeDetails');
        if (detailsDiv) {
            detailsDiv.innerHTML = '<h3>Select a node to see details</h3>';
        }
    }

    updateNodePositions() {
        this.graphManager.getAllNodes().forEach(node => {
            if (!node.parentId) {
                this.network.moveNode(node.id, 0, 0);
                this.network.body.data.nodes.update({
                    id: node.id,
                    fixed: {
                        x: true,
                        y: true
                    }
                });
            } else {
                const siblings = this.graphManager.getAllNodes().filter(n => n.parentId === node.parentId);
                const degreeMultiplier = Math.max(1, Math.log2(siblings.length) * 0.5);
                const radius = this.baseRadius * Math.pow(1.5, node.level - 1) * degreeMultiplier;
                const angle = this.calculateNodeAngle(node.id);
                const x = radius * Math.cos(angle);
                const y = radius * Math.sin(angle);
                this.network.moveNode(node.id, x, y);
            }
        });
    }

    animateNewNode(nodeId) {
        const node = this.graphManager.getNode(nodeId);
        if (!node) return;

        // Start with physics disabled
        this.network.setOptions({ physics: { enabled: false } });

        // Get parent position
        let startX = 0, startY = 0;
        if (node.parentId) {
            const parent = this.network.body.data.nodes.get(node.parentId);
            if (parent) {
                startX = parent.x || 0;
                startY = parent.y || 0;
            }
        }

        // Place node at parent position
        this.network.moveNode(nodeId, startX, startY);

        // Calculate final position
        const level = node.level;
        const siblings = this.graphManager.getAllNodes().filter(n => n.parentId === node.parentId);
        const degreeMultiplier = Math.max(1, Math.log2(siblings.length) * 0.5);
        const radius = this.baseRadius * Math.pow(1.5, level - 1) * degreeMultiplier;
        const angle = this.calculateNodeAngle(nodeId);
        const finalX = radius * Math.cos(angle);
        const finalY = radius * Math.sin(angle);

        // Animate to final position
        let progress = 0;
        const animate = () => {
            progress += 0.05;
            if (progress > 1) {
                this.updateNodePositions();
                return;
            }

            // Smooth easing
            const eased = 1 - Math.pow(1 - progress, 3);
            const x = startX + (finalX - startX) * eased;
            const y = startY + (finalY - startY) * eased;
            this.network.moveNode(nodeId, x, y);
            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }

    updateVisualization() {
        const data = this.graphManager.getVisNetworkData();
        this.network.setData(data);
    }

    centerGraph() {
        this.network.fit({
            animation: {
                duration: 1000,
                easingFunction: 'easeInOutQuad'
            }
        });
    }
}
