import express from 'express';
import cors from 'cors';
import { router } from './api/routes/routes.js';
import { connectDb } from './api/config/db.js';

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors());
app.use(router);
app.use(express.urlencoded({ limit: '50mb', extended: true }));
const port = 3333;
connectDb();

function showPort() {
    console.log(`Listening on port ${port}`);
}

app.listen(port, showPort);
