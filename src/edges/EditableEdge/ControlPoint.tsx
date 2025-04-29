import type { XYPosition } from '@xyflow/react';
import { useCallback, useRef } from 'react';
import { useReactFlow, useStore } from '@xyflow/react';

// 컨트롤 포인트의 데이터 타입 정의
export type ControlPointData = XYPosition & {
  id: string;
  prev?: string;
  cornerPoints?: {
    before?: XYPosition & { id: string };
    after?: XYPosition & { id: string };
  };
};

// 컨트롤 포인트 컴포넌트의 props 타입 정의
export type ControlPointProps = {
  id: string;
  x: number;
  y: number;
  color: string;
  setControlPoints: (update: (points: ControlPointData[]) => ControlPointData[]) => void;
  cornerPoints?: {
    before?: { id: string; x: number; y: number };
    after?: { id: string; x: number; y: number };
  };
};

// 컨트롤 포인트 컴포넌트
export function ControlPoint({ id, x, y, setControlPoints, color, cornerPoints }: ControlPointProps) {
  const container = useStore((store) => store.domNode);
  const { screenToFlowPosition } = useReactFlow();
  const ref = useRef<SVGCircleElement>(null);

  // 컨트롤 포인트 드래그 처리
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      if (!container) return;

      if (cornerPoints?.after?.x !== cornerPoints?.before?.x) {
        return;
      }

      const initialClientPos = { x: e.clientX, y: e.clientY };
      let prevClientPos = initialClientPos;

      const handlePointerMove = (moveEvent: PointerEvent) => {
        moveEvent.preventDefault();

        const currentClientPos = { x: moveEvent.clientX, y: moveEvent.clientY };
        const prevFlow = screenToFlowPosition(prevClientPos);
        const currentFlow = screenToFlowPosition(currentClientPos);

        const deltaX = currentFlow.x - prevFlow.x;
        const deltaY = currentFlow.y - prevFlow.y;

        prevClientPos = currentClientPos;

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
    [container, cornerPoints, id, screenToFlowPosition, setControlPoints],
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
