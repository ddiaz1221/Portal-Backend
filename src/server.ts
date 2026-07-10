import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './database';
import userRoutes from './routes/userRoutes';
import noteRoutes from './routes/noteRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// this is a call to the database so a connection can be made
connectDB();

// middleware of the server
app.use(cors({origin: 'http://localhost:5173'}));
app.use(express.json());  /*this allows the server to detect JSON payloads in the front end of website */


app.use('/api/users', userRoutes);
app.use('/api/notes', noteRoutes);

// These are endpoint tests
app.get('/', (req: Request, res: Response) => {
    res.send('Backend server is running smoohtly!');
});

app.listen(PORT, () => {
    console.log(`Server is sprinting on port ${PORT}`);
});
