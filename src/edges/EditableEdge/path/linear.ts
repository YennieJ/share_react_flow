import type { ControlPointData } from '../ControlPoint';
import type { XYPosition } from '@xyflow/react';

export type EdgePointData = XYPosition & {
  id: string;
};

// 경로 포인트 계산 로직을 재사용 가능한 함수로 분리
// yennie: 하위호환성을 위한 로직임
function legacyPathPointsCalculator(points: (EdgePointData | XYPosition)[]) {
  if (points.length < 2) return [];

  if (points.length === 2) {
    const [start, end] = points;
    // y값이 같은 경우 중간 포인트 없이 직선으로 연결
    if (start.y === end.y) {
      return [start, end];
    }

    // y값이 다른 경우 중간 포인트 2개 생성
    const middleX = (start.x + end.x) / 2;
    const cornerPoints = [
      {
        x: middleX,
        y: start.y,
        id: `corner-0-${window.crypto.randomUUID().substring(0, 8)}`,
      },
      {
        x: middleX,
        y: end.y,
        id: `corner-1-${window.crypto.randomUUID().substring(0, 8)}`,
      },
    ];
    return [start, ...cornerPoints, end];
  }

  // 포인트가 3개 이상인 경우 그대로 사용
  return points;
}

const CORNER_RADIUS = 5; // 모서리 반경 설정

// 굴곡진 직선 경로를 생성하는 함수 (수평, 수직선만 허용)
export function getSmoothElbowPath(points: (EdgePointData | XYPosition)[]) {
  if (points.length < 1) return '';

  const rawPathPoints = legacyPathPointsCalculator(points);

  // 중복된 연속 좌표 제거 (예: x, y 동일한 연속 포인트)
  const pathPoints = rawPathPoints.filter((p, i, arr) => {
    if (i === 0) return true;
    const prev = arr[i - 1];
    return p.x !== prev.x || p.y !== prev.y;
  });

  if (pathPoints.length < 2) return '';

  let path = `M ${pathPoints[0].x} ${pathPoints[0].y}`;

  for (let i = 1; i < pathPoints.length - 1; i++) {
    const prev = pathPoints[i - 1];
    const curr = pathPoints[i];
    const next = pathPoints[i + 1];

    const dx1 = curr.x - prev.x;
    const dy1 = curr.y - prev.y;
    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;

    const len1 = Math.sqrt(dx1 ** 2 + dy1 ** 2);
    const len2 = Math.sqrt(dx2 ** 2 + dy2 ** 2);

    const offset1 = Math.min(CORNER_RADIUS, len1 / 2);
    const offset2 = Math.min(CORNER_RADIUS, len2 / 2);

    const startX = curr.x - (dx1 / len1) * offset1;
    const startY = curr.y - (dy1 / len1) * offset1;
    const endX = curr.x + (dx2 / len2) * offset2;
    const endY = curr.y + (dy2 / len2) * offset2;

    path += ` L ${startX} ${startY} Q ${curr.x} ${curr.y} ${endX} ${endY}`;
  }

  // 마지막 포인트로 직선 연결 (중복된 좌표가 아닌 경우에만)
  const last = pathPoints[pathPoints.length - 1];
  const secondLast = pathPoints[pathPoints.length - 2];
  if (last.x !== secondLast.x || last.y !== secondLast.y) {
    path += ` L ${last.x} ${last.y}`;
  }

  return path;
}

// 직선 경로의 컨트롤 포인트를 계산하는 함수
export function getLinearControlPoints(points: (EdgePointData | XYPosition)[]) {
  const controlPoints = [] as ControlPointData[];

  // calculatePathPoints를 먼저 호출하여 실제 경로 포인트 계산
  const pathPoints = legacyPathPointsCalculator(points);

  // 첫 번째와 마지막 포인트를 제외한 인접 포인트 쌍에 대해 컨트롤 포인트 생성
  for (let i = 1; i < pathPoints.length - 2; i++) {
    const current = pathPoints[i];
    const next = pathPoints[i + 1];

    // 포인트가 정확히 4개인 경우에만 Y값 차이 검사
    // yennie: 꼭 4개인 경우에만 생성이 되어져야하는지는 확인이 필요함
    if (pathPoints.length === 4 && Math.abs(current.y - next.y) < 1) {
      continue;
    }

    // 두 점 사이의 중간 지점 계산
    const controlPointX = (current.x + next.x) / 2;
    const controlPointY = (current.y + next.y) / 2;

    // 컨트롤 포인트 생성
    const controlPoint: ControlPointData = {
      id: `control-point-${i}-${window.crypto.randomUUID().substring(0, 8)}`,
      x: controlPointX,
      y: controlPointY,
      cornerPoints: {
        before:
          'id' in current
            ? {
                id: String(current.id),
                x: current.x,
                y: current.y,
              }
            : undefined,
        after:
          'id' in next
            ? {
                id: String(next.id),
                x: next.x,
                y: next.y,
              }
            : undefined,
      },
    };

    controlPoints.push(controlPoint);
  }

  return controlPoints;
}
