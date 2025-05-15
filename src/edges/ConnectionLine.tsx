import { type ConnectionLineComponentProps } from '@xyflow/react';
import { useEffect, useMemo } from 'react';

import { getPath } from './EditableEdge';
import { DEFAULT_ALGORITHM } from './EditableEdge/constants';
import { useAppStore } from '../store';
import CustomArrow from './CustomArrow';
import calculateEdgeCornerPoints from './edgeCornerPointsCalculator';
// 연결선을 그리는 커스텀 컴포넌트
// 노드 간의 연결을 시각적으로 표시

// yennie: 커넥션 라인에서 리커넥션 중 isActive를 확인해서 노드와 움직임을 같게 만들어야함
export function ConnectionLine({
  fromX,
  fromY,
  toX,
  toY,
  toPosition,
  toNode,
  fromPosition,
  fromNode,
}: ConnectionLineComponentProps) {
  // useAppStore 훅을 사용하여 상태 접근
  const setDraggingEdgePath = useAppStore((state) => state.setDraggingEdgePath);
  const draggingEdgePath = useAppStore((state) => state.draggingEdgePath);
  const savedEdgePath = useAppStore((state) => state.savedEdgePath);
  const isSourceHandleReconnecting = useAppStore((state) => state.isSourceHandleReconnecting);
  const isEdgeActive = useAppStore((state) => state.isEdgeActive);
  // 리커넥션 중인지 여부 확인
  const isReconnecting = isSourceHandleReconnecting !== null;

  // 중간 포인트 계산
  const cornerPoints = calculateEdgeCornerPoints({
    fromX,
    fromY,
    toX,
    toY,
    fromPosition,
    toPosition,
    toNode,
    fromNode,
    isActive: isEdgeActive, // 리커넥션 중에는 isActive를 true로 전달하여 기존 로직을 활용
    existingCornerPoints: isReconnecting ? savedEdgePath : [], // 리커넥션 중이면 기존 포인트 전달
    isSourceNodeMoving: isSourceHandleReconnecting === true, // 소스 노드에서 리커넥션 중인지 여부
  });

  // 시작 포인트, 중간 포인트들, 끝 포인트를 포함한 전체 경로 포인트
  const allPoints = useMemo(() => {
    return [{ x: fromX, y: fromY }, ...cornerPoints, { x: toX, y: toY }];
  }, [fromX, fromY, toX, toY, cornerPoints]);

  // 전역 스토어에 경로 저장
  useEffect(() => {
    // 현재 경로와 이전 경로가 다른 경우에만 업데이트
    const isPathChanged = JSON.stringify(allPoints) !== JSON.stringify(draggingEdgePath);

    if (isPathChanged) {
      setDraggingEdgePath(allPoints);
    }
  }, [allPoints, setDraggingEdgePath, draggingEdgePath]);

  // 경로 생성
  const path = getPath(allPoints, DEFAULT_ALGORITHM);
  const arrowId = `${fromY}-${toX}-${toY}`;

  // SVG 경로 렌더링
  return (
    <g>
      <defs>
        <CustomArrow id={arrowId} color={'black'} strokeWidth={2} />
      </defs>
      <path
        fill="none"
        stroke={'black'}
        d={path}
        markerStart={isSourceHandleReconnecting ? `url(#${arrowId})` : ``}
        markerEnd={isSourceHandleReconnecting ? `` : `url(#${arrowId})`}
      />
    </g>
  );
}
