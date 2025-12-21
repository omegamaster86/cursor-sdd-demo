import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/errors";
import type {
  SurveyWithQuestions,
  UpdateSurveyInput,
  Survey,
} from "@/lib/types";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * アンケート詳細を取得
 * GET /api/surveys/:id
 *
 * レスポンス: SurveyWithQuestions
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const surveyId = Number(id);

    if (Number.isNaN(surveyId)) {
      throw ApiError.badRequest("無効なIDです");
    }

    const survey = await prisma.survey.findUnique({
      where: { id: BigInt(surveyId) },
      include: {
        questions: {
          orderBy: { sortOrder: "asc" },
          include: {
            options: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });

    if (!survey) {
      throw ApiError.notFound("アンケート");
    }

    const result: SurveyWithQuestions = {
      id: Number(survey.id),
      title: survey.title,
      description: survey.description,
      createdAt: survey.createdAt,
      updatedAt: survey.updatedAt,
      questions: survey.questions.map((q) => ({
        id: Number(q.id),
        questionType: q.questionType,
        questionText: q.questionText,
        isRequired: q.isRequired,
        sortOrder: q.sortOrder,
        options: q.options.map((opt) => ({
          id: Number(opt.id),
          optionText: opt.optionText,
          sortOrder: opt.sortOrder,
        })),
      })),
    };

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * アンケートを更新
 * PUT /api/surveys/:id
 *
 * リクエスト: UpdateSurveyInput
 * レスポンス: Survey
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const surveyId = Number(id);

    if (Number.isNaN(surveyId)) {
      throw ApiError.badRequest("無効なIDです");
    }

    const body = (await request.json()) as UpdateSurveyInput;

    // 既存のアンケートを確認
    const existing = await prisma.survey.findUnique({
      where: { id: BigInt(surveyId) },
    });

    if (!existing) {
      throw ApiError.notFound("アンケート");
    }

    // トランザクションで更新
    const survey = await prisma.$transaction(async (tx) => {
      // アンケート基本情報を更新
      const updateData: { title?: string; description?: string | null } = {};
      if (body.title !== undefined) {
        if (!body.title.trim()) {
          throw ApiError.validationError({ title: ["タイトルは必須です"] });
        }
        updateData.title = body.title.trim();
      }
      if (body.description !== undefined) {
        updateData.description = body.description?.trim() || null;
      }

      // 質問がある場合は置き換え
      if (body.questions !== undefined) {
        // 既存の質問を削除（カスケードで選択肢も削除）
        await tx.question.deleteMany({
          where: { surveyId: BigInt(surveyId) },
        });

        // 新しい質問を作成
        for (let i = 0; i < body.questions.length; i++) {
          const q = body.questions[i];
          await tx.question.create({
            data: {
              surveyId: BigInt(surveyId),
              questionType: q.questionType,
              questionText: q.questionText,
              isRequired: q.isRequired ?? false,
              sortOrder: i,
              options: {
                create:
                  q.options?.map((opt, optIndex) => ({
                    optionText: opt.optionText,
                    sortOrder: optIndex,
                  })) || [],
              },
            },
          });
        }
      }

      // アンケートを更新
      return tx.survey.update({
        where: { id: BigInt(surveyId) },
        data: updateData,
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    const result: Survey = {
      id: Number(survey.id),
      title: survey.title,
      description: survey.description,
      createdAt: survey.createdAt,
      updatedAt: survey.updatedAt,
    };

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
