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
  Position,
  InternalNode,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import { initialNodes, nodeTypes, initialEdges, edgeTypes } from './initialElements';
import { useAppStore } from './store';
import { ControlPointData, EditableEdge } from './edges/EditableEdge';
import { ConnectionLine } from './edges/ConnectionLine';
import { DEFAULT_ALGORITHM, EdgeOptionalYn, EdgeProgressType } from './edges/EditableEdge/constants';
import { Toolbar } from './components/Toolbar';
import calculateEdgeCornerPoints from './edges/edgeCornerPointsCalculator';
import { LinePointData } from './edges/EditableEdge/path/linear';

const fitViewOptions = { padding: 0.4 };

// 같은 노드로의 연결을 금지하는 유효성 검사 함수 수정
const isValidConnection = (connection: Connection | EditableEdge) => {
  return connection.source !== connection.target;
};

// 노드 클릭시 포인트 위치 변경 수정
export default function EditableEdgeFlow() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<EditableEdge>(initialEdges);
  // console.log(edges);

  const onNodeDrag = useCallback(
    (_, node: Node) => {
      const nodeId = node.id;
      const updatedEdges = [...edges];
      let edgesChanged = false;

      // 공통 함수: edge 업데이트 로직 통합
      const updateEdge = (edge: EditableEdge, newPoints: LinePointData[], index: number) => {
        const updatedEdge = {
          ...edge,
          data: {
            ...edge.data,
            points: newPoints,
            type: edge.data?.type || EdgeProgressType.YES,
            optionalYn: edge.data?.optionalYn || 'N',
          },
        };

        updatedEdges[index] = updatedEdge;
        return true;
      };

      // 소스 노드 처리
      edges
        .filter((edge) => edge.source === nodeId)
        .forEach((edge) => {
          const toNode = nodes.find((n) => n.id === edge.target);

          if (!toNode) return;

          const index = updatedEdges.findIndex((e) => e.id === edge.id);
          if (index === -1) return;

          const nodeWidth = node.measured?.width ?? 0;
          const cornerPoints = calculateEdgeCornerPoints({
            fromX: node.position.x + nodeWidth,
            fromY: node.position.y + (node.measured?.height ?? 0) / 2,
            toX: toNode.position.x,
            toY: toNode.position.y + (toNode.measured?.height ?? 0) / 2,
            fromPosition: Position.Right,
            toPosition: Position.Left,
            toNode: toNode as InternalNode,
            fromNode: node as InternalNode,
            isActive: edge.data?.isActive,
            existingPoints: edge.data?.points,
            isSourceNodeMoving: true,
          });

          const newPoints = cornerPoints.map((point, i) => ({
            ...point,
            id: edge.data?.points?.[i]?.id || `corner-${i}-${window.crypto.randomUUID().substring(0, 8)}`,
          }));

          edgesChanged = updateEdge(edge, newPoints, index) || edgesChanged;
        });

      // 타겟 노드 처리
      edges
        .filter((edge) => edge.target === nodeId)
        .forEach((edge) => {
          const sourceNode = nodes.find((n) => n.id === edge.source);
          if (!sourceNode) return;

          const index = updatedEdges.findIndex((e) => e.id === edge.id);
          if (index === -1) return;

          // 타겟 노드가 이동 중일 때 points가 없으면 처리하지 않음
          if (edge.data?.isActive && (!edge.data?.points || edge.data.points.length === 0)) {
            return;
          }

          const sourceNodeWidth = sourceNode.measured?.width ?? 0;
          const cornerPoints = calculateEdgeCornerPoints({
            fromX: sourceNode.position.x + sourceNodeWidth,
            fromY: sourceNode.position.y + (sourceNode.measured?.height ?? 0) / 2,
            toX: node.position.x,
            toY: node.position.y + (node.measured?.height ?? 0) / 2,
            fromPosition: Position.Right,
            toPosition: Position.Left,
            toNode: node as InternalNode,
            fromNode: sourceNode as InternalNode,
            isActive: edge.data?.isActive,
            existingPoints: edge.data?.points,
            isSourceNodeMoving: false,
          });

          const newPoints = cornerPoints.map((point, i) => ({
            ...point,
            id: edge.data?.points?.[i]?.id || `corner-${i}-${window.crypto.randomUUID().substring(0, 8)}`,
          }));

          edgesChanged = updateEdge(edge, newPoints, index) || edgesChanged;
        });

      if (edgesChanged) {
        setEdges(updatedEdges);
      }
    },
    [edges, setEdges, nodes],
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
          isActive: false,
          algorithm: DEFAULT_ALGORITHM,
          points: cornerPoints.map(
            (point, index) =>
              ({
                ...point,
                id: `corner-${index}-${window.crypto.randomUUID().substring(0, 8)}`,
              } as ControlPointData),
          ),
          type: EdgeProgressType.YES,
          optionalYn: 'N',
        },
      };
      setEdges((edges) => addEdge(edge, edges));
    },
    [setEdges],
  );

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      const { connectionLinePath, isReconnectionFromSource } = useAppStore.getState();
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
          if (e.source === newConnection.source && e.target === newConnection.target) {
            return {
              ...e,
              data: {
                ...oldEdge.data, // 기존 데이터 보존
                points: cornerPoints.map(
                  (point, index) =>
                    ({
                      ...point,
                      id: `corner-${index}-${window.crypto.randomUUID().substring(0, 8)}`,
                    } as ControlPointData),
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
    [setEdges],
  );
  const { setIsReconnectionFrommSource, setIsEdgeActive, setRealPath } = useAppStore();

  return (
    <ReactFlow
      onReconnectStart={(event, edge, handleType) => {
        // 현재 재연결 중인 핸들 타입 저장
        setIsReconnectionFrommSource(handleType === 'target');
        setIsEdgeActive(edge.data?.isActive || false);
        setRealPath(edge.data?.points || []); // 실제 연결선 경로 저장
      }}
      onReconnectEnd={() => {
        // 재연결 작업 종료 시 핸들 타입 상태 재설정
        setIsReconnectionFrommSource(null);
        setIsEdgeActive(false);
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
