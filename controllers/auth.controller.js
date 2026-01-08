import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import {JWT_EXPIRES_IN, JWT_SECRET} from '../config/env.js';

export const signUp = async (req , res, next) => {
    
    const session = await mongoose.startSession();
    session.startTransaction();

    try{
        const {name , email , password} = req.body;
        const existingUser = await User.findOne({email});

        if(existingUser) {
            const error = new Error("User already exists");
            error.statusCode = 400;
            throw error;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password , salt);

        const newUsers = await User.create([{name: name , email: email , password: hashedPassword}] , {session});

        const token = jwt.sign({userId: newUsers[0]._id} , JWT_SECRET , {expiresIn: JWT_EXPIRES_IN});

        await session.commitTransaction();
        // End session
        session.endSession();

        res.status(200).json({
            success: true,
            message: 'User created successfully',
            data: {
                token,
                user: newUsers[0],
            }
        })

    } catch(error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}

export const signIn = async(req, res, next) => {
    //Implement the sign-in logic
    try{
        const {email , password} = req.body;

        const user = await User.findOne({email});

        if(!user){
            throw new Error("User not found");
        }

        const isPasswordValid = await bcrypt.compare(password , user.password);
        if(!isPasswordValid) {
            const error = new Error("Password invalid");
            error.statusCode = 404;
            throw error;
        }

        const token = jwt.sign({userId : user._id} , JWT_SECRET , {expiresIn : JWT_EXPIRES_IN});

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            data: {
                token,
                user,
            }
        });

    } catch(error){
        res.status(500).json({
            success: false,
            message: "User not registered" || "An error occurred during login",
        })
    }
}

export const signOut = async(req, res, next) => {};