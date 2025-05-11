import { type ConnectionLineComponentProps } from '@xyflow/react';
import { useEffect, useMemo } from 'react';

import { getPath } from './EditableEdge';
import { DEFAULT_ALGORITHM } from './EditableEdge/constants';
import { useAppStore } from '../store';
import CustomArrow from './CustomArrow';
import calculateEdgePath from './edgePathCalculator';
// 연결선을 그리는 커스텀 컴포넌트
// 노드 간의 연결을 시각적으로 표시

export function ConnectionLine({
  fromX,
  fromY,
  toX,
  toY,
  toPosition,
  toNode,
  fromPosition,
}: ConnectionLineComponentProps) {
  // useAppStore 훅을 사용하여 상태 접근
  const setConnectionLinePath = useAppStore(
    (state) => state.setConnectionLinePath
  );
  const connectionLinePath = useAppStore((state) => state.connectionLinePath);
  const isReconnectionFromSource = useAppStore(
    (state) => state.isReconnectionFromSource
  );

  // 중간 포인트 계산
  const conerPoints = calculateEdgePath({
    fromX,
    fromY,
    toX,
    toY,
    fromPosition,
    toPosition,
    toNode,
  });

  // 시작 포인트, 중간 포인트들, 끝 포인트를 포함한 전체 경로 포인트
  const allPoints = useMemo(() => {
    return [{ x: fromX, y: fromY }, ...conerPoints, { x: toX, y: toY }];
  }, [fromX, fromY, toX, toY, conerPoints]);

  // 전역 스토어에 경로 저장
  useEffect(() => {
    // 현재 경로와 이전 경로가 다른 경우에만 업데이트
    const isPathChanged =
      JSON.stringify(allPoints) !== JSON.stringify(connectionLinePath);

    if (isPathChanged) {
      setConnectionLinePath(allPoints);
    }
  }, [allPoints, setConnectionLinePath, connectionLinePath]);

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
        markerStart={isReconnectionFromSource ? `url(#${arrowId})` : ``}
        markerEnd={isReconnectionFromSource ? `` : `url(#${arrowId})`}
      />
    </g>
  );
}
