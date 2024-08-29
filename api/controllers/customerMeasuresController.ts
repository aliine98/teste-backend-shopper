import { Request, Response } from 'express';
import { CustomerMeasuresModel, IMeasure } from '../models/CustomerMeasuresModel.js';
import { model, prompt, fileManager } from '../config/google-ai.js';
import fs from 'fs';
import { UploadFileResponse } from '@google/generative-ai/server';
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
        const uploadResponse = await decodeAndSaveImage(req);

        const generatedContent = await generateContentFromImage(uploadResponse);

        const customer = await CustomerMeasuresModel.findOne({ customer_code: req.body.customer_code });
        const newMeasure: IMeasure = {
            image_url: uploadResponse.file.uri,
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
async function generateContentFromImage(uploadResponse: UploadFileResponse): Promise<GenerateContentResult> {
    return await model.generateContent([
        prompt,
        {
            fileData: {
                mimeType: uploadResponse.file.mimeType,
                fileUri: uploadResponse.file.uri,
            },
        },
    ]);
}

async function decodeAndSaveImage(req: Request): Promise<UploadFileResponse> {
    const buf = Buffer.from(req.body.image, 'base64');
    await fs.writeFile('b64DecodedImage.png', buf, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log('The file was saved!');
        }
    });

    const uploadResponse = await fileManager.uploadFile('b64DecodedImage.png', {
        mimeType: 'image/png',
        displayName: 'customer-measure',
    });
    return uploadResponse;
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
