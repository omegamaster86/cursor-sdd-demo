import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/errors";
import type { CreateSurveyInput, Survey } from "@/lib/types";

/**
 * アンケート一覧を取得
 * GET /api/surveys
 *
 * レスポンス: SurveyListItem[]
 * - id: number
 * - title: string
 * - createdAt: Date
 * - responseCount: number
 */
export async function GET() {
  try {
    const surveys = await prisma.survey.findMany({
      select: {
        id: true,
        title: true,
        createdAt: true,
        _count: {
          select: {
            responses: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const result = surveys.map((survey) => ({
      id: Number(survey.id),
      title: survey.title,
      createdAt: survey.createdAt,
      responseCount: survey._count.responses,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch surveys:", error);
    return NextResponse.json(
      { error: "アンケート一覧の取得に失敗しました" },
      { status: 500 },
    );
  }
}

/**
 * アンケートを作成
 * POST /api/surveys
 *
 * リクエスト: CreateSurveyInput
 * レスポンス: Survey
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateSurveyInput;

    // バリデーション
    if (!body.title?.trim()) {
      throw ApiError.validationError({ title: ["タイトルは必須です"] });
    }

    // アンケートと質問を一括で作成
    const survey = await prisma.survey.create({
      data: {
        title: body.title.trim(),
        description: body.description?.trim() || null,
        questions: {
          create: body.questions?.map((q, index) => ({
            questionType: q.questionType,
            questionText: q.questionText,
            isRequired: q.isRequired ?? false,
            sortOrder: index,
            options: {
              create:
                q.options?.map((opt, optIndex) => ({
                  optionText: opt.optionText,
                  sortOrder: optIndex,
                })) || [],
            },
          })) || [],
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const result: Survey = {
      id: Number(survey.id),
      title: survey.title,
      description: survey.description,
      createdAt: survey.createdAt,
      updatedAt: survey.updatedAt,
    };

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
