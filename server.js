import express from 'express';
import dotenv from 'dotenv';
import { PORT } from './config/env.js';
import connectToDatabase from './database/mongodb.js';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import aqiRouter from './routes/aqi.routes.js';
import weatherRouter from './routes/weather.routes.js';
import trafficRouter from './routes/traffic.routes.js';
import sentimentRouter from './routes/sentiment.routes.js';
import cityPulseRouter from './routes/citypulse.routes.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/api/v1/auth" , authRouter);
app.use("/api/v1/users" , userRouter);
app.use("/api/v1/aqi" , aqiRouter);
app.use("/api/v1/weather" , weatherRouter);
app.use("/api/v1/traffic" , trafficRouter);
app.use("/api/v1/sentiment" , sentimentRouter);
app.use("/api/v1/citypulse" , cityPulseRouter);

app.get('/' , (req, res) => {
    res.send("Welcome to the social media api");
})
app.listen(PORT, async () =>{
    console.log(`Listening to server on http://localhost:${PORT}`);

    await connectToDatabase();
});

export default app;