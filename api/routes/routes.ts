import { Router } from 'express';
import { confirmCustomerMeasure, createCustomerMeasure, listCustomerMeasures } from '../controllers/customerMeasuresController.js';

export const router = Router();

router.post('/upload', createCustomerMeasure);
router.patch('/confirm', confirmCustomerMeasure);
router.get('/:customer_code/list', listCustomerMeasures);
