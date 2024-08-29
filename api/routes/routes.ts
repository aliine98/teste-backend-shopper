import { Router } from 'express';
import { createCustomerMeasure } from '../controllers/customerMeasuresController.js';

export const router = Router();

router.post('/upload', createCustomerMeasure);
