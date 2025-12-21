"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  QuestionType,
  SurveyWithQuestions,
  CreateSurveyInput,
} from "@/lib/types";

type QuestionInput = {
  id?: number;
  questionType: QuestionType;
  questionText: string;
  isRequired: boolean;
  options: { id?: number; optionText: string }[];
};

type SurveyFormProps = {
  initialData?: SurveyWithQuestions;
  mode: "create" | "edit";
};

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  SINGLE_CHOICE: "単一選択",
  MULTIPLE_CHOICE: "複数選択",
  FREE_TEXT: "自由記述",
};

/**
 * アンケート作成・編集フォーム
 */
export function SurveyForm({ initialData, mode }: SurveyFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [questions, setQuestions] = useState<QuestionInput[]>(
    initialData?.questions.map((q) => ({
      id: q.id,
      questionType: q.questionType,
      questionText: q.questionText,
      isRequired: q.isRequired,
      options: q.options.map((opt) => ({
        id: opt.id,
        optionText: opt.optionText,
      })),
    })) || [],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionType: "SINGLE_CHOICE",
        questionText: "",
        isRequired: false,
        options: [{ optionText: "" }],
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, updates: Partial<QuestionInput>) => {
    setQuestions(
      questions.map((q, i) => (i === index ? { ...q, ...updates } : q)),
    );
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.push({ optionText: "" });
    setQuestions(newQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options = newQuestions[
      questionIndex
    ].options.filter((_, i) => i !== optionIndex);
    setQuestions(newQuestions);
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    text: string,
  ) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex].optionText = text;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload: CreateSurveyInput = {
        title,
        description: description || undefined,
        questions: questions.map((q) => ({
          questionType: q.questionType,
          questionText: q.questionText,
          isRequired: q.isRequired,
          options:
            q.questionType !== "FREE_TEXT"
              ? q.options.filter((opt) => opt.optionText.trim())
              : undefined,
        })),
      };

      const url =
        mode === "create"
          ? "/api/surveys"
          : `/api/surveys/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || "保存に失敗しました");
      }

      router.push("/surveys");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* タイトル */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          タイトル <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="アンケートのタイトル"
        />
      </div>

      {/* 説明 */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          説明
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="アンケートの説明（任意）"
        />
      </div>

      {/* 質問リスト */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">質問</h3>
          <button
            type="button"
            onClick={addQuestion}
            className="inline-flex items-center gap-1 rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            質問を追加
          </button>
        </div>

        {questions.length === 0 && (
          <p className="text-sm text-gray-500">
            質問がありません。「質問を追加」ボタンから追加してください。
          </p>
        )}

        {questions.map((question, qIndex) => (
          <div
            key={qIndex}
            className="rounded-lg border border-gray-200 bg-gray-50 p-4"
          >
            <div className="mb-4 flex items-start justify-between">
              <span className="text-sm font-medium text-gray-600">
                質問 {qIndex + 1}
              </span>
              <button
                type="button"
                onClick={() => removeQuestion(qIndex)}
                className="text-red-500 hover:text-red-700"
                title="質問を削除"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>

            {/* 質問タイプ */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700">
                質問タイプ
              </label>
              <select
                value={question.questionType}
                onChange={(e) =>
                  updateQuestion(qIndex, {
                    questionType: e.target.value as QuestionType,
                    options:
                      e.target.value === "FREE_TEXT"
                        ? []
                        : question.options.length > 0
                          ? question.options
                          : [{ optionText: "" }],
                  })
                }
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map(
                  (type) => (
                    <option key={type} value={type}>
                      {QUESTION_TYPE_LABELS[type]}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* 質問文 */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700">
                質問文
              </label>
              <input
                type="text"
                value={question.questionText}
                onChange={(e) =>
                  updateQuestion(qIndex, { questionText: e.target.value })
                }
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="質問を入力"
              />
            </div>

            {/* 必須チェック */}
            <div className="mb-3">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={question.isRequired}
                  onChange={(e) =>
                    updateQuestion(qIndex, { isRequired: e.target.checked })
                  }
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">必須</span>
              </label>
            </div>

            {/* 選択肢（単一選択・複数選択のみ） */}
            {question.questionType !== "FREE_TEXT" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  選択肢
                </label>
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={option.optionText}
                        onChange={(e) =>
                          updateOption(qIndex, optIndex, e.target.value)
                        }
                        className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder={`選択肢 ${optIndex + 1}`}
                      />
                      {question.options.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOption(qIndex, optIndex)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addOption(qIndex)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  + 選択肢を追加
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 送信ボタン */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting
            ? "保存中..."
            : mode === "create"
              ? "作成"
              : "更新"}
        </button>
      </div>
    </form>
  );
}
