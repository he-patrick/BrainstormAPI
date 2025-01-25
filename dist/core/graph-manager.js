import { RelationType } from './types';
export class GraphManager {
    constructor() {
        this.nodes = new Map();
        this.edges = new Map();
        this.rootNodes = new Set();
    }
    calculateLevel(nodeId) {
        const node = this.nodes.get(nodeId);
        if (!node || !node.parentId)
            return 0;
        let level = 1;
        let currentId = node.parentId;
        while (currentId) {
            const parent = this.nodes.get(currentId);
            if (!parent)
                break;
            if (!parent.parentId) {
                // Found root node
                return level;
            }
            currentId = parent.parentId;
            level++;
        }
        return level;
    }
    getNodeColor(level) {
        switch (level) {
            case 0: return '#4CAF50'; // High-level ideas (green)
            case 1: return '#2196F3'; // Mid-level ideas (blue)
            default: return '#9C27B0'; // Details/implementation (purple)
        }
    }
    addNode(node) {
        console.log('Adding node:', node);
        const newNode = {
            ...node,
            id: uuidv4(),
            metadata: {
                created: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                frequency: node.metadata?.frequency || 1
            }
        };
        newNode.level = newNode.parentId ? this.calculateLevel(newNode.id) : 0;
        this.nodes.set(newNode.id, newNode);
        if (!newNode.parentId) {
            this.rootNodes.add(newNode.id);
        }
        return newNode;
    }
    addEdge(source, target, type, strength) {
        if (!this.nodes.has(source) || !this.nodes.has(target)) {
            throw new Error('Source or target node not found');
        }
        const edge = {
            id: uuidv4(),
            sessionId: this.nodes.get(source).sessionId,
            source,
            target,
            type,
            strength,
            metadata: {
                created: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            }
        };
        this.edges.set(edge.id, edge);
        if (type === RelationType.PARENT_CHILD) {
            const targetNode = this.nodes.get(target);
            targetNode.parentId = source;
            this.rootNodes.delete(target);
            this.updateSubtreeLevels(target);
        }
        return edge;
    }
    updateSubtreeLevels(nodeId) {
        const node = this.nodes.get(nodeId);
        if (!node)
            return;
        const newLevel = this.calculateLevel(nodeId);
        if (newLevel !== node.level) {
            node.level = newLevel;
        }
        Array.from(this.edges.values())
            .filter(edge => edge.source === nodeId && edge.type === RelationType.PARENT_CHILD)
            .forEach(edge => this.updateSubtreeLevels(edge.target));
    }
    getNode(nodeId) {
        return this.nodes.get(nodeId);
    }
    getAllNodes() {
        return Array.from(this.nodes.values());
    }
    getVisNetworkData() {
        const nodes = Array.from(this.nodes.values()).map(node => ({
            id: node.id,
            label: node.label,
            level: node.level,
            color: this.getNodeColor(node.level),
            size: node.priority * 5
        }));
        const edges = Array.from(this.edges.values()).map(edge => ({
            id: edge.id,
            from: edge.source,
            to: edge.target,
            width: edge.strength,
            dashes: edge.type !== RelationType.PARENT_CHILD,
            color: edge.type === RelationType.CONTRADICTS ? '#ff0000' : '#999999'
        }));
        return { nodes, edges };
    }
}
//# sourceMappingURL=graph-manager.js.map