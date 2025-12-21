import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // アンケート1: 顧客満足度調査
  const survey1 = await prisma.survey.create({
    data: {
      title: "顧客満足度調査",
      description: "サービス改善のための顧客満足度に関するアンケートです。",
      questions: {
        create: [
          {
            questionType: "SINGLE_CHOICE",
            questionText: "サービス全体の満足度を教えてください",
            isRequired: true,
            sortOrder: 0,
            options: {
              create: [
                { optionText: "非常に満足", sortOrder: 0 },
                { optionText: "満足", sortOrder: 1 },
                { optionText: "普通", sortOrder: 2 },
                { optionText: "不満", sortOrder: 3 },
                { optionText: "非常に不満", sortOrder: 4 },
              ],
            },
          },
          {
            questionType: "MULTIPLE_CHOICE",
            questionText: "特に良かった点を選んでください（複数選択可）",
            isRequired: false,
            sortOrder: 1,
            options: {
              create: [
                { optionText: "対応の速さ", sortOrder: 0 },
                { optionText: "スタッフの対応", sortOrder: 1 },
                { optionText: "サービスの品質", sortOrder: 2 },
                { optionText: "価格", sortOrder: 3 },
                { optionText: "使いやすさ", sortOrder: 4 },
              ],
            },
          },
          {
            questionType: "FREE_TEXT",
            questionText: "その他ご意見・ご要望があればお聞かせください",
            isRequired: false,
            sortOrder: 2,
          },
        ],
      },
    },
  });
  console.log(`  Created survey: ${survey1.title}`);

  // アンケート2: 社内イベント希望調査
  const survey2 = await prisma.survey.create({
    data: {
      title: "社内イベント希望調査",
      description: "次回の社内イベントについてご意見をお聞かせください。",
      questions: {
        create: [
          {
            questionType: "SINGLE_CHOICE",
            questionText: "希望するイベントの種類は？",
            isRequired: true,
            sortOrder: 0,
            options: {
              create: [
                { optionText: "スポーツ大会", sortOrder: 0 },
                { optionText: "BBQ", sortOrder: 1 },
                { optionText: "ボードゲーム会", sortOrder: 2 },
                { optionText: "勉強会・LT会", sortOrder: 3 },
                { optionText: "飲み会", sortOrder: 4 },
              ],
            },
          },
          {
            questionType: "SINGLE_CHOICE",
            questionText: "希望する開催時期は？",
            isRequired: true,
            sortOrder: 1,
            options: {
              create: [
                { optionText: "1月〜3月", sortOrder: 0 },
                { optionText: "4月〜6月", sortOrder: 1 },
                { optionText: "7月〜9月", sortOrder: 2 },
                { optionText: "10月〜12月", sortOrder: 3 },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`  Created survey: ${survey2.title}`);

  // アンケート3: 新機能フィードバック
  const survey3 = await prisma.survey.create({
    data: {
      title: "新機能フィードバック",
      description: "新しくリリースした機能についてのフィードバックをお願いします。",
      questions: {
        create: [
          {
            questionType: "SINGLE_CHOICE",
            questionText: "新機能は使いやすいですか？",
            isRequired: true,
            sortOrder: 0,
            options: {
              create: [
                { optionText: "とても使いやすい", sortOrder: 0 },
                { optionText: "使いやすい", sortOrder: 1 },
                { optionText: "普通", sortOrder: 2 },
                { optionText: "使いにくい", sortOrder: 3 },
                { optionText: "とても使いにくい", sortOrder: 4 },
              ],
            },
          },
          {
            questionType: "FREE_TEXT",
            questionText: "改善してほしい点があれば教えてください",
            isRequired: false,
            sortOrder: 1,
          },
        ],
      },
    },
  });
  console.log(`  Created survey: ${survey3.title}`);

  // ダミー回答を追加（survey1に3件）
  for (let i = 0; i < 3; i++) {
    await prisma.response.create({
      data: {
        surveyId: survey1.id,
        respondentName: `回答者${i + 1}`,
      },
    });
  }
  console.log("  Added 3 responses to survey1");

  // お知らせ
  await prisma.notice.create({
    data: {
      title: "システムメンテナンスのお知らせ",
      content: "2024年1月15日（月）AM2:00〜AM5:00の間、システムメンテナンスを実施します。",
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  await prisma.notice.create({
    data: {
      title: "新機能リリースのお知らせ",
      content: "アンケート機能をリリースしました。詳細はヘルプをご覧ください。",
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  await prisma.notice.create({
    data: {
      title: "（下書き）年末年始の営業について",
      content: "年末年始の営業日程についてお知らせします。",
      isPublished: false,
    },
  });
  console.log("  Created 3 notices");

  console.log("✅ Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
