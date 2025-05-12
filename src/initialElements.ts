import { Node } from '@xyflow/react';

import { EditableEdge, EditableEdgeComponent } from './edges/EditableEdge';
import { CustomNode } from './nodes/CustomNode';
import { Algorithm, EdgeProgressType } from './edges/EditableEdge/constants';

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
      isActive: true,
      algorithm: Algorithm.Linear,
      points: [],
      type: EdgeProgressType.YES,
      optionalYn: 'N',
    },
  },
];
// export const initialEdges: EditableEdge[] = [
//   {
//     id: '3->4',
//     type: 'editable-edge',
//     source: '3',
//     target: '1',
//     sourceHandle: 'right',
//     targetHandle: 'left',
//     animated: false,
//     data: {
//       isActive: true,
//       algorithm: Algorithm.Linear,
//       points: [
//         {
//           x: 61.79999923706055,
//           y: 176,
//           id: 'corner-0-a28a79c3',
//         },
//         {
//           x: 61.79999923706055,
//           y: 101,
//           id: 'corner-1-a28a79c3',
//         },
//         {
//           x: -9.799999952316284,
//           y: 101,
//           id: 'corner-2-a28a79c3',
//         },
//         {
//           x: -9.799999952316284,
//           y: 26,
//           id: 'corner-3-a28a79c3',
//         },
//       ],
//       type: EdgeProgressType.YES,
//       optionalYn: 'N',
//     },
//   },
// ];
