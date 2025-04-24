import { type XYPosition } from '@xyflow/react';
import type { ControlPointData } from '../ControlPoint';

import { getLinearPath, getLinearControlPoints } from './linear';
import { Algorithm } from '../constants';

// 주어진 알고리즘에 따라 컨트롤 포인트를 계산하는 함수
// points: 곡선을 구성하는 포인트 배열
// algorithm: 사용할 알고리즘 (Linear, CatmullRom, BezierCatmullRom)
// sides: 시작점과 끝점의 위치 정보
export function getControlPoints(points: (ControlPointData | XYPosition)[], algorithm: Algorithm = Algorithm.Linear) {
  switch (algorithm) {
    // 직선 경로의 컨트롤 포인트 계산
    case Algorithm.Linear:
      return getLinearControlPoints(points);
  }
}

// 주어진 알고리즘에 따라 SVG 경로를 생성하는 함수
// points: 곡선을 구성하는 포인트 배열
// algorithm: 사용할 알고리즘 (Linear, CatmullRom, BezierCatmullRom)
// sides: 시작점과 끝점의 위치 정보
export function getPath(points: XYPosition[], algorithm: Algorithm = Algorithm.Linear) {
  switch (algorithm) {
    // 직선 경로 생성
    case Algorithm.Linear:
      return getLinearPath(points);
  }
}
