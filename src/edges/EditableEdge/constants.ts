// 엣지 경로 생성에 사용되는 알고리즘 타입 정의
export enum Algorithm {
  Linear = 'linear', // 직선 경로
}

// 기본적으로 사용되는 알고리즘
export const DEFAULT_ALGORITHM = Algorithm.Linear;

// 타입 선언을 이넘으로 변경
export enum ProgressEdgeType {
  YES = 'BRANCH-YES',
  NO = 'BRANCH-NO',
  ALL = 'BRANCH-ALL',
}

// 엣지,화살표 색상 맵
export const EDGE_COLORS: Record<ProgressEdgeType, string> = {
  [ProgressEdgeType.YES]: '#1880FB',
  [ProgressEdgeType.NO]: '#F05252',
  [ProgressEdgeType.ALL]: '#7E3AF2',
};

export const DASHED_STYLE = '5,5';
