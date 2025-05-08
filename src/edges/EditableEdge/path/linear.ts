import type { ControlPointData } from '../ControlPoint';
import type { XYPosition } from '@xyflow/react';

export type LinePointData = XYPosition & {
  id: string;
};

// 경로 포인트 계산 로직을 재사용 가능한 함수로 분리
function calculatePathPoints(points: (LinePointData | XYPosition)[]) {
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
      { x: middleX, y: start.y, id: `corner-0-${window.crypto.randomUUID().substring(0, 8)}` },
      { x: middleX, y: end.y, id: `corner-1-${window.crypto.randomUUID().substring(0, 8)}` },
    ];
    return [start, ...cornerPoints, end];
  }

  // 포인트가 3개 이상인 경우 그대로 사용
  return points;
}

// 직선 경로를 생성하는 함수 (수평, 수직선만 허용)
// points: 직선을 구성하는 포인트 배열
export function getLinearPath(points: (LinePointData | XYPosition)[]) {
  if (points.length < 1) return '';

  const pathPoints = calculatePathPoints(points);

  // SVG 경로 시작점 설정
  let path = `M ${pathPoints[0].x} ${pathPoints[0].y}`;

  // 각 포인트를 수평 또는 수직선으로 연결
  for (let i = 1; i < pathPoints.length; i++) {
    const prev = pathPoints[i - 1];
    const current = pathPoints[i];

    // 수평선과 수직선 처리 통합
    if (prev.x !== current.x) {
      path += ` L ${current.x} ${prev.y}`;
    }
    if (prev.y !== current.y) {
      path += ` L ${current.x} ${current.y}`;
    }
  }

  return path;
}

// 직선 경로의 컨트롤 포인트를 계산하는 함수
export function getLinearControlPoints(points: (LinePointData | XYPosition)[]) {
  const controlPoints = [] as ControlPointData[];

  // calculatePathPoints를 먼저 호출하여 실제 경로 포인트 계산
  const pathPoints = calculatePathPoints(points);

  // 첫 번째와 마지막 포인트를 제외한 인접 포인트 쌍에 대해 컨트롤 포인트 생성
  for (let i = 1; i < pathPoints.length - 2; i++) {
    const current = pathPoints[i];
    const next = pathPoints[i + 1];

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
                id: current.id,
                x: current.x,
                y: current.y,
              }
            : undefined,
        after:
          'id' in next
            ? {
                id: next.id,
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
