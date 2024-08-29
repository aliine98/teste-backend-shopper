import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import 'dotenv/config';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
});

export const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY || '');

export const prompt = 'Qual o valor da medição do consumo de água ou gás deste medidor? Informe apenas o valor numérico.';
