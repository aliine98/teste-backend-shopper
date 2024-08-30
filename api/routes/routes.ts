import { Router } from 'express';
import { confirmCustomerMeasure, createCustomerMeasure } from '../controllers/customerMeasuresController.js';

export const router = Router();

router.post('/upload', createCustomerMeasure);
router.patch('/confirm', confirmCustomerMeasure);
