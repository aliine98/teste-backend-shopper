import express from 'express';
import cors from 'cors';
import { router } from './api/routes/routes.js';
import { connectDb } from './api/config/db.js';

const app = express();
app.use(express.json());
app.use(cors());
app.use(router);
const port = 3333;
connectDb();

function showPort() {
    console.log(`Listening on port ${port}`);
}

app.listen(port, showPort);
