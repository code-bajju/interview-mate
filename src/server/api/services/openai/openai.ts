/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Configuration, OpenAIApi } from "openai";
import {
  type GetIntroductionPromptParams,
  type GetNextQuestionPromptParams,
  Prompts,
  MockInterviewServiceType,
} from "./prompts/prompts";
import { env } from "~/env.mjs";
import { GetFeedbackForAnswerParams } from "./prompts/get-feedback-for-answer";
import { GetFeedbackForAnswerV2Response } from "./prompts/get-feedback-for-answers.v2";
const configuration = new Configuration({
  organization: "org-wGQSQOlnl30MtUnbW35FfICR",
  apiKey: env.OPENAI_API_KEY,
});

const model = env.CHAT_GPT_MODEL;
export const openai = new OpenAIApi(configuration);

export const createOpenAICompletion = async ({
  prompt,
}: {
  prompt: string;
}) => {
  const res = await openai.createChatCompletion({
    model,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 3000,
    temperature: 0.55,
  });
  return res.data.choices[0]?.message?.content.trim();
};

const getOpenAiResponse = async <R>(props: { prompt: string; fallback: R }) => {
  const res = await createOpenAICompletion({ prompt: props.prompt });
  try {
    return res ? JSON.parse(res) : props.fallback;
  } catch (error) {
    throw new Error(
      `Error while parsing: ${res || ""}, Error: ${
        error as string
      } \n Prompt: ${props.prompt}`
    );
  }
};

export const MockInterviewAiService: MockInterviewServiceType = {
  getIntroduction: async (params) => {
    const fallback = {
      introduction: "error",
      introductionQuestion: "error",
      nameOfTheJobPosting: "error",
    };
    return await getOpenAiResponse<GetIntroductionResponse>({
      prompt: Prompts.getIntroduction(params),
      fallback,
    });
  },
  getNextQuestion: async (params) => {
    const fallback: GetNextQuestionResponse = {
      feedback: "error",
      nextQuestion: "error",
      response: "error",
      satisfaction: -1,
      topics: ["error"],
    };

    return await getOpenAiResponse<GetNextQuestionResponse>({
      prompt: Prompts.getNextQuestion(params),
      fallback,
    });
  },
  getFeedbackForAnswer: async (params) => {
    return await getOpenAiResponse({
      prompt: Prompts.getFeedbackForAnswer(params),
      fallback: {},
    });
  },
  getFeedbackForAnswerV2: async (params) => {
    return await getOpenAiResponse({
      prompt: Prompts.getFeedbackForAnswerV2(params),
      fallback: {},
    });
  },
  getQuestions: async (params) =>
    await getOpenAiResponse({
      prompt: Prompts.getQuestions(params),
      fallback: {},
    }),
  getQuestionsV2: async (params) =>
    await getOpenAiResponse({
      prompt: Prompts.getQuestionsV2(params),
      fallback: {},
    }),
};

export type GetIntroductionResponse = {
  introduction: string;
  nameOfTheJobPosting: string;
  introductionQuestion: string;
};

export type GetNextQuestionResponse = {
  response: string;
  nextQuestion: string;
  feedback: string;
  satisfaction: number;
  topics: string[];
};
