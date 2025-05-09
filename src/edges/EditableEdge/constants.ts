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

// 타입 선언을 이넘으로 변경
export enum ProgressEdgeType {
  YES = 'BRANCH-YES',
  NO = 'BRANCH-NO',
  ALL = 'BRANCH-ALL',
}
// colorMap을 이넘 값에 맞게 수정
export const EDGE_COLORS: Record<ProgressEdgeType, string> = {
  [ProgressEdgeType.YES]: '#1880FB',
  [ProgressEdgeType.NO]: '#F05252',
  [ProgressEdgeType.ALL]: '#7E3AF2',
};
