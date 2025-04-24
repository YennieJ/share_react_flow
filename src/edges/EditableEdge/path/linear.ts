import type { ControlPointData } from '../ControlPoint';
import type { XYPosition } from '@xyflow/react';

import { isControlPoint } from './utils';

// 직선 경로를 생성하는 함수 (수평, 수직선만 허용)
// points: 직선을 구성하는 포인트 배열
export function getLinearPath(points: XYPosition[]) {
  if (points.length < 1) return '';

  // SVG 경로 시작점 설정
  let path = `M ${points[0].x} ${points[0].y}`;

  // 각 포인트를 수평 또는 수직선으로 연결
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const current = points[i];

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

  // 각 세그먼트의 중간점을 컨트롤 포인트로 추가
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];

    // 기존 컨트롤 포인트가 있다면 유지
    if (isControlPoint(p1)) {
      controlPoints.push(p1);
    }

    // 수평/수직 경로의 중간 지점 계산
    let midX = p1.x;
    let midY = p1.y;

    if (p1.x !== p2.x) {
      // 수평선의 중간점
      midX = (p1.x + p2.x) / 2;
      midY = p1.y;
    } else if (p1.y !== p2.y) {
      // 수직선의 중간점
      midX = p1.x;
      midY = (p1.y + p2.y) / 2;
    }

    // 중간 지점에 새로운 컨트롤 포인트 추가
    controlPoints.push({
      prev: 'id' in p1 ? p1.id : undefined, // 이전 포인트의 ID 설정
      id: `spline-${window.crypto.randomUUID()}`, // 고유 ID 생성
      active: false, // 기본적으로 비활성 상태
      x: midX, // 수평/수직 경로의 중간 x 좌표
      y: midY, // 수평/수직 경로의 중간 y 좌표
    });
  }

  return controlPoints;
}
