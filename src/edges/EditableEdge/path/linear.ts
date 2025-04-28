import type { ControlPointData } from '../ControlPoint';
import type { XYPosition } from '@xyflow/react';

// 직선 경로를 생성하는 함수 (수평, 수직선만 허용)
// points: 직선을 구성하는 포인트 배열
export function getLinearPath(points: (ControlPointData | XYPosition)[]) {
  // 포인트가 없는 경우 빈 경로 반환
  if (points.length < 1) return '';

  let pathPoints: XYPosition[] = [];

  // 포인트가 2개인 경우 (소스노드와 타겟노드만 있는 경우)
  if (points.length === 2) {
    const [start, end] = points;
    // 중간 포인트 계산 (ConnectionLine 방식과 동일)
    const middleX = (start.x + end.x) / 2;
    const middlePoints = [
      { x: middleX, y: start.y },
      { x: middleX, y: end.y },
    ];

    // 전체 포인트 배열 재구성
    pathPoints = [start, ...middlePoints, end];
  } else {
    pathPoints = [...points];
  }

  // SVG 경로 시작점 설정
  let path = `M ${pathPoints[0].x} ${pathPoints[0].y}`;

  // 각 포인트를 수평 또는 수직선으로 연결
  for (let i = 1; i < pathPoints.length; i++) {
    const prev = pathPoints[i - 1];
    const current = pathPoints[i];

    // x 좌표가 다르면 수평선, y 좌표가 다르면 수직선으로 연결
    if (prev.x !== current.x) {
      // 수평선: y 좌표는 유지하고 x 좌표만 변경
      path += ` L ${current.x} ${prev.y}`;
    }
    if (prev.y !== current.y) {
      // 수직선: x 좌표는 유지하고 y 좌표만 변경
      path += ` L ${current.x} ${current.y}`;
    }
  }

  return path;
}

// 직선 경로의 컨트롤 포인트를 계산하는 함수
export function getLinearControlPoints(points: (ControlPointData | XYPosition)[]) {
  const controlPoints = [] as ControlPointData[];

  // 계단식 경로 포인트 계산 (getLinearPath와 동일한 로직)
  let pathPoints: XYPosition[] = [];

  if (points.length === 2) {
    const [start, end] = points;
    const middleX = (start.x + end.x) / 2;
    const middlePoints = [
      { x: middleX, y: start.y, id: `corner-0-${window.crypto.randomUUID().substring(0, 8)}` },
      { x: middleX, y: end.y, id: `corner-1-${window.crypto.randomUUID().substring(0, 8)}` },
    ];

    // 전체 경로 포인트
    pathPoints = [start, ...middlePoints, end];

    // 각 선분마다 컨트롤 포인트 생성
    for (let i = 0; i < pathPoints.length - 1; i++) {
      const current = pathPoints[i];
      const next = pathPoints[i + 1];

      // 두 점 사이의 중간 지점 계산
      const controlPointX = (current.x + next.x) / 2;
      const controlPointY = (current.y + next.y) / 2;

      // 컨트롤 포인트 생성 (꺽임 포인트 정보 추가)
      const controlPoint: ControlPointData = {
        id: `spline-${i}-${window.crypto.randomUUID().substring(0, 8)}`,
        x: controlPointX,
        y: controlPointY,
        cornerPoints: {
          before:
            i > 0
              ? {
                  id: 'id' in pathPoints[i - 1] ? (pathPoints[i - 1] as ControlPointData).id : `generated-${i - 1}`,
                  x: pathPoints[i - 1].x,
                  y: pathPoints[i - 1].y,
                }
              : undefined,
          after:
            i < pathPoints.length - 2
              ? {
                  id: 'id' in pathPoints[i + 2] ? (pathPoints[i + 2] as ControlPointData).id : `generated-${i + 2}`,
                  x: pathPoints[i + 2].x,
                  y: pathPoints[i + 2].y,
                }
              : undefined,
        },
      };

      controlPoints.push(controlPoint);
    }
  } else if (points.length > 2) {
    // 3개 이상의 포인트가 이미 있는 경우, 각 인접 포인트 사이에 컨트롤 포인트 생성
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];

      const controlPointX = (current.x + next.x) / 2;
      const controlPointY = (current.y + next.y) / 2;

      // cornerPoints 정보 추가
      const controlPoint: ControlPointData = {
        id: `spline-${i}-${window.crypto.randomUUID().substring(0, 8)}`,
        x: controlPointX,
        y: controlPointY,
        cornerPoints: {
          before:
            i > 0
              ? {
                  id: 'id' in points[i] ? (points[i] as ControlPointData).id : `point-${i}`,
                  x: points[i].x,
                  y: points[i].y,
                }
              : undefined,
          after:
            i < points.length - 2
              ? {
                  id: 'id' in points[i + 1] ? (points[i + 1] as ControlPointData).id : `point-${i + 1}`,
                  x: points[i + 1].x,
                  y: points[i + 1].y,
                }
              : undefined,
        },
      };

      controlPoints.push(controlPoint);
    }
  }

  return controlPoints;
}
