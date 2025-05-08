import type { XYPosition } from '@xyflow/react';
import { useCallback, useRef } from 'react';
import { useReactFlow, useStore } from '@xyflow/react';
import { LinePointData } from './path/linear';

// 컨트롤 포인트의 데이터 타입 정의
export type ControlPointData = XYPosition & {
  id: string;
  cornerPoints: {
    before?: XYPosition & { id: string };
    after?: XYPosition & { id: string };
  };
};

// 컨트롤 포인트 컴포넌트의 props 타입 정의
interface ControlPointProps {
  id: string;
  x: number;
  y: number;
  color: string;
  setEdgeLinePoints: (update: (points: LinePointData[]) => LinePointData[]) => void;
  cornerPoints: {
    before?: { id: string; x: number; y: number };
    after?: { id: string; x: number; y: number };
  };
}

// 컨트롤 포인트 컴포넌트
export function ControlPoint({ id, x, y, setEdgeLinePoints, color, cornerPoints }: ControlPointProps) {
  const container = useStore((store) => store.domNode);
  const { screenToFlowPosition } = useReactFlow();
  const ref = useRef<SVGCircleElement>(null);

  // 컨트롤 포인트 드래그 처리
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      if (!container) return;

      console.log('컨트롤 포인트 정보:', {
        id,
        position: { x, y },
        cornerPoints,
        event: {
          clientX: e.clientX,
          clientY: e.clientY,
          button: e.button,
          type: e.type,
        },
      });

      const initialClientPos = { x: e.clientX, y: e.clientY };
      let prevClientPos = initialClientPos;

      // 엣지 방향에 따른 분기 플래그
      const isHorizontal =
        !!(cornerPoints?.after && cornerPoints.before) && cornerPoints.after.x !== cornerPoints.before.x;

      const handlePointerMove = (moveEvent: PointerEvent) => {
        moveEvent.preventDefault();

        const currentClientPos = { x: moveEvent.clientX, y: moveEvent.clientY };
        const prevFlow = screenToFlowPosition(prevClientPos);
        const currentFlow = screenToFlowPosition(currentClientPos);

        const deltaX = currentFlow.x - prevFlow.x;
        const deltaY = currentFlow.y - prevFlow.y;
        prevClientPos = currentClientPos;

        setEdgeLinePoints((points) => {
          const updatedPoints = [...points];

          // before/after 핸들 존재 시 추가
          if (cornerPoints?.before) {
            const exists = updatedPoints.some((p) => p.id === cornerPoints.before!.id);
            if (!exists) updatedPoints.push({ ...cornerPoints.before! });
          }
          if (cornerPoints?.after) {
            const exists = updatedPoints.some((p) => p.id === cornerPoints.after!.id);
            if (!exists) updatedPoints.push({ ...cornerPoints.after! });
          }

          return updatedPoints.map((point) => {
            // 메인 드래그 포인트
            if (point.id === id) {
              return isHorizontal
                ? { ...point, y: point.y + deltaY } // 가로선 → Y만
                : { ...point, x: point.x + deltaX }; // 세로선 → X만
            }

            // before 핸들
            if (cornerPoints?.before && point.id === cornerPoints.before.id) {
              return isHorizontal ? { ...point, y: point.y + deltaY } : { ...point, x: point.x + deltaX };
            }

            // after 핸들
            if (cornerPoints?.after && point.id === cornerPoints.after.id) {
              return isHorizontal ? { ...point, y: point.y + deltaY } : { ...point, x: point.x + deltaX };
            }

            return point;
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
    [container, cornerPoints, id, screenToFlowPosition, setEdgeLinePoints, x, y],
  );

  return (
    <circle
      ref={ref}
      tabIndex={0}
      id={id}
      cx={x}
      cy={y}
      r={4}
      strokeOpacity={0.3}
      stroke={color}
      fill="white"
      style={{ pointerEvents: 'all' }}
      onPointerDown={handlePointerDown}
    />
  );
}
