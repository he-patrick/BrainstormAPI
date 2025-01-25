import { Node } from './node.js';
import { Edge } from './edge.js';

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

  addNode(nodeData) {
    const node = new Node(nodeData);
    
    if (node.parentId) {
      node.level = this.calculateLevel(node.id);
    }

    this.nodes.set(node.id, node);
    if (!node.parentId) {
      this.rootNodes.add(node.id);
    }

    return node;
  }

  addEdge(source, target) {
    if (!this.nodes.has(source) || !this.nodes.has(target)) {
      throw new Error('Source or target node not found');
    }

    const edge = new Edge(source, target);
    this.edges.set(edge.id, edge);

    const targetNode = this.nodes.get(target);
    const sourceNode = this.nodes.get(source);
    targetNode.parentId = source;
    sourceNode.children.add(target);
    this.rootNodes.delete(target);
    this.updateSubtreeLevels(target);

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
