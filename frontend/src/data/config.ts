// 학년별 과목 편성
export const gradeSubjects: Record<string, string[]> = {
  '초1': ['바른 생활', '즐거운 생활', '슬기로운 생활'],
  '초2': ['바른 생활', '즐거운 생활', '슬기로운 생활'],
  '초3': ['국어', '수학', '사회', '과학', '실과', '체육', '음악', '미술'],
  '초4': ['국어', '수학', '사회', '과학', '실과', '체육', '음악', '미술'],
  '초5': ['국어', '수학', '사회', '과학', '실과', '체육', '음악', '미술'],
  '초6': ['국어', '수학', '사회', '과학', '실과', '체육', '음악', '미술'],
  '중1': ['국어', '수학', '사회', '과학', '진로와 직업', '체육', '음악', '미술', '정보통신활용', '보건'],
  '중2': ['국어', '수학', '사회', '과학', '진로와 직업', '체육', '음악', '미술', '정보통신활용', '보건'],
  '중3': ['국어', '수학', '사회', '과학', '진로와 직업', '체육', '음악', '미술', '정보통신활용', '보건'],
  '고1': ['국어', '수학', '사회', '과학', '진로와 직업', '체육', '음악', '미술', '정보통신활용', '보건', '생활영어'],
  '고2': ['국어', '수학', '사회', '과학', '진로와 직업', '체육', '음악', '미술', '정보통신활용', '보건', '생활영어'],
  '고3': ['국어', '수학', '사회', '과학', '진로와 직업', '체육', '음악', '미술', '정보통신활용', '보건', '생활영어'],
};

// 학교급별 학급당 학생 수
export const classSize: Record<string, number> = {
  '유치원': 4,
  '초등학교': 6,
  '중학교': 6,
  '고등학교': 7,
  '전공과': 7,
};

export function getSchoolLevel(grade: string): string {
  if (grade.startsWith('초')) return '초등학교';
  if (grade.startsWith('중')) return '중학교';
  if (grade.startsWith('고')) return '고등학교';
  return '초등학교';
}

export function getStudentCount(grade: string): number {
  return classSize[getSchoolLevel(grade)] || 6;
}

export const MONTHS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export const PASSWORD = 'ges2811';

// 역할 목록
export const ROLES = ['담임', '부담임', '교담', '기타'] as const;

// 학년 목록
export const GRADES = ['초1', '초2', '초3', '초4', '초5', '초6', '중1', '중2', '중3', '고1', '고2', '고3'] as const;

// 평가 척도
export const SCORE_LABELS: Record<number, string> = {
  0: '미성취',
  1: 'C성취',
  2: 'B성취',
  3: 'A성취',
};

export const SCORE_DESCRIPTIONS: Record<number, string> = {
  0: '최소한의 반응/수용',
  1: '완전한 신체적 도움으로 참여',
  2: '신체적 촉구로 부분적 수행',
  3: '언어적 촉구만으로 수행',
};
