import { Request, Response } from 'express';
import { CustomerMeasuresModel, IMeasure } from '../models/CustomerMeasuresModel.js';
import { model, prompt } from '../config/google-ai.js';
import { GenerateContentResult } from '@google/generative-ai';

//POST /upload
export async function createCustomerMeasure(req: Request, res: Response) {
    if (!isBodyValid(req.body)) {
        res.status(400).json({
            error_code: 'INVALID_DATA',
            error_description: 'Dados inválidos. Por favor informe customer_code, measure_datetime, measure_type válidos e imagem no formato base64.',
        });
        return;
    }

    try {
        const generatedContent = await generateContentFromImage(req.body.image);

        const customer = await CustomerMeasuresModel.findOne({ customer_code: req.body.customer_code });
        const newMeasure: IMeasure = {
            image_url: `data:image/png;base64,${req.body.image}`,
            measure_value: Number(generatedContent.response.text()) || 0,
            measure_datetime: new Date(req.body.measure_datetime),
            measure_type: req.body.measure_type,
            has_confirmed: false,
            measure_uuid: crypto.randomUUID(),
        };

        if (customer) {
            const isMeasureAlreadyRegistered = customer!.measures.some(
                m => m.measure_datetime.getMonth() === new Date(req.body.measure_datetime).getMonth() && m.measure_type === req.body.measure_type
            );
            if (isMeasureAlreadyRegistered) {
                res.status(409).json({
                    error_code: 'DOUBLE_REPORT',
                    error_description: 'Leitura do mês já realizada',
                });
                return;
            }
            customer!.measures.push(newMeasure);
            await customer!.save();
            res.status(200).json({
                image_url: newMeasure.image_url,
                measure_value: newMeasure.measure_value,
                measure_uuid: newMeasure.measure_uuid,
            });
        } else {
            const newCustomerMeasures = new CustomerMeasuresModel({
                customer_code: req.body.customer_code,
                measures: [newMeasure],
            });
            await newCustomerMeasures.save();
            res.status(200).json({
                image_url: newMeasure.image_url,
                measure_value: newMeasure.measure_value,
                measure_uuid: newMeasure.measure_uuid,
            });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

//PATCH /confirm
export async function confirmCustomerMeasure(req: Request, res: Response) {
    const customer = await CustomerMeasuresModel.findOne({ measures: { $elemMatch: { measure_uuid: req.body.measure_uuid } } }).exec();
    if (!customer) {
        res.status(404).json({
            error_code: 'MEASURE_NOT_FOUND',
            error_description: 'Leitura não encontrada',
        });
        return;
    }

    if (typeof req.body.measure_uuid !== 'string' || isNaN(req.body.confirmed_value)) {
        res.status(400).json({
            error_code: 'INVALID_DATA',
            error_description: 'Dados inválidos. Por favor informe measure_uuid e confirmed_value válidos.',
        });
        return;
    }

    const measure = customer.measures.find(m => m.measure_uuid === req.body.measure_uuid);

    if (measure!.has_confirmed) {
        res.status(409).json({
            error_code: 'CONFIRMATION_DUPLICATE',
            error_description: 'Leitura do mês já confirmada',
        });
        return;
    }

    measure!.has_confirmed = true;
    measure!.measure_value = req.body.confirmed_value;
    await customer.save();
    res.status(200).json({ success: true });
}

//GET /<customer code>/list
export async function listCustomerMeasures(req: Request, res: Response) {
    const customer = await CustomerMeasuresModel.findOne({ customer_code: req.params.customer_code });
    if (!customer || customer.measures.length === 0) {
        res.status(404).json({
            error_code: 'MEASURES_NOT_FOUND',
            error_description: 'Nenhuma leitura encontrada',
        });
        return;
    }

    const measure_type = req.query.measure_type;
    if (measure_type && measure_type.toString().toLowerCase() !== 'water' && measure_type.toString().toLowerCase() !== 'gas') {
        res.status(400).json({
            error_code: 'INVALID_TYPE',
            error_description: 'Tipo de medição não permitida',
        });
        return;
    }

    if (measure_type) {
        const filteredMeasures = customer.measures.filter(m => m.measure_type.toLowerCase() === measure_type.toString().toLowerCase());
        res.status(200).json({
            customer_code: req.params.customer_code,
            measures: filteredMeasures,
        });
        return;
    }

    res.status(200).json(customer);
}

async function generateContentFromImage(image: string): Promise<GenerateContentResult> {
    return await model.generateContent([
        prompt,
        {
            inlineData: {
                data: image,
                mimeType: 'image/png',
            },
        },
    ]);
}

function isBase64(str: string): boolean {
    return str.length % 4 == 0 && /^[A-Za-z0-9+/]+[=]{0,2}$/.test(str);
}

function isBodyValid(body: any): boolean {
    return (
        typeof body.customer_code === 'string' &&
        typeof body.measure_datetime === 'string' &&
        !isNaN(new Date(body.measure_datetime).getMonth()) &&
        (body.measure_type.toLowerCase() === 'water' || body.measure_type.toLowerCase() === 'gas') &&
        typeof body.image === 'string' &&
        isBase64(body.image)
    );
}
