export type UserRole = 'student' | 'instructor' | 'admin';
export type MaterialType = 'pdf' | 'audio' | 'video';
export type SkillCategory = 'listening' | 'reading' | 'writing' | 'technical' | 'speaking';
export type QuestionType = 'mcq' | 'essay' | 'matching' | 'speaking';
export type SubmissionStatus = 'in_progress' | 'submitted';
export type AttendanceMethod = 'qr' | 'manual';

export interface User {
  id: string; name: string; email: string; nim_nip: string; role: UserRole; created_at: string;
}
export interface Course {
  id: string; title: string; description: string | null; instructor_id: string; image_url: string | null; created_at: string; instructor?: User;
}
export interface CourseEnroll {
  id: string; course_id: string; student_id: string; enrolled_at: string; progress: number; course?: Course; student?: User;
}
export interface Material {
  id: string; course_id: string; title: string; type: MaterialType; skill_category: SkillCategory | null; file_url: string; created_at: string;
}
export interface Quiz {
  id: string; course_id: string; title: string; duration: number; passing_grade: number;
  randomize_order: boolean; shuffle_answers: boolean; max_attempts: number; is_listening: boolean; created_at: string;
}
export interface Question {
  id: string; quiz_id: string; type: QuestionType; question_text: string; audio_url: string | null; sort_order: number; answers?: Answer[];
}
export interface Answer {
  id: string; question_id: string; answer_text: string; is_correct: boolean; sort_order: number;
}
export interface Submission {
  id: string; quiz_id: string; student_id: string; score: number | null; 
  submitted_at: string | null; status: SubmissionStatus; tab_switch_count: number;
  feedback: string | null; is_manually_graded: boolean;
}

export interface SubmissionAnswer {
  id: string; submission_id: string; question_id: string; answer_id: string | null; answer_text: string | null;
}
export interface Attendance {
  id: string; student_id: string; course_id: string; timestamp: string; method: AttendanceMethod;
}
export interface MaterialView {
  id: string; student_id: string; material_id: string; viewed_at: string;
}

export interface Database {
  public: {
    Tables: {
      users: { Row: User; Insert: Omit<User, 'created_at'>; Update: Partial<Omit<User, 'created_at'>> };
      courses: { Row: Course; Insert: Omit<Course, 'id' | 'created_at'>; Update: Partial<Omit<Course, 'id' | 'created_at'>> };
      course_enroll: { Row: CourseEnroll; Insert: Omit<CourseEnroll, 'id' | 'enrolled_at'>; Update: Partial<Omit<CourseEnroll, 'id' | 'enrolled_at'>> };
      materials: { Row: Material; Insert: Omit<Material, 'id' | 'created_at'>; Update: Partial<Omit<Material, 'id' | 'created_at'>> };
      quizzes: { Row: Quiz; Insert: Omit<Quiz, 'id' | 'created_at'>; Update: Partial<Omit<Quiz, 'id' | 'created_at'>> };
      questions: { Row: Question; Insert: Omit<Question, 'id'>; Update: Partial<Omit<Question, 'id'>> };
      answers: { Row: Answer; Insert: Omit<Answer, 'id'>; Update: Partial<Omit<Answer, 'id'>> };
      submissions: { Row: Submission; Insert: Omit<Submission, 'id'>; Update: Partial<Omit<Submission, 'id'>> };
      submission_answers: { Row: SubmissionAnswer; Insert: Omit<SubmissionAnswer, 'id'>; Update: Partial<Omit<SubmissionAnswer, 'id'>> };
      attendance: { Row: Attendance; Insert: Omit<Attendance, 'id' | 'timestamp'>; Update: Partial<Omit<Attendance, 'id' | 'timestamp'>> };
      material_views: { Row: MaterialView; Insert: Omit<MaterialView, 'id' | 'viewed_at'>; Update: Partial<Omit<MaterialView, 'id' | 'viewed_at'>> };
    };
  };
}
