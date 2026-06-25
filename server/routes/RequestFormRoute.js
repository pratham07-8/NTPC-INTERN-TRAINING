import express from 'express'
import { submit } from '../controllers/RequestController.js';

const requestFormRouter = express.Router();

requestFormRouter.post('/',submit);

export default requestFormRouter;

