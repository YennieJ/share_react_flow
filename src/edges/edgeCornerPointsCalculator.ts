import { InternalNode, Node, Position, XYPosition } from '@xyflow/react';
import { useAppStore } from '../store';

interface CalculateConerPointsParams {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  fromPosition?: Position;
  toPosition?: Position;
  toNode: InternalNode<Node> | null;
  fromNode: InternalNode<Node> | null;
  isActive?: boolean;
  existingCornerPoints?: XYPosition[];
  isSourceNodeMoving?: boolean;
}

// 기본 위치 매개변수 타입 (공통 속성)
interface BasePositionParams {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  fromPosition?: Position;
  toPosition?: Position;
  toNode: InternalNode<Node> | null;
  fromNode: InternalNode<Node> | null;
}

// 기본 상수 정의
const OFFSET_X = 10;
const OFFSET_Y = 10;
const THRESHOLD_DISTANCE_FACTOR = 10; // 노드 높이 + 여유공간 계산에 사용

// 미들포인트 계산 헬퍼 함수
const getCenterPosition = (fromX: number, fromY: number, toX: number, toY: number) => ({
  middleX: (fromX + toX) / 2,
  middleY: (fromY + toY) / 2,
});

const calculateEdgeCornerPoints = ({
  fromX,
  fromY,
  toX,
  toY,
  fromPosition,
  toPosition,
  toNode,
  fromNode,
  isActive = false,
  existingCornerPoints = [],
  isSourceNodeMoving = true,
}: CalculateConerPointsParams) => {
  const { isSourceHandleReconnecting } = useAppStore.getState();
  const { middleX, middleY } = getCenterPosition(fromX, fromY, toX, toY);

  // 활성화된 엣지이고 기존 포인트가 있는 경우
  if (isActive && existingCornerPoints?.length > 0) {
    return recalculateActiveCornerPoints({
      fromY,
      toY,
      existingCornerPoints,
      isSourceNodeMoving,
      isSourceHandleReconnecting,
    });
  }

  // 재연결 중이고 소스 노드와 연결된 엣지인 경우
  if (isSourceHandleReconnecting) {
    return recalculateSourceCornerPoints({
      fromX,
      fromY,
      toX,
      toY,
      fromPosition,
      toNode,
      fromNode,
      middleX,
      middleY,
    });
  }

  // 타겟이 소스보다 오른쪽에 있는 경우
  if (toX > fromX) {
    return calculateRightwardCornerPoints({
      fromX,
      fromY,
      toX,
      toY,
      middleX,
      middleY,
    });
  }

  // 타겟이 소스보다 왼쪽에 있는 경우
  return calculateLeftwardCornerPoints({
    fromX,
    fromY,
    toX,
    toY,
    toPosition,
    toNode,
    fromNode,
    middleX,
    middleY,
  });
};

// 활성화된 엣지의 경로를 계산하는 함수
const recalculateActiveCornerPoints = ({
  fromY,
  toY,
  existingCornerPoints,
  isSourceNodeMoving,
  isSourceHandleReconnecting,
}: {
  fromY: number;
  toY: number;
  existingCornerPoints: XYPosition[];
  isSourceNodeMoving: boolean;
  isSourceHandleReconnecting: boolean | null;
}): XYPosition[] => {
  let newCornerPoints = [...existingCornerPoints];

  // 소스 노드 이동 중인 경우
  if (isSourceNodeMoving) {
    // 첫 포인트 Y값 업데이트
    newCornerPoints[0] = { ...newCornerPoints[0], y: fromY };

    if (isSourceHandleReconnecting) {
      if (newCornerPoints.length === 2) {
        // 간단한 경로인 경우
        newCornerPoints[1] = { ...newCornerPoints[1], y: toY };
      } else {
        // 복잡한 경로는 방향 뒤집기
        newCornerPoints = [...newCornerPoints].reverse();
        newCornerPoints[0] = { ...newCornerPoints[0], y: fromY };
        newCornerPoints[newCornerPoints.length - 1] = { ...newCornerPoints[newCornerPoints.length - 1], y: toY };
      }
    }
  } else {
    // 타겟 노드 이동 중인 경우, 마지막 포인트만 업데이트
    const lastIndex = newCornerPoints.length - 1;
    newCornerPoints[lastIndex] = { ...newCornerPoints[lastIndex], y: toY };
  }

  return newCornerPoints;
};

