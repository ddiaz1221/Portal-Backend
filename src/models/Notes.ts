import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required: true
    },
    content: {
        type: String,
        reuqired: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
})
export default mongoose.model('Note', NoteSchema);