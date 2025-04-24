import type { ControlPointData } from '../ControlPoint';
import { Position, type XYPosition } from '@xyflow/react';

import { isControlPoint } from './utils';
import { getControlWithCurvature } from './bezier';

// Catmull-Rom 스플라인 곡선의 SVG 경로를 생성하는 함수
// points: 곡선을 구성하는 포인트 배열
// bezier: 베지어 곡선으로 변환할지 여부
// sides: 시작점과 끝점의 위치 정보
export function getCatmullRomPath(
  points: XYPosition[],
  bezier = false,
  sides = { fromSide: Position.Left, toSide: Position.Right },
) {
  if (points.length < 2) return '';

  // SVG 경로 시작점 설정
  let path = `M ${points[0].x} ${points[0].y}`;

  // 각 세그먼트에 대한 베지어 곡선 컨트롤 포인트 계산
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];

    // 시작점과 끝점의 가상 컨트롤 포인트 계산
    const p0 = points[i - 1] ?? (bezier ? calculateBezierP0(p1, p2, sides.fromSide) : p1);

    const p3 = points[i + 2] ?? (bezier ? calculateBezierP3(p1, p2, sides.toSide) : p2);

    // Catmull-Rom 스플라인의 베지어 컨트롤 포인트 계산
    const b1 = {
      x: (-p0.x + 6 * p1.x + p2.x) / 6,
      y: (-p0.y + 6 * p1.y + p2.y) / 6,
    };

    const b2 = {
      x: (p1.x + 6 * p2.x - p3.x) / 6,
      y: (p1.y + 6 * p2.y - p3.y) / 6,
    };

    // SVG 경로에 베지어 곡선 세그먼트 추가
    path += ` C ${b1.x} ${b1.y}, ${b2.x} ${b2.y}, ${p2.x} ${p2.y}`;
  }

  return path;
}

// Catmull-Rom 스플라인의 컨트롤 포인트를 계산하는 함수
// points: 곡선을 구성하는 포인트 배열
// bezier: 베지어 곡선으로 변환할지 여부
// sides: 시작점과 끝점의 위치 정보
export function getCatmullRomControlPoints(
  points: (ControlPointData | XYPosition)[],
  bezier = false,
  sides = { fromSide: Position.Left, toSide: Position.Right },
) {
  const controlPoints: ControlPointData[] = [];

  // 마지막 포인트는 타겟 핸들의 XYPosition이므로 제외
  // 하지만 마지막 컨트롤 포인트 계산에는 필요
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];

    // 시작점과 끝점의 가상 컨트롤 포인트 계산
    const p0 = points[i - 1] ?? (bezier ? calculateBezierP0(p1, p2, sides.fromSide) : p1);

    const p3 = points[i + 2] ?? (bezier ? calculateBezierP3(p1, p2, sides.toSide) : p2);

    // 소스와 타겟 핸들은 컨트롤 포인트로 포함하지 않음
    if (isControlPoint(p1)) {
      controlPoints.push(p1);
    }

    // 중간 컨트롤 포인트 계산 및 추가
    controlPoints.push({
      id: '',
      active: false,
      x: q(p0.x, p1.x, p2.x, p3.x),
      y: q(p0.y, p1.y, p2.y, p3.y),
    });
  }

  return controlPoints;
}

// UTILS -----------------------------------------------------------------------

// 베지어 곡선의 시작점 가상 컨트롤 포인트 계산
function calculateBezierP0(p1: XYPosition, p2: XYPosition, side: Position) {
  const c1 = getControlWithCurvature(side, p1.x, p1.y, p2.x, p2.y, 0.25);
  return { x: p2.x + 6 * (p1.x - c1[0]), y: p2.y + 6 * (p1.y - c1[1]) };
}

// 베지어 곡선의 끝점 가상 컨트롤 포인트 계산
function calculateBezierP3(p1: XYPosition, p2: XYPosition, side: Position) {
  const c2 = getControlWithCurvature(side, p2.x, p2.y, p1.x, p1.y, 0.25);
  return { x: p1.x + 6 * (p2.x - c2[0]), y: p1.y + 6 * (p2.y - c2[1]) };
}

// Catmull-Rom 스플라인의 중간점 계산
// p0, p1, p2, p3: 컨트롤 포인트
// t: 중간점의 위치 (0~1 사이의 값)
function q(p0: number, p1: number, p2: number, p3: number, t = 0.5) {
  const alpha = 0.5; // 장력 계수
  const t2 = t ** 2;
  const t3 = t ** 3;

  // Catmull-Rom 스플라인 공식 적용
  return alpha * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}
