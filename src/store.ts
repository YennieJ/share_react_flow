import { create } from 'zustand';
import { type XYPosition } from '@xyflow/react';

// 전역 상태 관리 인터페이스 정의
// 연결선을 그리는 동안 추가된 컨트롤 포인트를
// 새로운 엣지 생성 시 전달하기 위해 필요
interface AppState {
  connectionLinePath: XYPosition[]; // 연결선의 경로를 구성하는 포인트 배열
  setConnectionLinePath: (connectionLinePath: XYPosition[]) => void; // 연결선 경로 설정 함수
  isReconnectionFromSource: boolean | null; // 재연결 중인 핸들이 source Node와 가까운 엣지인지 여부
  setIsReconnectionFrommSource: (isReconnectionFromSource: boolean | null) => void; // 재연결 중인 핸들이 source Node와 가까운 엣지인지 여부 설정 함수
  isEdgeActive: boolean; // 엣지가 활성화되어 있는지 여부
  setIsEdgeActive: (isEdgeActive: boolean) => void; // 엣지 활성화 여부 설정 함수
  realPath: XYPosition[]; // 실제 연결선 경로
  setRealPath: (realPath: XYPosition[]) => void; // 실제 연결선 경로 설정 함수
}

// Zustand를 사용한 전역 상태 스토어 생성
export const useAppStore = create<AppState>((set) => ({
  connectionLinePath: [], // 초기 연결선 경로는 빈 배열
  setConnectionLinePath: (connectionLinePath: XYPosition[]) => {
    set({ connectionLinePath }); // 연결선 경로 업데이트
  },
  isReconnectionFromSource: false, // 재연결 중인 핸들이 source인지 여부
  setIsReconnectionFrommSource: (isReconnectionFromSource: boolean | null) => {
    set({ isReconnectionFromSource }); // 재연결 중인 핸들이 source인지 여부 설정
  },
  isEdgeActive: false, // 엣지가 활성화되어 있는지 여부
  setIsEdgeActive: (isEdgeActive: boolean) => {
    set({ isEdgeActive }); // 엣지 활성화 여부 설정
  },
  realPath: [], // 실제 연결선 경로
  setRealPath: (realPath: XYPosition[]) => {
    set({ realPath }); // 실제 연결선 경로 설정
  },
}));
