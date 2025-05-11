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
  Panel,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import {
  initialNodes,
  nodeTypes,
  initialEdges,
  edgeTypes,
} from './initialElements';
import { useAppStore } from './store';
import { ControlPointData, EditableEdge } from './edges/EditableEdge';
import { ConnectionLine } from './edges/ConnectionLine';
import {
  DEFAULT_ALGORITHM,
  EdgeOptionalYn,
  EdgeProgressType,
} from './edges/EditableEdge/constants';
import { Toolbar } from './components/Toolbar';

const fitViewOptions = { padding: 0.4 };

// 같은 노드로의 연결을 금지하는 유효성 검사 함수 수정
const isValidConnection = (connection: Connection | EditableEdge) => {
  return connection.source !== connection.target;
};

// 노드 클릭시 포인트 위치 변경 수정
export default function EditableEdgeFlow() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] =
    useEdgesState<EditableEdge>(initialEdges);
  // console.log(edges);

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
    [edges, setEdges]
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      const { connectionLinePath } = useAppStore.getState();
      const cornerPoints = connectionLinePath.slice(1, -1);

      // 선택된 기본 알고리즘을 기반으로 새 엣지 생성
      // 연결 생성 중 사용자가 추가한 모든 컨트롤 포인트를 전송
      const edge: EditableEdge = {
        ...connection,
        id: `${Date.now()}-${connection.source}-${connection.target}`,
        type: 'editable-edge',
        selected: true,
        reconnectable: true,

        data: {
          algorithm: DEFAULT_ALGORITHM,
          points: cornerPoints.map(
            (point, index) =>
              ({
                ...point,
                id: `corner-${index}-${window.crypto
                  .randomUUID()
                  .substring(0, 8)}`,
              } as ControlPointData)
          ),
          type: EdgeProgressType.YES,
          optionalYn: 'N',
        },
      };
      setEdges((edges) => addEdge(edge, edges));
    },
    [setEdges]
  );

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      const { connectionLinePath, isReconnectionFromSource } =
        useAppStore.getState();
      let cornerPoints = connectionLinePath.slice(1, -1);

      // 타겟 핸들에서 리커넥트하는 경우 미들 포인트 순서 반대로 설정
      if (isReconnectionFromSource) {
        cornerPoints = cornerPoints.reverse();
      }

      setEdges((els) => {
        // 기존 엣지 데이터와 새 연결 정보 결합
        const reconnectedEdges = reconnectEdge(oldEdge, newConnection, els);

        // 새로 생성된 엣지 찾기 (일반적으로 새 연결 정보와 소스/타겟이 일치하는 엣지)
        return reconnectedEdges.map((e) => {
          // 새로 생성된 엣지 (소스와 타겟이 newConnection과 일치)
          if (
            e.source === newConnection.source &&
            e.target === newConnection.target
          ) {
            return {
              ...e,
              data: {
                ...oldEdge.data, // 기존 데이터 보존
                points: cornerPoints.map(
                  (point, index) =>
                    ({
                      ...point,
                      id: `corner-${index}-${window.crypto
                        .randomUUID()
                        .substring(0, 8)}`,
                    } as ControlPointData)
                ),
                type: oldEdge.data?.type as EdgeProgressType,
                optionalYn: oldEdge.data?.optionalYn as EdgeOptionalYn,
              },
            } as EditableEdge;
          }
          return e as EditableEdge;
        });
      });
    },
    [setEdges]
  );
  const { setIsReconnectionFrommSource } = useAppStore();

  return (
    <ReactFlow
      onReconnectStart={(event, edge, handleType) => {
        // 현재 재연결 중인 핸들 타입 저장
        setIsReconnectionFrommSource(handleType === 'target');
      }}
      onReconnectEnd={() => {
        // 재연결 작업 종료 시 핸들 타입 상태 재설정
        setIsReconnectionFrommSource(null);
      }}
      className="validationflow"
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
      isValidConnection={isValidConnection}
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
