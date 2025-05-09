import { Node } from '@xyflow/react';

import { EditableEdge, EditableEdgeComponent } from './edges/EditableEdge';
import { CustomNode } from './nodes/CustomNode';
import { Algorithm, ProgressEdgeType } from './edges/EditableEdge/constants';

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
      points: [],
      type: ProgressEdgeType.ALL,
    },
  },
];

// export const initialEdges: EditableEdge[] = [
//   {
//     id: '3->4',
//     type: 'editable-edge',
//     source: '3',
//     target: '4',
//     sourceHandle: 'right',
//     targetHandle: 'left',
//     animated: false,
//     data: {
//       algorithm: Algorithm.Linear,
//       points: [
//         {
//           x: 100,
//           y: 175,
//           id: 'spline-964fc95f-2399-4a62-9dd1-3a5d66a5459a',
//         },
//         {
//           x: 100,
//           y: 125,
//           id: 'spline-51c08f0b-3092-4e2e-834a-2d71d8d5c396',
//         },
//         {
//           x: 150,
//           y: 125,
//           id: 'spline-d53c4828-09c0-4387-92d7-7d72e0ceda7a',
//         },
//         {
//           x: 150,
//           y: 225,
//           id: 'spline-0c24fc20-d285-4868-a3d8-730a5f2c683d',
//         },
//         {
//           x: 200,
//           y: 225,
//           id: 'spline-4349d5d7-62fc-4b66-99a4-f6760081c1a8',
//         },
//         {
//           x: 200,
//           y: 175,
//           id: 'spline-f4cba410-811e-4620-894f-12804138f104',
//         },
//       ],
//     },
//   },
// ];
