import express from 'express';
import { submit, getRequests, takeAction } from '../controllers/RequestController.js';
import { authenticateToken } from '../middleware/auth.js';

const requestFormRouter = express.Router();

requestFormRouter.post('/', authenticateToken, submit);
requestFormRouter.get('/', authenticateToken, getRequests);
requestFormRouter.post('/:id/action', authenticateToken, takeAction);

export default requestFormRouter;


