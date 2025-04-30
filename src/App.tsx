import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  ConnectionMode,
  OnConnect,
  addEdge,
  reconnectEdge,
  useEdgesState,
  useNodesState,
  Node,
  Edge,
  Connection,
  MarkerType,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import { initialNodes, nodeTypes, initialEdges, edgeTypes } from './initialElements';
import { useAppStore } from './store';
import { ControlPointData, EditableEdge } from './edges/EditableEdge';
import { ConnectionLine } from './edges/ConnectionLine';
import { DEFAULT_ALGORITHM } from './edges/EditableEdge/constants';

const fitViewOptions = { padding: 0.4 };

// 노드 클릭시 포인트 위치 변경 수정
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
        reconnectable: true,
        markerEnd: {
          type: MarkerType.Arrow,
          width: 20,
          height: 20,
          color: '#FF0072',
        },
        data: {
          algorithm: DEFAULT_ALGORITHM,
          points: connectionLinePath.map(
            (point, i) =>
              ({
                ...point,
                id: window.crypto.randomUUID(),
                prev: i === 0 ? undefined : connectionLinePath[i - 1],
              } as ControlPointData),
          ),
        },
      };
      setEdges((edges) => addEdge(edge, edges));
    },
    [setEdges],
  );

  const onNodeDrag = useCallback(
    (_, node: Node) => {
      // 드래그 중인 노드 ID 가져오기
      const nodeId = node.id;

      // 엣지 목록 복사
      const updatedEdges = [...edges];
      let edgesChanged = false;
      // 소스 노드로 사용된 경우 (엣지의 시작점)
      const sourceEdges = edges.filter((edge) => edge.source === nodeId);

      if (sourceEdges.length > 0) {
        sourceEdges.forEach((edge) => {
          if (edge.data && edge.data.points && edge.data.points.length > 0) {
            const updatedEdge = {
              ...edge,
              data: {
                ...edge.data,
                points: [...edge.data.points],
              },
            };

            // 첫 번째 포인트의 y만 업데이트하고 x는 유지
            updatedEdge.data.points[0] = {
              ...updatedEdge.data.points[0],
              y: node.position.y + (node.measured?.height ?? 0) / 2,
            };

            // 변경된 엣지로 교체
            const index = updatedEdges.findIndex((e) => e.id === edge.id);
            if (index !== -1) {
              updatedEdges[index] = updatedEdge;
              edgesChanged = true;
            }
          }
        });
      }

      // 타겟 노드로 사용된 경우 (엣지의 끝점)
      const targetEdges = edges.filter((edge) => edge.target === nodeId);

      if (targetEdges.length > 0) {
        targetEdges.forEach((edge) => {
          if (edge.data && edge.data.points && edge.data.points.length > 0) {
            const lastIndex = edge.data.points.length - 1;

            const updatedEdge = {
              ...edge,
              data: {
                ...edge.data,
                points: [...edge.data.points],
              },
            };

            // 마지막 포인트의 y만 업데이트하고 x는 유지
            updatedEdge.data.points[lastIndex] = {
              ...updatedEdge.data.points[lastIndex],
              y: node.position.y + (node.measured?.height ?? 0) / 2,
            };

            // 변경된 엣지로 교체
            const index = updatedEdges.findIndex((e) => e.id === edge.id);
            if (index !== -1) {
              updatedEdges[index] = updatedEdge;
              edgesChanged = true;
            }
          }
        });
      }

      // 변경사항이 있으면 엣지 업데이트
      if (edgesChanged) {
        setEdges(updatedEdges);
      }
    },
    [edges, setEdges],
  );

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      setEdges((els) => {
        // 기존 엣지 데이터 보존
        const edge = reconnectEdge(oldEdge, newConnection, els);

        // EditableEdge 타입으로 변환하여 기존 데이터 유지
        return edge.map((e) => {
          if (e.id === oldEdge.id) {
            return {
              ...e,
              data: {
                ...oldEdge.data, // 기존 데이터 보존
                ...e.data, // 새 데이터 병합
              },
            } as EditableEdge;
          }
          return e as EditableEdge;
        });
      });
    },
    [setEdges],
  );

  return (
    <ReactFlow
      snapToGrid={false}
      snapGrid={[1, 1]}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeDrag={onNodeDrag}
      onReconnect={onReconnect}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      connectionMode={ConnectionMode.Loose}
      connectionLineComponent={ConnectionLine}
      fitView
      fitViewOptions={fitViewOptions}
    >
      <Background />
    </ReactFlow>
  );
}
