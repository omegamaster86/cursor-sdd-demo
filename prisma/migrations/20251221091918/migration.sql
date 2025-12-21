-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'FREE_TEXT');

-- CreateTable
CREATE TABLE "t_survey" (
    "id" BIGSERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "t_survey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_question" (
    "id" BIGSERIAL NOT NULL,
    "survey_id" BIGINT NOT NULL,
    "question_type" "QuestionType" NOT NULL,
    "question_text" TEXT NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "t_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_question_option" (
    "id" BIGSERIAL NOT NULL,
    "question_id" BIGINT NOT NULL,
    "option_text" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "t_question_option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_response" (
    "id" BIGSERIAL NOT NULL,
    "survey_id" BIGINT NOT NULL,
    "respondent_name" VARCHAR(100),
    "submitted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "t_response_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_answer" (
    "id" BIGSERIAL NOT NULL,
    "response_id" BIGINT NOT NULL,
    "question_id" BIGINT NOT NULL,
    "selected_option_id" BIGINT,
    "answer_text" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "t_answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_notice" (
    "id" BIGSERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "t_notice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_question_survey" ON "t_question"("survey_id");

-- CreateIndex
CREATE INDEX "idx_response_survey" ON "t_response"("survey_id");

-- CreateIndex
CREATE INDEX "idx_notice_published" ON "t_notice"("is_published", "published_at");

-- AddForeignKey
ALTER TABLE "t_question" ADD CONSTRAINT "t_question_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "t_survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_question_option" ADD CONSTRAINT "t_question_option_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "t_question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_response" ADD CONSTRAINT "t_response_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "t_survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_answer" ADD CONSTRAINT "t_answer_response_id_fkey" FOREIGN KEY ("response_id") REFERENCES "t_response"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_answer" ADD CONSTRAINT "t_answer_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "t_question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
