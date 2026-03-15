export interface Student {
  student_name: string;
  class_name: string;
  subjects: string[];
  progress?: number;
  tier?: number;
}

export function normalizeStudentData(data: any): Student {
  return {
    student_name: data.student_name || data.학생이름 || "이름 없음",
    class_name: data.class_name || data.학급명 || "학급 미지정",
    subjects: Array.isArray(data.subjects) 
      ? data.subjects 
      : (data.subject || data.담당과목 || "").split(",").filter(Boolean),
    progress: typeof data.progress === "number" ? data.progress : 0,
    tier: typeof data.tier === "number" ? data.tier : (data.티어 ? parseInt(data.티어) : (data.Tier ? parseInt(data.Tier) : 1))
  };
}

export function normalizeCurriculumData(data: any) {
  return {
    code: data.code || data.코드 || "코드 없음",
    content: data.content || data.내용 || "내용 없음"
  };
}
