import mongoose, {Schema, Document} from 'mongoose';

export interface INote extends Document {
    sender: mongoose.Types.ObjectId;
    receiver: mongoose.Types.ObjectId;
    content: string;
    status: 'inbox' | 'saved' | 'trash';
    createdAt: Date;
}

const NoteSchema: Schema = new Schema(
    {
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        recevier: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true,
            trim: true
        },
        status:{
            type: String,
            enum: ['inbox', 'saved', 'trash'],
            default: 'inbox'
        }
    },
    {timestamps: true}
);

export default mongoose.model<INote>('Note', NoteSchema);