import express, {Request, Response } from 'express';
import Note from '../models/Notes';
import User from '../models/user';

// this is from the existing authentication middleware
import jwt from 'jsonwebtoken'

const router = express.Router();

const authenticateToken = (req: Request | any, res: Response): boolean => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expects "Bearer <token>"

  if (!token) {
    res.status(401).json({ message: 'Access Denied: No token provided' });
    return false;
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // Attaches decoded user info (like _id) to req.user
    return true;
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token' });
    return false;
  }
};

router.post('/send', async (req: any, res: any) => {
    try{
        const {receiverUsername, content} = req.body;
        const senderId = req.user._id;

        if(!receiverUsername || !content){
            return res.status(400).json({message: 'Recipient user and content are required'});
        }

        const receiver = await User.findOne({username: receiverUsername});
        if (!receiver){
            return res.status(404).json({message: 'User not found'});
        }

        if (receiver._id.toString() === senderId.toString()){
            return res.status(400).json({message: 'Cannot send notes to yourself'});
        }

        const newNote = await Note.create({
            sender: senderId,
            receiver: receiver._id,
            content,
            status: 'inbox'
        })

        const populatedNote = await newNote.populate('sender', 'username');

        res.status(201).json(populatedNote);
    } catch(error){
        res.status(500).json({message: 'Server error sending note', error});
    }
})

router.get('/', async (req:any, res:any) => {
    try{
        const userId = req.user._id;
        const statusFilter = req.query.status || 'inbox';
        const notes = await Note.find({
            receiver: userId,
            status: statusFilter
        })
        .populate('sender', 'username')
        .sort({createdAt: -1})

        res.status(200).json(notes);
    } catch(error){
        res.status(500).json({message: 'Server error fecthing note', error});
    }
})

router.patch('/:id/status', async (req:any, res:any) => {
    try{
        const {status} = req.body;
        const noteId = req.params.id;
        const userId = req.user._id;

        if (!['inbox', 'saved', 'trash'].includes(status)){
            return res.status(400).json({mesage: 'Invalid status update parameters'});
        }

        const note = await Note.findOne({_id: noteId, receiver: userId});
        if (!note){
            return res.status(404).json({message: 'Note not found or unauthorized access'});
        }

        note.status = status;
        await note.save();

        res.status(200).json({message: `Note moved to ${status} successfully`, note});
    } catch(error){
        res.status(500).json({message: 'Sever error updating note status', error});
    }
})

export default router; 