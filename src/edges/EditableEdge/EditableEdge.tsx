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
import { Algorithm, DASHED_STYLE, EDGE_COLORS, EdgeProgressType, EdgeOptionalYn } from './constants';
import { CornerPointData } from './path/linear';
import CustomArrow from '../CustomArrow';

// 편집 가능한 엣지의 타입 정의
export type EditableEdge = Edge<{
  label?: string; // 엣지 레이블
  isActive?: boolean; // 엣지 활성 여부
  algorithm?: Algorithm; // 사용할 알고리즘
  cornerPoints: CornerPointData[]; // 컨트롤 포인트 배열
  type: EdgeProgressType; // 엣지 타입 (이제 이넘 타입)
  optionalYn: EdgeOptionalYn; // 엣지 선택 여부
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
  data = { cornerPoints: [], type: EdgeProgressType.YES, optionalYn: 'Y' },
  ...delegated
}: EdgeProps<EditableEdge>) {
  // 소스와 타겟 노드의 위치 정보
  const sourceOrigin = { x: sourceX, y: sourceY } as XYPosition;
  const targetOrigin = { x: targetX, y: targetY } as XYPosition;

  // 엣지의 색상 설정 (알고리즘에 따라 다름)
  const color = EDGE_COLORS[data.type as EdgeProgressType];

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
  const updateEdgePath = useCallback(
    (update: (cornerPoints: CornerPointData[]) => CornerPointData[]) => {
      setEdges((edges) =>
        edges.map((edge) => {
          if (edge.id !== id) return edge;
          if (!isEditableEdge(edge)) return edge;

          // 기존 points 배열에서 업데이트만 적용
          const updatedCornerPoints = update(edge.data?.cornerPoints ?? []);

          const data = {
            ...edge.data,
            cornerPoints: updatedCornerPoints,
            type: edge.data?.type as EdgeProgressType,
            optionalYn: edge.data?.optionalYn as EdgeOptionalYn,
            isActive: true,
          };

          return { ...edge, data };
        }),
      );
    },
    [id, setEdges],
  );

  // 엣지 경로 생성에 사용될 포인트 배열
  const pathPoints = [sourceOrigin, ...data.cornerPoints, targetOrigin];

  // 컨트롤 포인트 계산
  const controlPoints = getControlPoints(pathPoints, data.algorithm);

  // 엣지 경로 생성
  const path = getPath(pathPoints, data.algorithm);

  return (
    <>
      <CustomArrow id={id} color={color} strokeWidth={2} />
      {/* 기본 엣지 렌더링 */}
      <BaseEdge
        id={id}
        path={path}
        {...delegated}
        markerEnd={`url(#${id})`}
        style={{
          stroke: color,
          strokeDasharray: data.optionalYn === 'Y' ? DASHED_STYLE : undefined, // 점선 스타일 적용
        }}
      />

      {/* 컨트롤 포인트 렌더링 */}
      {shouldShowPoints &&
        controlPoints.map((point) => (
          <ControlPoint
            {...point}
            key={point.id}
            updateEdgePath={updateEdgePath}
            color={color}
            cornerPoints={point.cornerPoints}
          />
        ))}
    </>
  );
}

// 엣지가 편집 가능한 엣지인지 확인하는 타입 가드
const isEditableEdge = (edge: Edge): edge is EditableEdge => edge.type === 'editable-edge';
