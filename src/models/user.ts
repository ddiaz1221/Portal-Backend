import {Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string;
    password?: string; 
    createdAt: Date;
}

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
})

const User = model<IUser>('User', userSchema);
export default User;