import User from '../models/user.model.js';

export const getAllUsers = async(req , res , next) => {
    try{
        const users = await User.find();
        res.status(200).json({
            success: true,
            users: users
        })
    } catch(error) {
        console.log(error);
        next(error);
    }
};

export const getUserById = async(req , res , next) => {
    try{
        const userId = req.params.id;
        const user = await User.findById(userId);
        if(!userId){
            return res.status(404).json({
                success: false,
                message: "User id not provided"
            })
        }
        if(!user){
            return res.status(404).json({
                success: false,
                message: "No such user found"
            })
        }
        res.status(200).json({
            success: true,
            message: "user found successfully",
            user: user
        })
    } catch(error) {
        console.log(error.message);
        next(error);
    }
};

export const createNewUser = async(req , res , next) => {
    try{
        const userData = req.body;
        const newUser = await User.create(userData);
        if(!userData){
            return res.status(400).json({
                success: false,
                message: "User data not provided"
            })
        } 
        res.status(200).json({
            success: true,
            message: "User created successfully",
            newUser: newUser
        })
    } catch(error){
        console.log(error.message);
        next(error);
    }
}

export const updateUserData = async(req , res , next) => {
    try{
        const userId = req.params.id;
        const updatedData = req.body;
        const updatedUser = await User.findByIdAndUpdate(userId , updatedData , {new: true});
        if(!userId){
            return res.status(404).json({
                success: false,
                message: "User id not provided"
            })
        }
        if(!updatedData){
            return res.status(404).json({
                success: false,
                message: "No data provided to update"
            })
        }
        res.status(200).json({
            success: true,
            message: "User data updated successfully",
            updatedUser: updatedUser
        })
    } catch(error){
        console.log(error.message);
        next(error);
    }
}

export const deleteUserById = async(req , res , next) => {
    try{
        const userId = req.params.id;
        const deleteUser = await User.findByIdAndDelete(userId);
        if(!userId){
            return res.status(404).json({
                success: false,
                message: "User id not provided"
            })
        } 
        if(!deleteUser){
            return res.status(404).json({
                success: false,
                message: "No such user found"
            })
        }
        res.status(200).json({
            success: true,
            message: "User deleted successfully",
            deletedUser: deleteUser
        })
    } catch(error) {
        console.log(error.message);
        next(error);
    }
}

export const deleteAllUsers = async(req, res , next) => {
    try{
        const deleteUsers = await User.deleteMany();
        res.status(200).json({
            success: true,
            message: "All users deleted successfully",
            deletedUsers : deleteAllUsers
        })
    } catch(error) {
        console.log(error.message);
        next(error);
    }
}