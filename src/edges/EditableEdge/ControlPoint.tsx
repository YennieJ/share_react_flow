import type { XYPosition } from '@xyflow/react';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useReactFlow, useStore } from '@xyflow/react';

// 컨트롤 포인트의 데이터 타입 정의
export type ControlPointData = XYPosition & {
  id: string; // 포인트의 고유 식별자
  prev?: string; // 이전 포인트의 ID
  // 연결된 꺽임 포인트 정보
  cornerPoints?: {
    before?: XYPosition & { id: string }; // 이전 꺽임 포인트
    after?: XYPosition & { id: string }; // 다음 꺽임 포인트
  };
};

// 컨트롤 포인트 컴포넌트의 props 타입 정의
export type ControlPointProps = {
  id: string; // 포인트의 고유 식별자
  index: number; // 포인트의 인덱스
  x: number; // x 좌표
  y: number; // y 좌표
  color: string; // 포인트의 색상
  setControlPoints: (
    // 컨트롤 포인트 업데이트 함수
    update: (points: ControlPointData[]) => ControlPointData[],
  ) => void;
  cornerPoints?: {
    before?: { id: string; x: number; y: number };
    after?: { id: string; x: number; y: number };
  };
};

// 컨트롤 포인트 컴포넌트
// 엣지의 모양을 조정하는 데 사용되는 포인트를 렌더링하고 관리
export function ControlPoint({
  id,
  x,
  y,
  index,
  setControlPoints,
  color,
  cornerPoints, // cornerPoints를 props로 받음
}: {
  id: string;
  x: number;
  y: number;
  index: number;
  setControlPoints: (update: (points: ControlPointData[]) => ControlPointData[]) => void;
  color: string;
  cornerPoints?: {
    before?: { id: string; x: number; y: number };
    after?: { id: string; x: number; y: number };
  };
}) {
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
        // 현재 포인트 찾기
        const point = points.find((p) => p.id === id);

        if (!point) {
          return points; // 포인트를 찾지 못하면 기존 배열 반환
        } else {
          // 컨트롤 포인트 업데이트
          const updatedControlPoint = { ...point, ...pos };

          // 꺽임 포인트 연결 정보가 있는 경우 해당 포인트도 함께 업데이트
          if (point.cornerPoints) {
            // 이동 거리 계산
            const deltaX = pos.x - point.x;
            const deltaY = pos.y - point.y;

            // 각 꺽임 포인트에도 같은 변화량 적용
            const updatedPoints = points.map((p) => {
              // 꺽임 포인트 중 하나와 ID가 일치하면 업데이트
              if (point.cornerPoints?.before && p.id === point.cornerPoints.before.id) {
                return { ...p, x: p.x + deltaX, y: p.y + deltaY };
              }
              if (point.cornerPoints?.after && p.id === point.cornerPoints.after.id) {
                return { ...p, x: p.x + deltaX, y: p.y + deltaY };
              }
              // 현재 컨트롤 포인트 업데이트
              if (p.id === id) {
                return updatedControlPoint;
              }
              return p;
            });

            return updatedPoints;
          }

          // 연결 정보가 없는 경우 단순히 컨트롤 포인트만 업데이트
          const updatedPoints = points.map((p) => (p.id === id ? updatedControlPoint : p));
          return updatedPoints;
        }
      });
    },
    [id, setControlPoints],
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
        // case 'Enter':
        // case 'Space':
        //   if (!active) {
        //     e.preventDefault();
        //   }
        //   updatePosition({ x, y }); // 현재 위치로 포인트 업데이트
        //   break;

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
    [updatePosition, x, y, deletePoint],
  );

  // EFFECTS -------------------------------------------------------------------

  // 드래그 이벤트 처리
  // 마우스/터치로 포인트를 드래그할 때의 동작 정의
  useEffect(() => {
    if (!container || !dragging) return;

    // 포인터 이동 이벤트 핸들러
    const onPointerMove = (e: PointerEvent) => {
      updatePosition(screenToFlowPosition({ x: e.clientX, y: e.clientY }));
    };

    // 포인터 업 이벤트 핸들러
    const onPointerUp = (e: PointerEvent) => {
      container.removeEventListener('pointermove', onPointerMove);

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
  }, [id, container, dragging, screenToFlowPosition, setControlPoints, updatePosition]);

  // RENDER --------------------------------------------------------------------

  // 컨트롤 포인트를 SVG circle 요소로 렌더링
  return (
    <circle
      ref={ref}
      tabIndex={0} // 키보드 포커스 가능하도록 설정
      id={id}
      cx={x} // 중심 x 좌표
      cy={y} // 중심 y 좌표
      r={4}
      strokeOpacity={1} // 활성 상태에 따른 테두리 투명도
      stroke={color} // 테두리 색상
      fill={color} // 활성 상태에 따른 채우기 색상
      style={{ pointerEvents: 'all' }} // 모든 포인터 이벤트 허용
      onContextMenu={(e) => {
        e.preventDefault();
        // 우클릭으로 포인트 삭제
      }}
      onPointerDown={(e) => {
        if (e.button === 2) return; // 우클릭 무시

        // 컨트롤 포인트 정보 콘솔에 출력
        console.log('컨트롤 포인트 정보:', {
          id,
          index,
          position: { x, y },
          color,
          // 추가: props로 직접 받은 cornerPoints 정보
          cornerPoints: cornerPoints,
        });

        // 디버깅 로그 - 현재 컨트롤 포인트 직접 콘솔
        console.log('현재 컨트롤 포인트(props):', {
          id,
          cornerPoints: cornerPoints,
        });

        updatePosition({ x, y });
        setDragging(true);
      }}
      onKeyDown={handleKeyPress} // 키보드 이벤트 처리
      onPointerUp={() => setDragging(false)} // 드래그 종료
    />
  );
}
