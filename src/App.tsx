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
import {
  DEFAULT_ALGORITHM,
  EdgeOptionalYn,
  EdgeProgressType,
  EDGE_ALIGNMENT_TOLERANCE,
} from './edges/EditableEdge/constants';
import { Toolbar } from './components/Toolbar';
import calculateEdgeCornerPoints from './edges/edgeCornerPointsCalculator';
import { EdgePointData } from './edges/EditableEdge/path/linear';

const fitViewOptions = { padding: 0.4 };

// 같은 노드로의 연결을 금지하는 유효성 검사 함수 수정
const isValidConnection = (connection: Connection | EditableEdge) => {
  return connection.source !== connection.target;
};

// 노드 클릭시 포인트 위치 변경 수정
export default function EditableEdgeFlow() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<EditableEdge>(initialEdges);
  const { setIsSourceHandleReconnecting, setIsEdgeActive, setSavedEdgePath } = useAppStore();

  // console.log(edges);

  // 코너 포인트 ID 생성 유틸리티 함수
  const generatePointId = (index: number) => `corner-${index}-${window.crypto.randomUUID().substring(0, 8)}`;

  // 코너 포인트 생성 함수 추출
  const createCornerPoints = useCallback(
    (
      sourceNode: Node,
      targetNode: Node,
      existingPoints: EdgePointData[] | undefined,
      isSourceMoving: boolean,
      isActive: boolean | undefined,
    ) => {
      const sourceNodeWidth = sourceNode.measured?.width ?? 0;
      const points = calculateEdgeCornerPoints({
        fromX: sourceNode.position.x + sourceNodeWidth,
        fromY: sourceNode.position.y + (sourceNode.measured?.height ?? 0) / 2,
        toX: targetNode.position.x,
        toY: targetNode.position.y + (targetNode.measured?.height ?? 0) / 2,
        fromPosition: Position.Right,
        toPosition: Position.Left,
        toNode: targetNode as InternalNode,
        fromNode: sourceNode as InternalNode,
        isActive,
        existingCornerPoints: existingPoints,
        isSourceNodeMoving: isSourceMoving,
      });

      return points.map((point, i) => ({
        ...point,
        id: existingPoints?.[i]?.id || generatePointId(i),
      }));
    },
    [],
  );

  // Edge 업데이트 유틸리티 함수
  const updateEdgeWithPoints = useCallback((edge: EditableEdge, newPoints: EdgePointData[]) => {
    return {
      ...edge,
      data: {
        ...edge.data,
        cornerPoints: newPoints,
        type: edge.data?.type || EdgeProgressType.YES,
        optionalYn: edge.data?.optionalYn || 'N',
      },
    };
  }, []);

  const onNodeDrag = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const nodeId = node.id;
      const updatedEdges = [...edges];
      let edgesChanged = false;

      // 소스 노드 처리
      edges
        .filter((edge) => edge.source === nodeId)
        .forEach((edge) => {
          const targetNode = nodes.find((n) => n.id === edge.target);
          if (!targetNode) return;

          const index = updatedEdges.findIndex((e) => e.id === edge.id);
          if (index === -1) return;

          const newCornerPoints = createCornerPoints(
            node,
            targetNode,
            edge.data?.cornerPoints,
            true,
            edge.data?.isActive,
          );

          updatedEdges[index] = updateEdgeWithPoints(edge, newCornerPoints);
          edgesChanged = true;
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
          if (edge.data?.isActive && (!edge.data?.cornerPoints || edge.data.cornerPoints.length === 0)) {
            return;
          }

          const newCornerPoints = createCornerPoints(
            sourceNode,
            node,
            edge.data?.cornerPoints,
            false,
            edge.data?.isActive,
          );

          updatedEdges[index] = updateEdgeWithPoints(edge, newCornerPoints);
          edgesChanged = true;
        });

      if (edgesChanged) {
        setEdges(updatedEdges);
      }
    },
    [edges, setEdges, nodes, createCornerPoints, updateEdgeWithPoints],
  );

  // 엣지 포인트 정리 함수
  const cleanupAlignedPoints = useCallback((edge: EditableEdge, isSource: boolean) => {
    if (!edge.data?.cornerPoints || edge.data.cornerPoints.length < 2) return null;

    const cornerPoints = [...edge.data.cornerPoints];
    let newCornerPoints = null;

    if (isSource) {
      // 소스 노드: 첫 번째와 두 번째 포인트 확인
      const firstPoint = cornerPoints[0];
      const secondPoint = cornerPoints[1];

      if (Math.abs(firstPoint.y - secondPoint.y) <= EDGE_ALIGNMENT_TOLERANCE) {
        newCornerPoints = cornerPoints.slice(2);
      }
    } else {
      // 타겟 노드: 마지막과 마지막 전 포인트 확인
      const lastIndex = cornerPoints.length - 1;
      const lastPoint = cornerPoints[lastIndex];
      const secondLastPoint = cornerPoints[lastIndex - 1];

      if (Math.abs(lastPoint.y - secondLastPoint.y) <= EDGE_ALIGNMENT_TOLERANCE) {
        newCornerPoints = cornerPoints.slice(0, -2);
      }
    }

    return newCornerPoints;
  }, []);

  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const nodeId = node.id;
      let hasChanges = false;
      const updatedEdges = [...edges];

      // 타겟 노드에 연결된 엣지 처리
      edges
        .filter((edge) => edge.target === nodeId)
        .forEach((edge) => {
          const newCornerPoints = cleanupAlignedPoints(edge, false);
          if (newCornerPoints !== null) {
            const index = updatedEdges.findIndex((e) => e.id === edge.id);
            if (index !== -1) {
              updatedEdges[index] = updateEdgeWithPoints(edge, newCornerPoints);
              hasChanges = true;
            }
          }
        });

      // 소스 노드에 연결된 엣지 처리
      edges
        .filter((edge) => edge.source === nodeId)
        .forEach((edge) => {
          const newCornerPoints = cleanupAlignedPoints(edge, true);
          if (newCornerPoints !== null) {
            const index = updatedEdges.findIndex((e) => e.id === edge.id);
            if (index !== -1) {
              updatedEdges[index] = updateEdgeWithPoints(edge, newCornerPoints);
              hasChanges = true;
            }
          }
        });

      if (hasChanges) {
        setEdges(updatedEdges);
      }
    },
    [edges, setEdges, cleanupAlignedPoints, updateEdgeWithPoints],
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      const { draggingEdgePath } = useAppStore.getState();
      const cornerPoints = draggingEdgePath.slice(1, -1);

      const edge: EditableEdge = {
        ...connection,
        id: `${Date.now()}-${connection.source}-${connection.target}`,
        type: 'editable-edge',
        selected: true,
        reconnectable: true,
        data: {
          isActive: false,
          algorithm: DEFAULT_ALGORITHM,
          cornerPoints: cornerPoints.map(
            (point, index) =>
              ({
                ...point,
                id: generatePointId(index),
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
      const { draggingEdgePath, isSourceHandleReconnecting } = useAppStore.getState();
      let cornerPoints = draggingEdgePath.slice(1, -1);

      // 타겟 핸들에서 리커넥트하는 경우 미들 포인트 순서 반대로 설정
      if (isSourceHandleReconnecting) {
        cornerPoints = cornerPoints.reverse();
      }

      setEdges((els) => {
        const reconnectedEdges = reconnectEdge(oldEdge, newConnection, els);

        return reconnectedEdges.map((e) => {
          if (e.source === newConnection.source && e.target === newConnection.target) {
            return {
              ...e,
              data: {
                ...oldEdge.data,
                cornerPoints: cornerPoints.map(
                  (point, index) =>
                    ({
                      ...point,
                      id: generatePointId(index),
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

  // 키보드 이벤트 처리
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      // Delete 키가 눌렸을 때
      if (event.key === 'Delete' || event.key === 'Backspace') {
        // 선택된 엣지만 필터링하여 제거
        setEdges((eds) => eds.filter((edge) => !edge.selected));
      }
    },
    [setEdges],
  );

  return (
    <ReactFlow
      onReconnectStart={(_event, edge, handleType) => {
        // 현재 재연결 중인 핸들 타입 저장
        setIsSourceHandleReconnecting(handleType === 'target');
        setIsEdgeActive(edge.data?.isActive || false);
        setSavedEdgePath(edge.data?.cornerPoints || []); // 실제 연결선 경로 저장
      }}
      onReconnectEnd={() => {
        // 재연결 작업 종료 시 핸들 타입 상태 재설정
        setIsSourceHandleReconnecting(null);
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
      onNodeDragStop={onNodeDragStop}
      onReconnect={onReconnect}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      connectionMode={ConnectionMode.Loose}
      connectionLineComponent={ConnectionLine}
      isValidConnection={isValidConnection}
      fitView
      fitViewOptions={fitViewOptions}
      onKeyDown={handleKeyDown}
    >
      <Background />
      <Panel position="top-left">
        <Toolbar />
      </Panel>
    </ReactFlow>
  );
}
