import { Node } from '@xyflow/react';

import { EditableEdge, EditableEdgeComponent } from './edges/EditableEdge';
import { CustomNode } from './nodes/CustomNode';

export const nodeTypes = {
  custom: CustomNode,
};

export const initialNodes: Node[] = [
  {
    id: '1',
    type: 'custom',
    data: {},
    position: { x: 0, y: 0 },
  },
  {
    id: '2',
    type: 'custom',
    data: {},
    position: { x: 250, y: 0 },
  },
  {
    id: '3',
    type: 'custom',
    data: {},
    position: { x: 0, y: 150 },
  },
  {
    id: '4',
    type: 'custom',
    data: {},
    position: { x: 250, y: 150 },
  },
];

export const CustomEdgeType = EditableEdgeComponent;

export const edgeTypes = {
  'editable-edge': EditableEdgeComponent,
};

// 초기 엣지 목록 포인트 없음
export const initialEdges: EditableEdge[] = [];
