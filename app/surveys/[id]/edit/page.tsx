/**
 * アンケート編集ページ
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { SurveyForm } from "../../_components/SurveyForm";
import type { SurveyWithQuestions } from "@/lib/types";

type PageProps = {
  params: Promise<{ id: string }>;
};

/**
 * アンケートデータを取得
 */
async function getSurvey(id: string): Promise<SurveyWithQuestions | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/surveys/${id}`, {
    cache: "no-store",
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error("アンケートの取得に失敗しました");
  }

  return res.json();
}

export default async function EditSurveyPage({ params }: PageProps) {
  const { id } = await params;
  const survey = await getSurvey(id);

  if (!survey) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* パンくず */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/surveys" className="text-blue-600 hover:underline">
                アンケート一覧
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-600">{survey.title}</li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-600">編集</li>
          </ol>
        </nav>

        {/* タイトル */}
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          アンケートを編集
        </h1>

        {/* フォーム */}
        <div className="rounded-lg bg-white p-6 shadow">
          <SurveyForm initialData={survey} mode="edit" />
        </div>
      </div>
    </div>
  );
}
