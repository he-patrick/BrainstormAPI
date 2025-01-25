export enum RelationType {
  PARENT_CHILD = 'parent_child',
  RELATED = 'related',
  SUPPORTS = 'supports',
  CONTRADICTS = 'contradicts'
}

export interface Node {
  id: string;
  sessionId: string;
  label: string;
  level: number;
  priority: number;
  parentId?: string;
  colour?: string;
  messageIds: string[];
  metadata: {
    created: string;
    lastUpdated: string;
    confidence: number;
    frequency: number;
  };
}

export interface Edge {
  id: string;
  sessionId: string;
  source: string;
  target: string;
  type: RelationType;
  strength: number;
  metadata: {
    created: string;
    lastUpdated: string;
  };
}

export interface VisNode {
  id: string;
  label: string;
  level: number;
  color?: string;
  size?: number;
}

export interface VisEdge {
  id: string;
  from: string;
  to: string;
  color?: string;
  width?: number;
  dashes?: boolean;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  content: string;
  sender: string;
  timestamp: string;
  platform: 'rocketchat' | 'slack' | 'teams';
  metadata?: Record<string, any>;
}

export interface AnalysisResult {
  nodes: Node[];
  edges: Edge[];
  confidence: number;
  summary?: string;
}

export interface GraphData {
  nodes: VisNode[];
  edges: VisEdge[];
}
