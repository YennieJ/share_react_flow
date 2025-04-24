// 엣지 경로 생성에 사용되는 알고리즘 타입 정의
export enum Algorithm {
  Linear = 'linear', // 직선 경로
}

// 각 알고리즘에 대한 색상 설정
export const COLORS = {
  [Algorithm.Linear]: '#0375ff', // 직선: 파란색
};

// 기본적으로 사용되는 알고리즘
export const DEFAULT_ALGORITHM = Algorithm.Linear;
