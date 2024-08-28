import { Schema, model } from 'mongoose';

interface IMeasure {
    image_url: string;
    measure_value: number;
}

const MeasureSchema = new Schema<IMeasure>({
    image_url: {
        type: String,
        required: true,
    },
    measure_value: {
        type: Number,
        required: true,
    },
});

export const MeasureModel = model<IMeasure>('measure', MeasureSchema);
