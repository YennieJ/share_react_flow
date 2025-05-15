import { create } from 'zustand';
import { type XYPosition } from '@xyflow/react';

interface AppState {
  isEdgeActive: boolean; // 엣지가 활성화되어 있는지 여부
  setIsEdgeActive: (isEdgeActive: boolean) => void; // 엣지 활성화 여부 설정 함수
  draggingEdgePath: XYPosition[]; // 연결선의 경로를 구성하는 포인트 배열
  setDraggingEdgePath: (draggingEdgePath: XYPosition[]) => void; // 연결선 경로 설정 함수
  savedEdgePath: XYPosition[]; // 실제 연결선 경로
  setSavedEdgePath: (savedEdgePath: XYPosition[]) => void; // 실제 연결선 경로 설정 함수
  isSourceHandleReconnecting: boolean | null; // 재연결 중인 핸들이 source Node와 가까운 엣지인지 여부
  setIsSourceHandleReconnecting: (isSourceHandleReconnecting: boolean | null) => void; // 재연결 중인 핸들이 source Node와 가까운 엣지인지 여부 설정 함수
}

// Zustand를 사용한 전역 상태 스토어 생성
export const useAppStore = create<AppState>((set) => ({
  isEdgeActive: false, // 엣지가 활성화되어 있는지 여부
  setIsEdgeActive: (isEdgeActive: boolean) => {
    set({ isEdgeActive }); // 엣지 활성화 여부 설정
  },
  draggingEdgePath: [], // 초기 연결선 경로는 빈 배열
  setDraggingEdgePath: (draggingEdgePath: XYPosition[]) => {
    set({ draggingEdgePath }); // 연결선 경로 업데이트
  },
  savedEdgePath: [], // 실제 연결선 경로
  setSavedEdgePath: (savedEdgePath: XYPosition[]) => {
    set({ savedEdgePath }); // 실제 연결선 경로 설정
  },
  isSourceHandleReconnecting: false, // 재연결 중인 핸들이 source인지 여부
  setIsSourceHandleReconnecting: (isSourceHandleReconnecting: boolean | null) => {
    set({ isSourceHandleReconnecting }); // 재연결 중인 핸들이 source인지 여부 설정
  },
}));
