import type { XYPosition } from '@xyflow/react';
import { useCallback, useRef } from 'react';
import { useReactFlow, useStore } from '@xyflow/react';
import { CornerPointData } from './path/linear';

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
  updateEdgePath: (update: (points: CornerPointData[]) => CornerPointData[]) => void;
  cornerPoints: {
    before?: { id: string; x: number; y: number };
    after?: { id: string; x: number; y: number };
  };
}

// 컨트롤 포인트 컴포넌트
export function ControlPoint({ id, x, y, updateEdgePath, color, cornerPoints }: ControlPointProps) {
  const container = useStore((store) => store.domNode);
  const { screenToFlowPosition } = useReactFlow();
  const ref = useRef<SVGCircleElement>(null);

  // 컨트롤 포인트 드래그 처리
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      if (!container) return;

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

        updateEdgePath((points) => {
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

          const result = updatedPoints.map((point) => {
            // 메인 드래그 포인트
            if (point.id === id) {
              return isHorizontal ? { ...point, y: point.y + deltaY } : { ...point, x: point.x + deltaX };
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

          // 드래그 중에는 모든 포인트 그대로 유지
          return result;
        });
      };

      const handlePointerUp = () => {
        // 포인터 업 시점에 x 좌표 편차 확인하여 수직 정렬 적용
        updateEdgePath((points) => {
          // x값들의 오차 범위 확인
          const xValues = points.map((point) => point.x);
          const minX = Math.min(...xValues);
          const maxX = Math.max(...xValues);
          const xDeviation = maxX - minX;

          // 수직 정렬 조건: x 좌표 편차가 1 이하
          if (xDeviation <= 1) {
            // 원래 포인트들 저장
            const setVerticallyAlignedPoints = (points: CornerPointData[]) => {
              // x 좌표 평균 계산
              const avgX = xValues.reduce((sum, x) => sum + x, 0) / xValues.length;

              // 첫 번째와 마지막 포인트만 남기고 x 좌표를 평균으로 설정
              const firstPoint = { ...points[0], x: avgX };
              const lastPoint = { ...points[points.length - 1], x: avgX };

              return [firstPoint, lastPoint];
            };

            return setVerticallyAlignedPoints(points);
          }

          return points;
        });

        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
      };

      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp, { once: true });
    },
    [container, cornerPoints.after, cornerPoints.before, id, screenToFlowPosition, updateEdgePath],
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
      // onDoubleClick={() => alert('최단거리 계산해야합니다!')}
    />
  );
}
