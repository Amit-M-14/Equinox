import mongoose, {Schema, Document} from 'mongoose';

export interface IExecutionLog extends Document {
    prompt: string;
    logs: string[];
    files: string[];
    status: 'RUNNING' | 'COMPLETED' | 'FAILED';
    createdAt: Date;
}

const ExecutionLogSchema: Schema = new Schema({
    prompt: { type: String, required: true },
    logs: { type: [String], default: [] },
    files: { type: [String], default: [] },
    status: { type: String, enum: ['RUNNING', 'COMPLETED', 'FAILED'], default: 'RUNNING' },
    createdAt: { type: Date, default: Date.now }
})

export default mongoose.model<IExecutionLog>('ExecutionLog', ExecutionLogSchema);