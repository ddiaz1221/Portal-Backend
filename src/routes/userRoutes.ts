import {Router, Request, Response} from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user';
import jwt from 'jsonwebtoken';
import Notes from '../models/Notes';

const router = Router();

// this is creating the API doors for the website
router.post('/register', async (req: Request, res: Response): Promise<void> => {
    try {

        const { username, email, password } = req.body;
        if (!username || !email || !password){
            res.status(400).json({message: 'All field are required' });
            return;
        }

        const userExists = await User.findOne({ $or: [{ email}, {username}] });
        if (userExists){
            res.status(400).json({message: 'Username or Email already registered'});
            return;
        }

        // this section is going to encrypt the password using hashing
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            username,
            email,
            password: hashedPass
        })

        res.status(201).json({
            message: 'User registered successfully!',
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                createdAt: newUser.createdAt,
            }
        })
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: (error as Error).message });
    }
})

router.post('/login', async (req, res) => {
    try{
        const {email, password} = req.body;

        const user = await User.findOne({email});
        if (!user){ 
            return res.status(400).json({message: 'Invlid Email or Password' });
        }

        const isMatch = await bcrypt.compare(password, user.password!);
        if (!isMatch){
            return res.status(400).json({message: 'Invalid Email or Password'});
        }

        // this is for the json JWT token so no logout on refresh
        const secret = process.env.JWT_SECRET || 'your_fallback_jwt_secret';
        const token = jwt.sign(
            {id: user.id, username: user.username, email: user.email},
            secret,
            {expiresIn: '1d'}
        )

        res.status(200).json({
            message: 'Login Sucessful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (error){
        console.error('Login Error:', error);
        res.status(500).json({message: 'Server error during login'});
    }
})

router.put('/update-username/:userId', async (req, res) => {
    try {
        const {userId} = req.params;
        const {newUsername} = req.body;

        if (!newUsername || newUsername.trim() === ''){
            return res.status(400).json({message: 'Username cannont be empty'});
        }
        const updateUser = await User.findByIdAndUpdate( userId, {username: newUsername}, {new: true});

        if (!updateUser){
            return res.status(404).json({message: 'User not found'});
        }

        res.status(200).json({
            message: 'Username updated successfully',
            username: updateUser.username
        })
    } catch(error){
        console.error('Update Username Error:', error);
        res.status(500).json({message: 'Server error updating username'});
    }
})

router.put('/update-password/:userId', async (req, res) => {
    try{
        const {userId} = req.params;
        const {newPassword} = req.body;

        if (!newPassword || newPassword.length < 6){
            return res.status(400).json({message: 'Password must be at least 6 characters long'});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const updateUser = await User.findByIdAndUpdate(userId, {password: hashedPassword}, {new: true});

        if (!updateUser){
            return res.status(404).json({message: 'User not found'});
        }
        res.status(200).json({message: 'Password updated Sucessfully'});
    } catch (error){
        console.error('Updated Password Error:', error);
        res.status(500).json({message: 'Server errror updating password'});
    }
})

router.delete('/delete-account/:userId', async (req, res) => {
    try{
        const {userId} = req.params;

        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser){
            return res.status(404).json({message: 'User not found'});
        }

        await Notes.deleteMany({userId});
        res.status(200).json({message: 'Account permantly closed.'});
    } catch(error){
        console.error('Delete Account Error', error);
        res.status(500).json({message: 'Server errror deleting account'});
    }
})

export default router;
