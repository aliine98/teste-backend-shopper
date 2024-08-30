import { Schema, model } from 'mongoose';

export interface IMeasure {
    image_url: string;
    measure_value: number;
    measure_datetime: Date;
    measure_type: string;
    has_confirmed: boolean;
    measure_uuid: string;
}

interface ICustomerMeasures {
    customer_code: string;
    measures: IMeasure[];
}

const MeasureSchema = new Schema<ICustomerMeasures>({
    customer_code: {
        type: String,
        required: true,
    },
    measures: {
        type: [
            {
                image_url: String,
                measure_value: Number,
                measure_datetime: Date,
                measure_type: String,
                has_confirmed: Boolean,
                measure_uuid: String,
            },
        ],
        required: true,
    },
});

export const CustomerMeasuresModel = model<ICustomerMeasures>('CustomerMeasure', MeasureSchema);
