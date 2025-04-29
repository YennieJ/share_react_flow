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
  const container = useStore((store) => store.domNode);
  const { screenToFlowPosition, flowToScreenPosition } = useReactFlow();

  const [dragging, setDragging] = useState(false);
  const ref = useRef<SVGCircleElement>(null);

  // CALLBACKS -----------------------------------------------------------------

  // 포인트 위치 업데이트 핸들러
  const updatePosition = useCallback(
    (pos: XYPosition) => {
      // 현재 컨트롤 포인트의 이동 거리 계산 (가로 방향만)
      const deltaX = pos.x - x;

      setControlPoints((points) => {
        // 컨트롤 포인트가 가지고 있는 cornerPoints 정보를 사용하여 연결된 엣지 포인트를 찾음
        return points.map((p) => {
          // 현재 컨트롤 포인트 자체는 x, y 모두 업데이트
          if (p.id === id) {
            return { ...p, x: pos.x, y: pos.y };
          }

          // cornerPoints 객체가 있고, cornerPoints.before 또는 cornerPoints.after의 ID와
          // 일치하는 엣지 포인트를 찾아 가로 방향으로만 이동
          if (cornerPoints?.before && p.id === cornerPoints.before.id) {
            return { ...p, x: p.x + deltaX }; // y값은 유지하고 x만 변경
          }

          if (cornerPoints?.after && p.id === cornerPoints.after.id) {
            return { ...p, x: p.x + deltaX }; // y값은 유지하고 x만 변경
          }

          return p; // 관련 없는 포인트는 변경하지 않음
        });
      });
    },
    [id, x, cornerPoints, setControlPoints],
  );

  // 컨트롤 포인트 드래그 처리
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button === 2) return; // 우클릭 무시

      e.stopPropagation();

      if (!container) return;

      // 컨트롤 포인트의 초기 flow 좌표
      const initialFlowPos = { x, y };

      // 마우스 초기 클라이언트 좌표
      const initialClientPos = { x: e.clientX, y: e.clientY };

      // 이전 마우스 플로우 위치로 초기화
      let prevMouseFlowPos = screenToFlowPosition(initialClientPos);

      const handlePointerMove = (moveEvent: PointerEvent) => {
        moveEvent.preventDefault();
        const currentMouseFlowPos = screenToFlowPosition({
          x: moveEvent.clientX,
          y: moveEvent.clientY,
        });
        // 이전 프레임 대비 변화량만 계산
        const deltaX = currentMouseFlowPos.x - prevMouseFlowPos.x;
        const deltaY = currentMouseFlowPos.y - prevMouseFlowPos.y;
        prevMouseFlowPos = currentMouseFlowPos;

        console.log(`드래그: 변화량(${deltaX.toFixed(2)}, ${deltaY.toFixed(2)})`);

        // 컨트롤 포인트와 엣지 포인트 업데이트
        setControlPoints((points) => {
          return points.map((p) => {
            if (p.id === id) {
              return { ...p, x: p.x + deltaX, y: p.y + deltaY };
            }

            if (cornerPoints?.before && p.id === cornerPoints.before.id) {
              return { ...p, x: p.x + deltaX };
            }

            if (cornerPoints?.after && p.id === cornerPoints.after.id) {
              return { ...p, x: p.x + deltaX };
            }

            return p;
          });
        });
      };

      const handlePointerUp = () => {
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
      };

      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp, { once: true });
    },
    [container, cornerPoints?.after, cornerPoints?.before, id, screenToFlowPosition, setControlPoints, x, y],
  );

  // RENDER --------------------------------------------------------------------

  // 컨트롤 포인트를 SVG circle 요소로 렌더링
  return (
    <circle
      ref={ref}
      tabIndex={0}
      id={id}
      cx={x}
      cy={y}
      r={4}
      strokeOpacity={dragging ? 1 : 0.3}
      stroke={color}
      fill={dragging ? color : 'white'}
      style={{ pointerEvents: 'all' }}
      onContextMenu={(e) => {
        e.preventDefault();
        if (dragging) {
          setControlPoints((points) => {
            return points.filter((p) => p.id !== id);
          });
        }
      }}
      onPointerDown={handlePointerDown}
    />
  );
}
