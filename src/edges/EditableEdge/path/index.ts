import { type XYPosition, Position } from '@xyflow/react';
import type { ControlPointData } from '../ControlPoint';

import { getLinearPath, getLinearControlPoints } from './linear';
import { getCatmullRomPath, getCatmullRomControlPoints } from './catmull-rom';
import { Algorithm } from '../constants';

// 주어진 알고리즘에 따라 컨트롤 포인트를 계산하는 함수
// points: 곡선을 구성하는 포인트 배열
// algorithm: 사용할 알고리즘 (Linear, CatmullRom, BezierCatmullRom)
// sides: 시작점과 끝점의 위치 정보
export function getControlPoints(
  points: (ControlPointData | XYPosition)[],
  algorithm: Algorithm = Algorithm.BezierCatmullRom,
  sides = { fromSide: Position.Left, toSide: Position.Right },
) {
  switch (algorithm) {
    // 직선 경로의 컨트롤 포인트 계산
    case Algorithm.Linear:
      return getLinearControlPoints(points);

    // Catmull-Rom 스플라인의 컨트롤 포인트 계산
    case Algorithm.CatmullRom:
      return getCatmullRomControlPoints(points);

    // 베지어 변환된 Catmull-Rom 스플라인의 컨트롤 포인트 계산
    case Algorithm.BezierCatmullRom:
      return getCatmullRomControlPoints(points, true, sides);
  }
}

// 주어진 알고리즘에 따라 SVG 경로를 생성하는 함수
// points: 곡선을 구성하는 포인트 배열
// algorithm: 사용할 알고리즘 (Linear, CatmullRom, BezierCatmullRom)
// sides: 시작점과 끝점의 위치 정보
export function getPath(
  points: XYPosition[],
  algorithm: Algorithm = Algorithm.BezierCatmullRom,
  sides = { fromSide: Position.Left, toSide: Position.Right },
) {
  switch (algorithm) {
    // 직선 경로 생성
    case Algorithm.Linear:
      return getLinearPath(points);

    // Catmull-Rom 스플라인 경로 생성
    case Algorithm.CatmullRom:
      return getCatmullRomPath(points);

    // 베지어 변환된 Catmull-Rom 스플라인 경로 생성
    case Algorithm.BezierCatmullRom:
      return getCatmullRomPath(points, true, sides);
  }
}
