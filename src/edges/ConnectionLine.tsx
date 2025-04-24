import { MarkerType, type ConnectionLineComponentProps } from '@xyflow/react';

import { getPath } from './EditableEdge';
import { COLORS, DEFAULT_ALGORITHM } from './EditableEdge/constants';

// 연결선을 그리는 커스텀 컴포넌트
// 노드 간의 연결을 시각적으로 표시
export function ConnectionLine({ fromX, fromY, toX, toY, connectionStatus }: ConnectionLineComponentProps) {
  // 3선 연결 포인트 계산
  const calculateOrthogonalPoints = () => {
    // 수평 거리의 중간점 계산
    const middleX = (fromX + toX) / 2;

    // 중간 포인트 생성
    const middlePoint1 = { x: middleX, y: fromY };
    const middlePoint2 = { x: middleX, y: toY };

    // 시작점과 끝점을 제외한 중간 포인트만 반환
    return [middlePoint1, middlePoint2];
  };

  // 시작점, 중간점들, 끝점을 포함한 전체 경로 포인트
  const allPoints = [{ x: fromX, y: fromY }, ...calculateOrthogonalPoints(), { x: toX, y: toY }];

  // 경로 생성
  const path = getPath(allPoints, DEFAULT_ALGORITHM);

  // SVG 경로 렌더링
  return (
    <g>
      <path
        fill="none"
        stroke={COLORS[DEFAULT_ALGORITHM]}
        strokeWidth={2}
        className={connectionStatus === 'valid' ? '' : 'animated'}
        d={path}
        markerStart={MarkerType.ArrowClosed}
        markerWidth={25}
        markerEnd={MarkerType.ArrowClosed}
      />
    </g>
  );
}
