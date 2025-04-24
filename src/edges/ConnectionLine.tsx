import { useEffect, useState } from 'react';
import { MarkerType, type ConnectionLineComponentProps } from '@xyflow/react';

import { useAppStore } from '../store';
import { getPath } from './EditableEdge';
import { Algorithm, COLORS, DEFAULT_ALGORITHM } from './EditableEdge/constants';

// 자유 그리기 모드에서 포인트 간의 최소 거리 설정
// 알고리즘에 따라 다른 거리값을 사용
const DISTANCE = DEFAULT_ALGORITHM === Algorithm.BezierCatmullRom ? 50 : 25;

// 연결선을 그리는 커스텀 컴포넌트
// 노드 간의 연결을 시각적으로 표시하고 자유 그리기 기능을 제공
export function ConnectionLine({
  fromX,
  fromY,
  toX,
  toY,
  fromPosition,
  toPosition,
  connectionStatus,
}: ConnectionLineComponentProps) {
  // 연결선 경로와 상태 관리를 위한 스토어 훅
  const { connectionLinePath, setConnectionLinePath } = useAppStore();
  // 자유 그리기 모드 상태 관리
  const [freeDrawing, setFreeDrawing] = useState(false);

  // 마지막 포인트와 현재 커서 위치 사이의 거리 계산
  const prev = connectionLinePath[connectionLinePath.length - 1] ?? {
    x: fromX,
    y: fromY,
  };
  const distance = Math.hypot(prev.x - toX, prev.y - toY);
  // 자유 그리기 모드에서 최소 거리 이상일 때만 새 포인트 추가
  const shouldAddPoint = freeDrawing && distance > DISTANCE;

  // 자유 그리기 모드에서 새 포인트 추가 효과
  useEffect(() => {
    if (shouldAddPoint) {
      setConnectionLinePath([...connectionLinePath, { x: toX, y: toY }]);
    }
  }, [connectionLinePath, setConnectionLinePath, shouldAddPoint, toX, toY]);

  // 스페이스바를 통한 자유 그리기 모드 제어
  useEffect(() => {
    // 스페이스바를 누르면 자유 그리기 모드 활성화
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === ' ') {
        setFreeDrawing(true);
      }
    }

    // 스페이스바를 떼면 자유 그리기 모드 비활성화
    function onKeyUp(e: KeyboardEvent) {
      if (e.key === ' ') {
        setFreeDrawing(false);
      }
    }

    // 컴포넌트 마운트 시 연결선 경로 초기화
    setConnectionLinePath([]);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거 및 상태 초기화
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      setFreeDrawing(false);
    };
  }, []);

  // 연결선 경로 생성
  const path = getPath([{ x: fromX, y: fromY }, ...connectionLinePath, { x: toX, y: toY }], DEFAULT_ALGORITHM, {
    fromSide: fromPosition,
    toSide: toPosition,
  });

  // SVG 경로 렌더링
  return (
    <g>
      <path
        fill="none"
        stroke={COLORS[DEFAULT_ALGORITHM]}
        strokeWidth={2}
        className={connectionStatus === 'valid' ? '' : 'animated'}
        d={path}
        markerStart={MarkerType.ArrowClosed}
        markerWidth={25}
        markerEnd={MarkerType.ArrowClosed}
      />
    </g>
  );
}
