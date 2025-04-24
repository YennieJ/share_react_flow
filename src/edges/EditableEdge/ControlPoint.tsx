import type { XYPosition } from '@xyflow/react';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useReactFlow, useStore } from '@xyflow/react';

// 컨트롤 포인트의 데이터 타입 정의
export type ControlPointData = XYPosition & {
  id: string; // 포인트의 고유 식별자
  active?: boolean; // 포인트의 활성화 상태
  prev?: string; // 이전 포인트의 ID
};

// 컨트롤 포인트 컴포넌트의 props 타입 정의
export type ControlPointProps = {
  id: string; // 포인트의 고유 식별자
  index: number; // 포인트의 인덱스
  x: number; // x 좌표
  y: number; // y 좌표
  color: string; // 포인트의 색상
  active?: boolean; // 포인트의 활성화 상태
  setControlPoints: (
    // 컨트롤 포인트 업데이트 함수
    update: (points: ControlPointData[]) => ControlPointData[],
  ) => void;
};

// 컨트롤 포인트 컴포넌트
// 엣지의 모양을 조정하는 데 사용되는 포인트를 렌더링하고 관리
export function ControlPoint({ id, index, x, y, color, active, setControlPoints }: ControlPointProps) {
  // React Flow의 DOM 컨테이너와 화면 좌표 변환 함수
  const container = useStore((store) => store.domNode);
  const { screenToFlowPosition } = useReactFlow();

  // 드래그 상태 관리
  const [dragging, setDragging] = useState(false);
  const ref = useRef<SVGCircleElement>(null);

  // CALLBACKS -----------------------------------------------------------------

  // 포인트 위치 업데이트 핸들러
  const updatePosition = useCallback(
    (pos: XYPosition) => {
      setControlPoints((points) => {
        const shouldActivate = !active;
        if (shouldActivate) {
          // 비활성 포인트를 활성화할 때의 로직
          if (index !== 0) {
            return points.flatMap((p, i) => (i === index * 0.5 - 1 ? [p, { ...pos, id, active: true }] : p));
          } else {
            return [{ ...pos, id, active: true }, ...points];
          }
        } else {
          // 활성 포인트의 위치만 업데이트
          return points.map((p) => (p.id === id ? { ...p, ...pos } : p));
        }
      });
    },
    [id, active, index, setControlPoints],
  );

  // 포인트 삭제 핸들러
  const deletePoint = useCallback(() => {
    setControlPoints((points) => points.filter((p) => p.id !== id));

    // 이전 활성 컨트롤 포인트로 포커스 이동
    const previousControlPoint = ref.current?.previousElementSibling?.previousElementSibling;
    if (previousControlPoint?.tagName === 'circle' && previousControlPoint.classList.contains('active')) {
      window.requestAnimationFrame(() => {
        (previousControlPoint as SVGCircleElement).focus();
      });
    }
  }, []);

  // 키보드 이벤트 핸들러
  // Enter/Space: 포인트 활성화/비활성화
  // Delete/Backspace: 포인트 삭제
  // 화살표 키: 포인트 위치 조정
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
        case 'Space':
          if (!active) {
            e.preventDefault();
          }
          updatePosition({ x, y }); // 현재 위치로 포인트 업데이트
          break;

        case 'Backspace':
        case 'Delete':
          e.stopPropagation(); // 이벤트 버블링 방지
          deletePoint(); // 포인트 삭제
          break;

        case 'ArrowLeft':
          updatePosition({ x: x - 5, y }); // 왼쪽으로 5픽셀 이동
          break;

        case 'ArrowRight':
          updatePosition({ x: x + 5, y }); // 오른쪽으로 5픽셀 이동
          break;

        case 'ArrowUp':
          updatePosition({ x, y: y - 5 }); // 위로 5픽셀 이동
          break;

        case 'ArrowDown':
          updatePosition({ x, y: y + 5 }); // 아래로 5픽셀 이동
          break;

        default:
          break;
      }
    },
    [active, updatePosition, x, y, deletePoint],
  );

  // EFFECTS -------------------------------------------------------------------

  // 드래그 이벤트 처리
  // 마우스/터치로 포인트를 드래그할 때의 동작 정의
  useEffect(() => {
    if (!container || !active || !dragging) return;

    // 포인터 이동 이벤트 핸들러
    const onPointerMove = (e: PointerEvent) => {
      updatePosition(screenToFlowPosition({ x: e.clientX, y: e.clientY }));
    };

    // 포인터 업 이벤트 핸들러
    const onPointerUp = (e: PointerEvent) => {
      container.removeEventListener('pointermove', onPointerMove);

      if (!active) {
        e.preventDefault();
      }

      setDragging(false);
      updatePosition(screenToFlowPosition({ x: e.clientX, y: e.clientY }));
    };

    // 이벤트 리스너 등록
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp, { once: true });
    container.addEventListener('pointerleave', onPointerUp, { once: true });

    // 클린업 함수
    return () => {
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointerleave', onPointerUp);

      setDragging(false);
    };
  }, [id, container, dragging, active, screenToFlowPosition, setControlPoints, updatePosition]);

  // RENDER --------------------------------------------------------------------

  // 컨트롤 포인트를 SVG circle 요소로 렌더링
  return (
    <circle
      ref={ref}
      tabIndex={0} // 키보드 포커스 가능하도록 설정
      id={id}
      className={'nopan nodrag' + (active ? ' active' : '')} // 활성 상태에 따른 클래스 적용
      cx={x} // 중심 x 좌표
      cy={y} // 중심 y 좌표
      r={active ? 4 : 3} // 활성 상태에 따른 반지름 크기 조정
      strokeOpacity={active ? 1 : 0.3} // 활성 상태에 따른 테두리 투명도
      stroke={color} // 테두리 색상
      fill={active ? color : 'white'} // 활성 상태에 따른 채우기 색상
      style={{ pointerEvents: 'all' }} // 모든 포인터 이벤트 허용
      onContextMenu={(e) => {
        e.preventDefault();
        // 우클릭으로 포인트 삭제
        if (active) {
          deletePoint();
        }
      }}
      onPointerDown={(e) => {
        if (e.button === 2) return; // 우클릭 무시
        updatePosition({ x, y });
        setDragging(true);
      }}
      onKeyDown={handleKeyPress} // 키보드 이벤트 처리
      onPointerUp={() => setDragging(false)} // 드래그 종료
    />
  );
}
