import type { XYPosition } from '@xyflow/react';

import type { ControlPointData } from '../ControlPoint';

// 포인트가 컨트롤 포인트인지 확인하는 타입 가드 함수
// point: 확인할 포인트 객체
// 반환값: point가 ControlPointData 타입이면 true, 아니면 false
export const isControlPoint = (point: ControlPointData | XYPosition): point is ControlPointData => 'id' in point;
