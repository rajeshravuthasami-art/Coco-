import { Request, Response } from 'express';
import { generateChatResponse } from '../services/aiService';

export const handleChat = async (req: Request, res: Response) => {
    try {
        const { messages, lengthPreference = 'medium', language = 'auto' } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array is required' });
        }

        // Set up SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const stream = await generateChatResponse(messages, lengthPreference, language);

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
        }

        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error: any) {
        console.error('Chat error:', error);
        res.write(`data: ${JSON.stringify({ error: error.message || 'An error occurred during chat generation.' })}\n\n`);
        res.end();
    }
};
