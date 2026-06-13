import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);


app.get('/', (req, res) => {
    res.send('Welcome to the Chatify API!');
});

app.listen(PORT, () =>
    console.log(`server is running on port ${PORT}`)
);
