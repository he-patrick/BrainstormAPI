import { Node, Edge, GraphData, RelationType } from './types';
import { v4 as uuidv4 } from 'uuid';

export class GraphManager {
  private nodes: Map<string, Node>;
  private edges: Map<string, Edge>;
  private rootNodes: Set<string>;

  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
    this.rootNodes = new Set();
  }

  addNode(node: Omit<Node, 'id'>): Node {
    const newNode: Node = {
      ...node,
      id: uuidv4(),
      metadata: {
        ...node.metadata,
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }
    };

    this.nodes.set(newNode.id, newNode);
    if (!newNode.parentId) {
      this.rootNodes.add(newNode.id);
    }

    return newNode;
  }

  updateNode(nodeId: string, updates: Partial<Node>): Node {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node with id ${nodeId} not found`);
    }

    const updatedNode = {
      ...node,
      ...updates,
      metadata: {
        ...node.metadata,
        lastUpdated: new Date().toISOString()
      }
    };

    this.nodes.set(nodeId, updatedNode);
    return updatedNode;
  }

  removeNode(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node with id ${nodeId} not found`);
    }

    // Find all edges involving this node
    const edgesToRemove = Array.from(this.edges.values())
      .filter(edge => edge.source === nodeId || edge.target === nodeId);

    // Process each edge
    edgesToRemove.forEach(edge => {
      const otherNodeId = edge.source === nodeId ? edge.target : edge.source;
      const otherNode = this.nodes.get(otherNodeId);
      
      if (otherNode) {
        if (edge.type === RelationType.PARENT_CHILD && edge.source === nodeId) {
          // This node is the parent
          delete otherNode.parentId;
          this.rootNodes.add(otherNodeId);
        }
      }
      
      this.edges.delete(edge.id);
    });

    this.nodes.delete(nodeId);
    this.rootNodes.delete(nodeId);
  }

  addEdge(source: string, target: string, type: RelationType, strength: number): Edge {
    if (!this.nodes.has(source) || !this.nodes.has(target)) {
      throw new Error('Source or target node not found');
    }

    const edge: Edge = {
      id: uuidv4(),
      sessionId: this.nodes.get(source)!.sessionId,
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
      const targetNode = this.nodes.get(target)!;
      targetNode.parentId = source;
      this.rootNodes.delete(target);
    }

    return edge;
  }

  getNode(nodeId: string): Node | undefined {
    return this.nodes.get(nodeId);
  }

  getRootNodes(): Node[] {
    return Array.from(this.rootNodes).map(id => this.nodes.get(id)!);
  }

  getSubtree(rootId: string): Node[] {
    const result: Node[] = [];
    const visited = new Set<string>();

    const traverse = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      
      const node = this.nodes.get(nodeId);
      if (!node) return;

      visited.add(nodeId);
      result.push(node);

      // Find all child relationships
      Array.from(this.edges.values())
        .filter(edge => edge.source === nodeId && edge.type === RelationType.PARENT_CHILD)
        .forEach(edge => traverse(edge.target));
    };

    traverse(rootId);
    return result;
  }

  getVisNetworkData(): GraphData {
    const nodes = Array.from(this.nodes.values()).map(node => ({
      id: node.id,
      label: node.label,
      level: node.level,
      color: node.colour,
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

  findPath(startId: string, endId: string): Node[] {
    const visited = new Set<string>();
    const path: Node[] = [];
    const parentMap = new Map<string, string>();

    const bfs = (startId: string): boolean => {
      const queue: string[] = [startId];
      visited.add(startId);

      while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (currentId === endId) return true;

        Array.from(this.edges.values())
          .filter(edge => edge.source === currentId)
          .forEach(edge => {
            if (!visited.has(edge.target)) {
              queue.push(edge.target);
              visited.add(edge.target);
              parentMap.set(edge.target, currentId);
            }
          });
      }

      return false;
    };

    if (bfs(startId)) {
      let current = endId;
      while (current !== startId) {
        const node = this.nodes.get(current);
        if (!node) break;
        path.unshift(node);
        current = parentMap.get(current)!;
      }
      const startNode = this.nodes.get(startId);
      if (startNode) {
        path.unshift(startNode);
      }
    }

    return path;
  }
}
