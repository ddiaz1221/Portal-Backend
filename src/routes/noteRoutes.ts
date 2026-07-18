import express, { Request, Response, NextFunction } from 'express';
import Note from '../models/Notes';
import User from '../models/user';
import jwt from 'jsonwebtoken';

const router = express.Router();

// 1. Properly structured Express Middleware
const authenticateToken = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expects "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No token provided' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'your_fallback_jwt_secret';
    const verified = jwt.verify(token, secret);
    req.user = verified; // Attaches decoded user info (like _id) to req.user
    next(); // Pass control to the next handler
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// 2. Protect routes by passing 'authenticateToken' as the second argument
router.post('/send', authenticateToken, async (req: any, res: any) => {
  try {
    const { receiverUsername, content } = req.body;
    const senderId = req.user._id;

    if (!receiverUsername || !content) {
      return res.status(400).json({ message: 'Recipient user and content are required' });
    }

    const receiver = await User.findOne({ username: receiverUsername });
    if (!receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (receiver._id.toString() === senderId.toString()) {
      return res.status(400).json({ message: 'Cannot send notes to yourself' });
    }

    const newNote = await Note.create({
      sender: senderId,
      receiver: receiver._id,
      content,
      status: 'inbox'
    });

    const populatedNote = await Note.findById(newNote._id).populate('sender', 'user');
    res.status(201).json(populatedNote);
  } catch (error) {
    console.error("CRITICAL BACKEND ERROR IN /SEND:", error);

    return res.status(500).json({ 
        message: 'Server error sending note',
        error: error instanceof Error ? error.message : String(error) 
    });
  }
});

router.get('/', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user._id;
    const statusFilter = req.query.status || 'inbox';
    const notes = await Note.find({
      receiver: userId,
      status: statusFilter
    })
    .populate('sender', 'username')
    .sort({ createdAt: -1 });

    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching notes', error });
  }
});

router.patch('/:id/status', authenticateToken, async (req: any, res: any) => {
  try {
    const { status } = req.body;
    const noteId = req.params.id;
    const userId = req.user._id;

    if (!['inbox', 'saved', 'trash'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status update parameters' });
    }

    const note = await Note.findOne({ _id: noteId, receiver: userId });
    if (!note) {
      return res.status(404).json({ message: 'Note not found or unauthorized access' });
    }

    note.status = status;
    await note.save();

    res.status(200).json({ message: `Note moved to ${status} successfully`, note });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating note status', error });
  }
});

export default router;