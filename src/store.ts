import { create } from 'zustand';
import { type XYPosition } from '@xyflow/react';

// 전역 상태 관리 인터페이스 정의
// 연결선을 그리는 동안 추가된 컨트롤 포인트를
// 새로운 엣지 생성 시 전달하기 위해 필요
interface AppState {
  connectionLinePath: XYPosition[]; // 연결선의 경로를 구성하는 포인트 배열
  setConnectionLinePath: (connectionLinePath: XYPosition[]) => void; // 연결선 경로 설정 함수
}

// Zustand를 사용한 전역 상태 스토어 생성
export const useAppStore = create<AppState>((set) => ({
  connectionLinePath: [], // 초기 연결선 경로는 빈 배열
  setConnectionLinePath: (connectionLinePath: XYPosition[]) => {
    set({ connectionLinePath }); // 연결선 경로 업데이트
  },
}));
