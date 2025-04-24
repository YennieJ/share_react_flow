import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  ConnectionMode,
  OnConnect,
  Panel,
  addEdge,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import { initialNodes, nodeTypes, initialEdges, edgeTypes } from './initialElements';
import { useAppStore } from './store';
import { ControlPointData, EditableEdge } from './edges/EditableEdge';
import { ConnectionLine } from './edges/ConnectionLine';
import { Toolbar } from './components/Toolbar';
import { DEFAULT_ALGORITHM } from './edges/EditableEdge/constants';

const fitViewOptions = { padding: 0.4 };

export default function EditableEdgeFlow() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<EditableEdge>(initialEdges);

  const onConnect: OnConnect = useCallback(
    (connection) => {
      const { connectionLinePath } = useAppStore.getState();
      // 선택된 기본 알고리즘을 기반으로 새 엣지 생성
      // 연결 생성 중 사용자가 추가한 모든 컨트롤 포인트를 전송
      const edge: EditableEdge = {
        ...connection,
        id: `${Date.now()}-${connection.source}-${connection.target}`,
        type: 'editable-edge',
        selected: true,
        data: {
          algorithm: DEFAULT_ALGORITHM,
          points: connectionLinePath.map(
            (point, i) =>
              ({
                ...point,
                id: window.crypto.randomUUID(),
                prev: i === 0 ? undefined : connectionLinePath[i - 1],
                active: true,
              } as ControlPointData),
          ),
        },
      };
      setEdges((edges) => addEdge(edge, edges));
    },
    [setEdges],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      connectionMode={ConnectionMode.Loose}
      connectionLineComponent={ConnectionLine}
      fitView
      fitViewOptions={fitViewOptions}
    >
      <Background />
      <Panel position="top-left">
        <Toolbar />
      </Panel>
    </ReactFlow>
  );
}
