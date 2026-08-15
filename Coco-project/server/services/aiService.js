import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
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

    const languageInstruction = language !== 'auto' ? `Respond in ${language}. ` : 'Respond in whatever language the user writes in.';

    const systemPrompt = `You are Coco, a helpful, intelligent, and premium AI assistant.
You answer questions on any topic including education, coding, business, travel, health information (non-diagnostic), shopping recommendations, writing, translation, and everyday conversations.
For product or shopping questions, provide concise comparisons, recommendations, pros/cons, and value-for-money suggestions.
${languageInstruction}
${lengthInstruction}`;

    // Ensure we only pass user/assistant roles to Anthropic
    const formattedMessages = messages.filter(m => m.role === 'user' || m.role === 'assistant').map(m => ({
        role: m.role,
        content: m.content
    }));

    const stream = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: systemPrompt,
        messages: formattedMessages,
        stream: true,
    });

    return stream;
};
