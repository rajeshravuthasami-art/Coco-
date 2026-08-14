import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const generateChatResponse = async (messages, lengthPreference, language) => {
    let lengthInstruction = '';
    switch (lengthPreference) {
        case 'short':
            lengthInstruction = 'Keep your response brief and concise.';
            break;
        case 'long':
            lengthInstruction = 'Provide a very detailed, comprehensive, and exhaustive response.';
            break;
        case 'medium':
        default:
            lengthInstruction = 'Provide a balanced, moderately detailed response.';
            break;
    }

    const languageInstruction = language !== 'auto' ? `Respond in ${language}. ` : 'Automatically detect the user\'s language and respond in that same language. Support English, Tamil, Hindi, Telugu, Malayalam, Kannada, Bengali, and others.';

    const systemPrompt = `You are Coco, a helpful, intelligent, and premium AI assistant.
You answer questions on any topic including education, coding, business, travel, health information (non-diagnostic), shopping recommendations, writing, translation, and everyday conversations.
For product or shopping questions, provide concise comparisons, recommendations, pros/cons, and value-for-money suggestions.
${languageInstruction}
${lengthInstruction}`;

    const formattedMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
    ];

    const stream = await openai.chat.completions.create({
        model: 'gpt-4o', // Using a current valid model identifier
        messages: formattedMessages,
        stream: true,
    });

    return stream;
};
