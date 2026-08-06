import express from 'express'
import cors from 'cors'
import requestFormRouter from './routes/RequestFormRoute.js'
import authRouter from './routes/AuthRoute.js'

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);
app.use('/Review', requestFormRouter);

app.get('/', (req, res) => {
    res.send('Backend is live 🚀');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("Server is running on PORT", PORT);
});



