import express from 'express';
import Note from '../models/Notes';

const router = express.Router();

// this is to save an new Note
router.post('/save', async (req, res) => {
    try{
        const {userId, content} = req.body;

        if (!userId || !content){
            return res.status(400).json({message: 'Missing user ID or cotnent' });
        }

        const newNote = new Note({userId, content});
        await newNote.save();

        res.status(201).json({message: 'Note saved sucessfully', note: newNote});
    } catch(error){
        console.error('Save Note Error:', error);
        res.status(500).json({message: 'Server error while saving note'});
    }
})

// this fetches all the notes made by a specific user
router.get('/:userId', async (req, res) => {
    try{
        const {userId} = req.params;

        // this is going to find the notes only matching a users unique ID sorting by newest first
        const notes = await Note.find({userId, isDeleted: false}).sort({createdAt: -1});
        res.status(200).json(notes);
    } catch(error){
        console.error('Fetch Notes Error:', error);
        res.status(500).json({message: 'Server error while fetching notes'});
    }
})

router.get('/trash/:userId', async (req, res) => {
    try{
        const {userId} = req.params;
        const trashedNotes = await Note.find({userId, isDeleted: true}).sort({createdAt: -1});
        res.status(200).json(trashedNotes);
    } catch(error){
        console.error('Fetch Trash Error', error);
        res.status(500).json({message: 'Server error while fetching trash'});
    }
})

router.put('/status/:noteId', async (req, res) => {
    try {
        const {noteId} = req.params;
        const {isDeleted} = req.body;

        const updatedNote = await Note.findByIdAndUpdate(noteId, {isDeleted}, {new: true});

        if (!updatedNote){
            return res.status(404).json({message: 'Note Not Found'});
        }

        res.status(200).json({message: 'Note Status Updated', note: updatedNote});
    } catch(error){
        console.error('Toggle Delete Status Error:', error);
        res.status(500).json({message: 'Server error updating note status'});
    }
})

router.delete('/purge/:noteId', async (req, res) => {
    try {
        const {noteId} = req.params;
        const deleteNote = await Note.findByIdAndDelete(noteId);

        if(!deleteNote){
            return res.status(404).json({message: 'Note not found'});
        }
        res.status(200).json({message: 'Note permanently removed from database'});
    } catch(error){
        console.error('Purge Note Error', error);
        res.status(500).json({message: 'Server error during hard deletion'});
    }
})

export default router;