// 소스 노드와 연결된 엣지의 코너 포인트를 계산하는 함수
const recalculateSourceCornerPoints = ({
  fromX,
  fromY,
  toX,
  toY,
  fromPosition,
  toNode,
  middleX,
  middleY,
}: Omit<BasePositionParams, 'toPosition'> & {
  middleX: number;
  middleY: number;
}): XYPosition[] => {
  // 타겟이 소스보다 왼쪽에 있는 경우
  //           -- target
  //          |
  // source --
  if (fromX > toX) {
    return [
      { x: middleX, y: fromY },
      { x: middleX, y: toY },
    ];
  }

  // 소스가 왼쪽 핸들인 경우
  if (fromPosition === 'left') {
    if (toNode) {
      // 타겟 노드가 있는 경우
      //  -- target
      // |
      // -------------
      //             |
      //    source --
      return [
        { x: fromX - OFFSET_X, y: fromY },
        { x: fromX - OFFSET_X, y: middleY },
        { x: toX + OFFSET_X, y: middleY },
        { x: toX + OFFSET_X, y: toY },
      ];
    }

    // 연결 되기 전
    //      --target
    //     |
    //     --------------    source
    return [
      { x: fromX - OFFSET_X, y: fromY },
      { x: fromX - OFFSET_X, y: toY },
    ];
  }

  // 소스가 오른쪽 핸들인 경우
  // target --
  //         |
  //         -----
  //             |
  //    source --
  if (fromPosition === 'right' && toNode) {
    return [
      { x: fromX + OFFSET_X, y: fromY },
      { x: fromX + OFFSET_X, y: middleY },
      { x: toX + OFFSET_X, y: middleY },
      { x: toX + OFFSET_X, y: toY },
    ];
  }

  return [];
};

// 오른쪽으로 드래그 시 포인트 계산
const calculateRightwardCornerPoints = ({
  fromY,
  toY,
  middleX,
}: {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  middleX: number;
  middleY: number;
}): XYPosition[] => {
  // 같은 Y 위치면 중간 포인트 필요 없음
  // source -- target
  if (fromY === toY) {
    return [];
  }

  // 수직으로 꺾이는 경로
  //           -- target
  //          |
  // source --
  return [
    { x: middleX, y: fromY },
    { x: middleX, y: toY },
  ];
};

// 왼쪽으로 드래그할 때 코너 포인트를 계산하는 함수
const calculateLeftwardCornerPoints = ({
  fromX,
  fromY,
  toX,
  toY,
  toPosition,
  toNode,
  fromNode,
  middleY,
}: Omit<BasePositionParams, 'fromPosition'> & {
  middleY: number;
  middleX?: number;
}): XYPosition[] => {
  const fromNodeCenterY = fromNode?.position?.y ?? fromY;
  const toNodeCenterY = toNode?.position?.y ?? toY;
  const yDifference = toNodeCenterY - fromNodeCenterY;
  const fromNodeHeight = fromNode?.measured?.height ?? 0;
  const thresholdDistance = fromNodeHeight + THRESHOLD_DISTANCE_FACTOR;

  // 타겟이 소스와 비슷한 높이거나 약간 아래에 있을 때 (윗쪽 우회 경로)
  //  ----------------------
  // |                     |
  // --target      source--
  if (toNode && yDifference >= 0 && yDifference <= thresholdDistance) {
    const nodeY = fromNode?.position?.y ?? fromY;
    const nodeHeight = fromNode?.measured?.height ?? 0;
    const nodeTop = nodeY - nodeHeight / 2;
    const topMiddleY = (fromY + nodeTop) / 2;

    return [
      { x: fromX + OFFSET_X, y: fromY },
      { x: fromX + OFFSET_X, y: topMiddleY - OFFSET_Y },
      { x: toX - OFFSET_X, y: topMiddleY - OFFSET_Y },
      { x: toX - OFFSET_X, y: toY },
    ];
  }

  // 타겟이 소스보다 위에 있을 때 (타겟 노드 높이에 맞춘 경로)
  //  ----------------------
  // |                     |
  // --target              |
  //               source--
  if (toNode && yDifference < 0 && Math.abs(yDifference) <= thresholdDistance) {
    const toNodeY = toNode?.position?.y ?? toY;

    return [
      { x: fromX + OFFSET_X, y: fromY },
      { x: fromX + OFFSET_X, y: toNodeY - OFFSET_Y },
      { x: toX - OFFSET_X, y: toNodeY - OFFSET_Y },
      { x: toX - OFFSET_X, y: toY },
    ];
  }

  // 타겟 핸들이 왼쪽인 경우
  //  -- target
  // |
  // -------------
  //             |
  //    source --
  if (toNode && toPosition === 'left') {
    return [
      { x: fromX + OFFSET_X, y: fromY },
      { x: fromX + OFFSET_X, y: middleY },
      { x: toX - OFFSET_X, y: middleY },
      { x: toX - OFFSET_X, y: toY },
    ];
  }

  // 소스노드와 멀어진 상태 (연결 전)
  //            target
  //     -----------------
  //                     |
  //            source --
  if (fromX - toX > (fromNode?.measured?.width ?? 0) * 2) {
    return [
      { x: fromX + OFFSET_X, y: fromY },
      { x: fromX + OFFSET_X, y: toY },
    ];
  }

  // 소스노드와 가까운 상태 (연결 전)
  //            target
  //     |
  //     --------
  //             |
  //    source --
  return [
    { x: fromX + OFFSET_X, y: fromY },
    { x: fromX + OFFSET_X, y: middleY },
  ];
};

export default calculateEdgeCornerPoints;
