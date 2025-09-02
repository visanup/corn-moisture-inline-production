// services/data-service/src/routes/index.ts
import { Router } from 'express';
import resultsRouter from './results';
import interfaceResultsRouter from './interfaceResults';

const mainRouter = Router();

mainRouter.use('/results', resultsRouter);
mainRouter.use('/interface-results', interfaceResultsRouter);

export default mainRouter;
