import { InternalNode, Node, Position, XYPosition } from '@xyflow/react';
import { useAppStore } from '../store';

interface CalculateEdgePathParams {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  fromPosition?: Position;
  toPosition?: Position;
  toNode: InternalNode<Node> | null;
  isActive?: boolean;
  existingPoints?: XYPosition[];
  isSourceNodeMoving?: boolean;
}

interface CalculateCornerPointsParams {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  toPosition?: Position;
  fromPosition?: Position;
  toNode: InternalNode<Node> | null;
  offsetX: number;
  middleX: number;
  middleY: number;
}

const calculateEdgePath = ({
  fromX,
  fromY,
  toX,
  toY,
  fromPosition,
  toPosition,
  toNode,
  isActive = false,
  existingPoints = [],
  isSourceNodeMoving = true,
}: CalculateEdgePathParams) => {
  const { isReconnectionFromSource } = useAppStore.getState();

  const offsetX = 10; // X축으로 10px 떨어진 거리
  const middleX = (fromX + toX) / 2;
  const middleY = (fromY + toY) / 2;

  if (isActive && existingPoints && existingPoints.length > 0) {
    const newPoints = [...existingPoints];

    if (isSourceNodeMoving) {
      // 소스 노드가 이동 중인 경우: 첫 번째 포인트의 Y값만 업데이트
      newPoints[0] = {
        ...newPoints[0],
        y: fromY,
      };
    } else {
      // 타겟 노드가 이동 중인 경우: 마지막 포인트의 Y값만 업데이트
      const lastIndex = newPoints.length - 1;
      newPoints[lastIndex] = {
        ...newPoints[lastIndex],
        y: toY,
      };
    }

    return newPoints;
  }

  // isActive가 false이거나 기존 포인트가 없는 경우: 기존 코너 포인트 계산 로직
  // source -- target
  if (fromY === toY) {
    return [];
  }

  // 재연결 중이고 소스 노드와 연결된 엣지인 경우
  if (isReconnectionFromSource) {
    return calculateCornerPointsFromSource({
      fromX,
      fromY,
      toX,
      toY,
      fromPosition,
      toNode,
      offsetX,
      middleX,
      middleY,
    });
  }

  // 일반적인 연결 & 재연결 중 타겟 노드가 소스 노드보다 오른쪽에 있는 경우 (오른쪽으로 드래그)
  //           -- target
  //          |
  // source --
  if (toX > fromX) {
    return [
      { x: middleX, y: fromY },
      { x: middleX, y: toY },
    ];
  }
  // 일반적인 연결 & 재연결 중 타겟 노드가 소스 노드보다 왼쪽에 있는 경우 (왼쪽으로 드래그)
  return calculateLeftDragCornerPoints({
    fromX,
    fromY,
    toX,
    toY,
    toPosition,
    toNode,
    offsetX,
    middleY,
    middleX,
  });
};

// 소스 노드와 연결된 엣지의 코너 포인트를 계산하는 함수
const calculateCornerPointsFromSource = ({
  fromX,
  fromY,
  toX,
  toY,
  fromPosition,
  toNode,
  offsetX,
  middleX,
  middleY,
}: CalculateCornerPointsParams): XYPosition[] => {
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
    //  -- target
    // |
    // -------------
    //             |
    //    source --
    if (toNode) {
      return [
        { x: fromX - offsetX, y: fromY },
        { x: fromX - offsetX, y: middleY },
        { x: toX + offsetX, y: middleY },
        { x: toX + offsetX, y: toY },
      ];
    }

    // 연결 되기 전
    //      --target
    //     |
    //     --------------    source
    return [
      { x: fromX - offsetX, y: fromY },
      { x: fromX - offsetX, y: toY },
    ];
  }

  // target --
  //         |
  //         -----
  //             |
  //    source --
  if (fromPosition === 'right' && toNode) {
    return [
      { x: fromX + offsetX, y: fromY },
      { x: fromX + offsetX, y: middleY },
      { x: toX + offsetX, y: middleY },
      { x: toX + offsetX, y: toY },
    ];
  }
  return [];
};

// 왼쪽으로 드래그할 때 코너 포인트를 계산하는 함수
const calculateLeftDragCornerPoints = ({
  fromX,
  fromY,
  toX,
  toY,
  toPosition,
  toNode,
  offsetX,
  middleY,
}: CalculateCornerPointsParams): XYPosition[] => {
  //  -- target
  // |
  // -------------
  //             |
  //    source --
  if (toNode && toPosition === 'left') {
    return [
      { x: fromX + offsetX, y: fromY },
      { x: fromX + offsetX, y: middleY },
      { x: toX - offsetX, y: middleY },
      { x: toX - offsetX, y: toY },
    ];
  }

  // 연결되기 전 (타겟이 핸들에 붙지 않은 상태)
  // 연결되기 전
  //            target
  //     |
  //     --------
  //             |
  //    source --
  return [
    { x: fromX + offsetX, y: fromY },
    { x: fromX + offsetX, y: middleY },
    { x: toX, y: middleY },
  ];
};

export default calculateEdgePath;
