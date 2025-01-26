// Make dependencies globally available
const { Node } = await import('./node.js');
const { Edge } = await import('./edge.js');

// Export to global scope
window.Node = Node;
window.Edge = Edge;

export class GraphManager {
  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
    this.rootNodes = new Set();
  }

  calculateLevel(nodeId) {
    const node = this.nodes.get(nodeId);
    if (!node || !node.parentId) return 0;
    
    let level = 1;
    let currentId = node.parentId;
    
    while (currentId) {
      const parent = this.nodes.get(currentId);
      if (!parent) break;
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
    switch(level) {
      case 0: return '#4CAF50'; // High-level ideas (green)
      case 1: return '#2196F3'; // Mid-level ideas (blue)
      default: return '#9C27B0'; // Details/implementation (purple)
    }
  }

  constructFromJSON(data) {
    // Validation
    if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
      throw new Error('Invalid JSON structure');
    }
    
    // Verify node with ID 1 exists and is present
    const rootNode = data.nodes.find(node => node.id === 1);
    if (!rootNode) {
      throw new Error('Root node (ID: 1) is required');
    }

    // Clear existing data
    this.nodes.clear();
    this.edges.clear();
    this.rootNodes.clear();

    // Create nodes
    data.nodes.forEach(nodeData => {
      if (!nodeData.id || !nodeData.label) {
        throw new Error('Node missing required fields');
      }
      // For root node (ID: 1), ensure parentId is null
      if (nodeData.id === 1) {
        nodeData.parentId = null;
        nodeData.level = 0;
      }
      this.addNode(nodeData);
    });

    // Create edges
    data.edges.forEach(edgeData => {
      if (!edgeData.source || !edgeData.destination) {
        throw new Error('Edge missing required fields');
      }
      if (!this.nodes.has(edgeData.source) || !this.nodes.has(edgeData.destination)) {
        throw new Error('Edge references non-existent node');
      }
      this.addEdge(edgeData.source, edgeData.destination);
    });

    // Only need to update levels starting from root
    this.updateSubtreeLevels(1);
  }

  addNode(nodeData) {
    const node = new Node(nodeData);
    this.nodes.set(node.id, node);
    if (!node.parentId) {
      this.rootNodes.add(node.id);
    }
    return node;
  }

  addEdge(source, destination) {
    if (!this.nodes.has(source) || !this.nodes.has(destination)) {
      throw new Error('Source or target node not found');
    }

    const edge = new Edge(source, destination);
    this.edges.set(edge.id, edge);

    const targetNode = this.nodes.get(destination);
    const sourceNode = this.nodes.get(source);
    targetNode.parentId = source;
    sourceNode.children.add(destination);
    this.rootNodes.delete(destination);
    this.updateSubtreeLevels(destination);

    return edge;
  }

  updateSubtreeLevels(nodeId) {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    const newLevel = this.calculateLevel(nodeId);
    if (newLevel !== node.level) {
      node.level = newLevel;
    }

    Array.from(this.edges.values())
      .filter(edge => edge.source === nodeId)
      .forEach(edge => this.updateSubtreeLevels(edge.target));
  }

  getNode(nodeId) {
    return this.nodes.get(nodeId);
  }

  getAllNodes() {
    return Array.from(this.nodes.values());
  }

  getVisNetworkData() {
    const nodes = Array.from(this.nodes.values()).map(node => 
      node.toVisNetworkFormat(this.getNodeColor(node.level))
    );

    const edges = Array.from(this.edges.values()).map(edge => 
      edge.toVisNetworkFormat()
    );

    return { nodes, edges };
  }
}
