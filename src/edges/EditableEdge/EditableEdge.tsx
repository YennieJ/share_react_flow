import { useCallback } from 'react';
import {
  BaseEdge,
  BuiltInNode,
  useReactFlow,
  useStore,
  type Edge,
  type EdgeProps,
  type XYPosition,
} from '@xyflow/react';

import { ControlPoint } from './ControlPoint';
import { getPath, getControlPoints } from './path';
import { Algorithm, COLORS } from './constants';
import { LinePointData } from './path/linear';

// 편집 가능한 엣지의 타입 정의
export type EditableEdge = Edge<{
  algorithm?: Algorithm; // 사용할 알고리즘
  points: LinePointData[]; // 컨트롤 포인트 배열
}>;

// 편집 가능한 엣지 컴포넌트
// 노드 간의 연결을 표시하고 컨트롤 포인트를 통해 엣지의 모양을 조정할 수 있음
export function EditableEdgeComponent({
  id,
  selected,
  source,
  sourceX,
  sourceY,
  target,
  targetX,
  targetY,
  markerEnd,
  data = { points: [] },
  ...delegated
}: EdgeProps<EditableEdge>) {
  // 소스와 타겟 노드의 위치 정보
  const sourceOrigin = { x: sourceX, y: sourceY } as XYPosition;
  const targetOrigin = { x: targetX, y: targetY } as XYPosition;

  // 엣지의 색상 설정 (알고리즘에 따라 다름)
  const color = COLORS[data.algorithm ?? Algorithm.Linear];

  // React Flow의 엣지 상태 관리
  const { setEdges } = useReactFlow<BuiltInNode, EditableEdge>();

  // 컨트롤 포인트 표시 여부 결정
  // 엣지가 선택되었거나 연결된 노드가 선택된 경우에만 표시
  const shouldShowPoints = useStore((store) => {
    const sourceNode = store.nodeLookup.get(source)!;
    const targetNode = store.nodeLookup.get(target)!;

    return selected || sourceNode.selected || targetNode.selected;
  });

  // 컨트롤 포인트를 사용해서, 엣지 라인 포인트 업데이트
  const setEdgeLinePoints = useCallback(
    (update: (points: LinePointData[]) => LinePointData[]) => {
      setEdges((edges) =>
        edges.map((e) => {
          if (e.id !== id) return e;
          if (!isEditableEdge(e)) return e;

          // 기존 points 배열에서 업데이트만 적용
          const updatedPoints = update(e.data?.points ?? []);

          const data = { ...e.data, points: updatedPoints };

          return { ...e, data };
        }),
      );
    },
    [id, setEdges],
  );

  // 엣지 경로 생성에 사용될 포인트 배열
  const pathPoints = [sourceOrigin, ...data.points, targetOrigin];

  // 컨트롤 포인트 계산
  const controlPoints = getControlPoints(pathPoints, data.algorithm);

  // 엣지 경로 생성
  const path = getPath(pathPoints, data.algorithm);

  return (
    <>
      {/* 기본 엣지 렌더링 */}
      <BaseEdge
        id={id}
        path={path}
        {...delegated}
        markerEnd={markerEnd}
        style={{
          stroke: color,
        }}
      />

      {/* 컨트롤 포인트 렌더링 */}
      {shouldShowPoints &&
        controlPoints.map((point) => (
          <ControlPoint
            {...point}
            key={point.id}
            setEdgeLinePoints={setEdgeLinePoints}
            color={color}
            cornerPoints={point.cornerPoints}
          />
        ))}
    </>
  );
}

// 엣지가 편집 가능한 엣지인지 확인하는 타입 가드
const isEditableEdge = (edge: Edge): edge is EditableEdge => edge.type === 'editable-edge';
