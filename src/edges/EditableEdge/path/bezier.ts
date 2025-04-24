import { Position } from '@xyflow/react';

// 이 코드는 라이브러리에서 직접 가져온 것으로,
// 베지어 곡선의 컨트롤 포인트를 계산하는 데 사용됩니다.
// 이 컨트롤 포인트는 catmull-rom 컨트롤 포인트로 변환되어
// 편집 가능한 베지어 곡선을 생성하는 데 사용됩니다.

// 컨트롤 포인트의 오프셋을 계산하는 함수
// distance: 두 점 사이의 거리
// curvature: 곡률 계수 (곡선의 굽은 정도를 조절)
function calculateControlOffset(distance: number, curvature: number): number {
  // 거리가 양수인 경우 (일반적인 경우)
  if (distance >= 0) {
    return 0.5 * distance; // 거리의 절반을 오프셋으로 사용
  }

  // 거리가 음수인 경우 (특수한 경우)
  // 음수 거리의 제곱근에 곡률을 곱하여 오프셋 계산
  return curvature * 25 * Math.sqrt(-distance);
}

// 주어진 위치와 곡률을 기반으로 컨트롤 포인트의 좌표를 계산하는 함수
// pos: 노드의 위치 (Left, Right, Top, Bottom)
// x1, y1: 시작점의 좌표
// x2, y2: 끝점의 좌표
// c: 곡률 계수
export function getControlWithCurvature(
  pos: Position,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  c: number,
): [number, number] {
  // 노드의 위치에 따라 적절한 컨트롤 포인트 계산
  switch (pos) {
    case Position.Left:
      // 왼쪽 위치: x축 방향으로 오프셋 적용
      return [x1 - calculateControlOffset(x1 - x2, c), y1];
    case Position.Right:
      // 오른쪽 위치: x축 방향으로 오프셋 적용
      return [x1 + calculateControlOffset(x2 - x1, c), y1];
    case Position.Top:
      // 상단 위치: y축 방향으로 오프셋 적용
      return [x1, y1 - calculateControlOffset(y1 - y2, c)];
    case Position.Bottom:
      // 하단 위치: y축 방향으로 오프셋 적용
      return [x1, y1 + calculateControlOffset(y2 - y1, c)];
  }
}
