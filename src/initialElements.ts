import { Node } from '@xyflow/react';

import { EditableEdge, EditableEdgeComponent } from './edges/EditableEdge';
import { CustomNode } from './nodes/CustomNode';
import { Algorithm } from './edges/EditableEdge/constants';

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

export const initialEdges: EditableEdge[] = [
  {
    id: '3->4',
    type: 'editable-edge',
    source: '3',
    target: '2',
    sourceHandle: 'right',
    targetHandle: 'left',
    animated: false,
    data: {
      algorithm: Algorithm.Linear,
      points: [
        {
          x: 150,
          y: 28,
          id: 'spline-964fc95f-2399-4a62-9dd1-3a5d66a5459a',
          active: true,
        },
      ],
    },
  },
];
