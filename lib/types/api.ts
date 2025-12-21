/**
 * API レスポンス共通型定義
 */

// ===========================================
// 共通レスポンス型
// ===========================================

/** 成功レスポンス */
export type ApiResponse<T> = {
  data: T;
};

/** エラーレスポンス */
export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
};

/** ページネーション付きレスポンス */
export type PaginatedResponse<T> = {
  data: T[];
  totalCount: number;
  page?: number;
  pageSize?: number;
};

// ===========================================
// アンケート関連型
// ===========================================

export type QuestionType = "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "FREE_TEXT";

/** アンケート一覧アイテム */
export type SurveyListItem = {
  id: number;
  title: string;
  createdAt: Date;
  responseCount: number;
};

/** アンケート基本情報 */
export type Survey = {
  id: number;
  title: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/** 質問選択肢 */
export type QuestionOption = {
  id: number;
  optionText: string;
  sortOrder: number;
};

/** 質問 */
export type Question = {
  id: number;
  questionType: QuestionType;
  questionText: string;
  isRequired: boolean;
  sortOrder: number;
  options: QuestionOption[];
};

/** アンケート詳細（質問含む） */
export type SurveyWithQuestions = Survey & {
  questions: Question[];
};

/** アンケート作成入力 */
export type CreateSurveyInput = {
  title: string;
  description?: string;
  questions: {
    questionType: QuestionType;
    questionText: string;
    isRequired?: boolean;
    options?: { optionText: string }[];
  }[];
};

/** アンケート更新入力 */
export type UpdateSurveyInput = Partial<CreateSurveyInput>;

// ===========================================
// 回答関連型
// ===========================================

/** 回答一覧アイテム */
export type ResponseListItem = {
  id: number;
  respondentName: string | null;
  submittedAt: Date;
};

/** 回答詳細 */
export type ResponseDetail = {
  id: number;
  respondentName: string | null;
  submittedAt: Date;
  answers: {
    questionText: string;
    questionType: string;
    answerText: string | null;
    selectedOptions: string[];
  }[];
};

// ===========================================
// お知らせ関連型
// ===========================================

/** お知らせ一覧アイテム */
export type NoticeListItem = {
  id: number;
  title: string;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
};

/** お知らせ詳細 */
export type Notice = {
  id: number;
  title: string;
  content: string;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

/** お知らせ作成入力 */
export type CreateNoticeInput = {
  title: string;
  content: string;
  isPublished?: boolean;
  publishedAt?: Date;
};

/** お知らせ更新入力 */
export type UpdateNoticeInput = Partial<CreateNoticeInput>;
