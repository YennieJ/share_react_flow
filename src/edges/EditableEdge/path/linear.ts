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
  }
  // 컨트롤 포인트가 있는 경우
  else if (points.length === 3) {
    const [start, controlPoint, end] = points;

    // 컨트롤 포인트에서 꺾이는 지점 정보 가져오기
    const cp = controlPoint as ControlPointData;

    if (cp.cornerPoints && cp.cornerPoints.length === 2) {
      // 꺾이는 지점을 포함한 전체 경로
      pathPoints = [start, cp.cornerPoints[0], cp.cornerPoints[1], end];
    } else {
      // 꺾이는 지점이 없는 경우 기본 경로 (중간점 계산)
      const middleX = (start.x + end.x) / 2;
      pathPoints = [start, { x: middleX, y: start.y }, { x: middleX, y: end.y }, end];
    }
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
// points: 직선을 구성하는 포인트 배열
export function getLinearControlPoints(points: (ControlPointData | XYPosition)[]) {
  const controlPoints = [] as ControlPointData[];

  // 꺾이는 지점을 찾아 컨트롤 포인트 생성
  // 두 점만 있는 경우(시작점, 끝점) 계단식 중간점 생성
  if (points.length === 2) {
    const [start, end] = points;
    const middleX = (start.x + end.x) / 2;

    // 중간에 하나의 컨트롤 포인트만 생성 (두 꺾이는 지점 사이)
    const controlPointX = middleX;
    const controlPointY = (start.y + end.y) / 2;

    // 컨트롤 포인트 생성
    const controlPoint: ControlPointData = {
      id: `spline-${window.crypto.randomUUID()}`,
      x: controlPointX,
      y: controlPointY,
      // 꺾이는 지점의 정보 저장 (컨트롤 포인트가 이동할 때 함께 이동시키기 위함)
      cornerPoints: [
        { x: middleX, y: start.y }, // 첫 번째 꺾이는 지점
        { x: middleX, y: end.y }, // 두 번째 꺾이는 지점
      ],
    };

    controlPoints.push(controlPoint);
  }

  return controlPoints;
}
