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
  fromNode: InternalNode<Node> | null;
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
  fromNode: InternalNode<Node> | null;
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
  fromNode,
  isActive = false,
  existingPoints = [],
  isSourceNodeMoving = true,
}: CalculateEdgePathParams) => {
  const { isReconnectionFromSource } = useAppStore.getState();

  const offsetX = 10; // X축으로 10px 떨어진 거리
  const middleX = (fromX + toX) / 2;
  const middleY = (fromY + toY) / 2;

  // 활성화된 엣지이고 기존 포인트가 있는 경우
  if (isActive && existingPoints?.length > 0) {
    return calculateActiveEdgePath({
      fromY,
      toY,
      existingPoints,
      isSourceNodeMoving,
      isReconnectionFromSource,
    });
  }

  // 재연결 중이고 소스 노드와 연결된 엣지인 경우
  if (isReconnectionFromSource) {
    // console.log('케이스 3: 소스 노드에서 재연결 중');
    return calculateCornerPointsFromSource({
      fromX,
      fromY,
      toX,
      toY,
      fromPosition,
      toNode,
      fromNode,
      offsetX,
      middleX,
      middleY,
    });
  }

  // 일반적인 연결 & 재연결 중 타겟 노드가 소스 노드보다 오른쪽에 있는 경우 (오른쪽으로 드래그)

  if (toX > fromX) {
    // console.log('케이스 4: 타겟이 소스보다 오른쪽에 있음');

    // source -- target
    if (fromY === toY) {
      // console.log('케이스 2: 소스와 타겟이 같은 Y축 위치');
      return [];
    }

    //           -- target
    //          |
    // source --
    return [
      { x: middleX, y: fromY },
      { x: middleX, y: toY },
    ];
  }
  // 일반적인 연결 & 재연결 중 타겟 노드가 소스 노드보다 왼쪽에 있는 경우 (왼쪽으로 드래그)
  // console.log('케이스 5: 타겟이 소스보다 왼쪽에 있음');
  return calculateLeftDragCornerPoints({
    fromX,
    fromY,
    toX,
    toY,
    toPosition,
    toNode,
    fromNode,
    offsetX,
    middleY,
    middleX,
  });
};

// 활성화된 엣지의 경로를 계산하는 함수
const calculateActiveEdgePath = ({
  fromY,
  toY,
  existingPoints,
  isSourceNodeMoving,
  isReconnectionFromSource,
}: {
  fromY: number;
  toY: number;
  existingPoints: XYPosition[];
  isSourceNodeMoving: boolean;
  isReconnectionFromSource: boolean | null;
}): XYPosition[] => {
  let newPoints = [...existingPoints];

  // 소스 노드 이동 중인 경우
  if (isSourceNodeMoving) {
    // 기본적으로 첫 포인트의 Y값은 항상 업데이트
    newPoints[0] = {
      ...newPoints[0],
      y: fromY,
    };

    if (isReconnectionFromSource) {
      // 포인트가 두 개인 경우 (간단한 경로)
      if (newPoints.length === 2) {
        newPoints[1] = {
          ...newPoints[1],
          y: toY,
        };
      } else {
        newPoints = [...newPoints].reverse();
        newPoints[0] = {
          ...newPoints[0],
          y: fromY,
        };

        // 마지막 포인트(원래 첫번째)는 toY로 업데이트
        newPoints[newPoints.length - 1] = {
          ...newPoints[newPoints.length - 1],
          y: toY,
        };
      }
    }
  }
  // 타겟 노드 이동 중인 경우
  else {
    // 마지막 포인트의 Y값만 업데이트
    const lastIndex = newPoints.length - 1;
    newPoints[lastIndex] = {
      ...newPoints[lastIndex],
      y: toY,
    };
  }

  return newPoints;
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
    // console.log('케이스 3-1: 소스가 타겟보다 오른쪽에 있음');
    return [
      { x: middleX, y: fromY },
      { x: middleX, y: toY },
    ];
  }

  // 소스가 왼쪽 핸들인 경우
  if (fromPosition === 'left') {
    // console.log('케이스 3-2: 소스가 왼쪽 핸들');
    //  -- target
    // |
    // -------------
    //             |
    //    source --
    if (toNode) {
      // console.log('케이스 3-2-1: 타겟 노드 존재');
      return [
        { x: fromX - offsetX, y: fromY },
        { x: fromX - offsetX, y: middleY },
        { x: toX + offsetX, y: middleY },
        { x: toX + offsetX, y: toY },
      ];
    }

    // 연결 되기 전
    // console.log('케이스 3-2-2: 타겟 노드 없음');
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
    // console.log('케이스 3-3: 소스가 오른쪽 핸들이고 타겟 노드 존재');
    return [
      { x: fromX + offsetX, y: fromY },
      { x: fromX + offsetX, y: middleY },
      { x: toX + offsetX, y: middleY },
      { x: toX + offsetX, y: toY },
    ];
  }
  // console.log('케이스 3-4: 기타 케이스');
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
  fromNode,
  offsetX,
  middleY,
}: CalculateCornerPointsParams): XYPosition[] => {
  // source -- target
  if (fromY === toY) {
    // 노드의 상단 값 계산
    const nodeY = fromNode?.position?.y ?? fromY;
    const nodeHeight = fromNode?.measured?.height ?? 0;
    const nodeTop = nodeY - nodeHeight / 2;
    const middleY = (fromY + nodeTop) / 2;
    const offsetY = 10;
    // yennie: x도 비교해서 아래로도 만들어질 수 있게하자
    return [
      { x: fromX + offsetX, y: fromY },
      { x: fromX + offsetX, y: middleY - offsetY },
      { x: toX - offsetX, y: middleY - offsetY },
      { x: toX - offsetX, y: toY },
    ];
  }
  //  -- target
  // |
  // -------------
  //             |
  //    source --
  if (toNode && toPosition === 'left') {
    // console.log('케이스 5-1: 타겟 노드가 있고 왼쪽 핸들');
    return [
      { x: fromX + offsetX, y: fromY },
      { x: fromX + offsetX, y: middleY },
      { x: toX - offsetX, y: middleY },
      { x: toX - offsetX, y: toY },
    ];
  }

  // 연결되기 전 (타겟이 핸들에 붙지 않은 상태)
  // 소스노드와 멀어진 상태
  //            target
  //     --------
  //             |
  //    source --
  if (fromX - toX > (fromNode?.measured?.width ?? 0) * 2) {
    return [
      { x: fromX + offsetX, y: fromY },
      { x: fromX + offsetX, y: toY },
    ];
  }

  // 소스노드와 가까운 상태
  //            target
  //     |
  //     --------
  //             |
  //    source --
  return [
    { x: fromX + offsetX, y: fromY },
    { x: fromX + offsetX, y: middleY },
    // { x: toX, y: middleY },
  ];
};

export default calculateEdgePath;
