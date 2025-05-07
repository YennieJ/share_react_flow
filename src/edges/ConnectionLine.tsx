import { type ConnectionLineComponentProps } from '@xyflow/react';
import { useEffect, useMemo } from 'react';

import { getPath } from './EditableEdge';
import { COLORS, DEFAULT_ALGORITHM } from './EditableEdge/constants';
import { useAppStore } from '../store';
// 연결선을 그리는 커스텀 컴포넌트
// 노드 간의 연결을 시각적으로 표시
export function ConnectionLine({ fromX, fromY, toX, toY, toPosition, toNode }: ConnectionLineComponentProps) {
  // useAppStore 훅을 사용하여 상태 접근
  const setConnectionLinePath = useAppStore((state) => state.setConnectionLinePath);

  // 연결 포인트 계산
  const calculateOrthogonalPoints = () => {
    const offsetX = 10; // X축으로 10px 떨어진 거리

    // yennie: 수평인 경우 예외 처리 필요
    // 노드 위치가 수평인 경우 (Y값이 비슷한 경우) - 일직선 연결
    // if (Math.abs(fromY - toY) < 5) {
    //   console.log('수평 연결 감지 (X값 차이 < 5)');
    //   return []; // 중간 포인트 없이 직선 연결
    // }

    // 노드 위치가 수직인 경우 (X값이 비슷한 경우)
    if (Math.abs(fromX - toX) < offsetX) {
      // target --
      //          |
      // source --
      if (toPosition === 'right') {
        // console.log('1');
        const points = [
          { x: fromX + offsetX, y: fromY },
          { x: fromX + offsetX, y: toY },
        ];
        return points;
      }
    }

    // 타겟 노드가 시작 노드의 오른쪽에 있는 경우 (오른쪽으로 드래그)
    if (toX > fromX) {
      // source -- target
      if (fromY === toY) {
        // console.log('2');
        return [];
      }
      //     source--
      //            |
      // target ----
      if (toNode && toPosition === 'right') {
        // console.log('3');
        return [
          { x: fromX + offsetX, y: fromY },
          { x: toX + offsetX, y: toY },
        ];
      }
      //           -- target
      //          |
      // source --
      const middleX = (fromX + toX) / 2;

      return [
        { x: middleX, y: fromY },
        { x: middleX, y: toY },
      ];
    } else {
      // 타겟 노드가 시작 노드의 왼쪽에 있는 경우 (왼쪽으로 드래그)
      const middleY = (fromY + toY) / 2;
      //  -- target
      // |
      // -------------
      //             |
      //    source --
      if (toNode && toPosition === 'left') {
        // console.log('4');
        const points = [
          { x: fromX + offsetX, y: fromY },
          { x: fromX + offsetX, y: middleY },
          { x: toX, y: middleY },
          { x: toX - offsetX, y: toY },
        ];
        return points;
      }
      // target --
      //         |
      //         -----
      //             |
      //    source --
      else if (toNode && toPosition === 'right') {
        // console.log('5');
        const points = [
          { x: fromX + offsetX, y: fromY },
          { x: fromX + offsetX, y: middleY },
          { x: toX + offsetX, y: middleY },
          { x: toX + offsetX, y: toY },
        ];
        return points;
      }

      // 연결되기 전
      //            target
      //     |
      //     --------
      //             |
      //    source --
      const points = [
        { x: fromX + offsetX, y: fromY },
        { x: fromX + offsetX, y: middleY },
        { x: toX, y: middleY },
      ];
      return points;
    }
  };

  // 중간 포인트 계산
  const orthogonalPoints = calculateOrthogonalPoints();

  // 시작점, 중간점들, 끝점을 포함한 전체 경로 포인트
  const allPoints = useMemo(() => {
    return [{ x: fromX, y: fromY }, ...orthogonalPoints, { x: toX, y: toY }];
  }, [fromX, fromY, toX, toY, orthogonalPoints]);

  // 전역 스토어에 경로 저장
  useEffect(() => {
    setConnectionLinePath(allPoints);
  }, [allPoints, setConnectionLinePath]);

  // 경로 생성
  const path = getPath(allPoints, DEFAULT_ALGORITHM);

  // SVG 경로 렌더링
  return (
    <g>
      <path fill="none" stroke={COLORS[DEFAULT_ALGORITHM]} d={path} />
    </g>
  );
}
