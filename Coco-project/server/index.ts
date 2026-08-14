import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chatRoutes';

dotenv.config({ path: '../.env' });

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({ origin: process.env.VITE_API_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Coco backend is running' });
});

app.use('/api/chat', chatRoutes);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
