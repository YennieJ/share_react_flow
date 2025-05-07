import { useCallback, useRef } from 'react';
import {
  BaseEdge,
  BuiltInNode,
  useReactFlow,
  useStore,
  type Edge,
  type EdgeProps,
  type XYPosition,
} from '@xyflow/react';

import { ControlPoint, type ControlPointData } from './ControlPoint';
import { getPath, getControlPoints } from './path';
import { Algorithm, COLORS } from './constants';

// 비활성 컨트롤 포인트에 대한 ID를 관리하는 커스텀 훅
// 포인트 배열의 길이가 변경되지 않는 한 동일한 ID를 유지
const useIdsForInactiveControlPoints = (points: ControlPointData[]) => {
  const ids = useRef<string[]>([]);

  if (ids.current.length === points.length) {
    return points.map((point, i) => {
      // ID만 할당하되, 기존 속성(cornerPoints 포함)을 유지
      return point.id ? point : { ...point, id: ids.current[i] };
    });
  } else {
    ids.current = [];

    return points.map((point, i) => {
      if (!point.id) {
        const id = window.crypto.randomUUID();
        ids.current[i] = id;
        // cornerPoints 및 기타 모든 속성 유지
        return { ...point, id: id };
      } else {
        ids.current[i] = point.id;
        // 기존 모든 속성 유지
        return point;
      }
    });
  }
};

// 편집 가능한 엣지의 타입 정의
export type EditableEdge = Edge<{
  algorithm?: Algorithm; // 사용할 알고리즘
  points: ControlPointData[]; // 컨트롤 포인트 배열
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
    (update: (points: ControlPointData[]) => ControlPointData[]) => {
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

  // ID가 할당된 컨트롤 포인트 배열 (cornerPoints 정보 유지)
  const controlPointsWithIds = useIdsForInactiveControlPoints(controlPoints);

  // cornerPoints만 컨트롤 포인트에 추가 (중복 생성 없이)
  const controlPointsToRender = controlPointsWithIds.map((point, index) => {
    // 이미 cornerPoints가 있으면 그대로 유지
    if (point.cornerPoints) {
      return point;
    }

    // 필요한 경우에만 cornerPoints 추가
    if (index > 0 && index < pathPoints.length - 2) {
      return {
        ...point,
        cornerPoints: {
          before: pathPoints[index]
            ? {
                id: `corner-before-${index}`,
                x: pathPoints[index].x,
                y: pathPoints[index].y,
              }
            : undefined,
          after: pathPoints[index + 1]
            ? {
                id: `corner-after-${index}`,
                x: pathPoints[index + 1].x,
                y: pathPoints[index + 1].y,
              }
            : undefined,
        },
      };
    }
    return point;
  });

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
        controlPointsToRender.map((point) => (
          <ControlPoint
            key={point.id}
            setEdgeLinePoints={setEdgeLinePoints}
            color={color}
            cornerPoints={point.cornerPoints}
            {...point}
          />
        ))}
    </>
  );
}

// 엣지가 편집 가능한 엣지인지 확인하는 타입 가드
const isEditableEdge = (edge: Edge): edge is EditableEdge => edge.type === 'editable-edge';
