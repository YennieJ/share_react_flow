// 엣지 경로 생성에 사용되는 알고리즘 타입 정의
export enum Algorithm {
  Linear = 'linear', // 직선 경로
  CatmullRom = 'catmull-rom', // Catmull-Rom 스플라인
  BezierCatmullRom = 'bezier-catmull-rom', // 베지어 변환된 Catmull-Rom 스플라인
}

// 각 알고리즘에 대한 색상 설정
export const COLORS = {
  [Algorithm.Linear]: '#0375ff', // 직선: 파란색
  [Algorithm.BezierCatmullRom]: '#68D391', // 베지어 Catmull-Rom: 녹색
  [Algorithm.CatmullRom]: '#FF0072', // Catmull-Rom: 분홍색
};

// 기본적으로 사용되는 알고리즘
export const DEFAULT_ALGORITHM = Algorithm.BezierCatmullRom;
