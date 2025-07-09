import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
export const signup = async (req, res) => {
    // Handle user signup logic here
    const { email, fullName, password } = req.body;
    try {
        if(!email || !fullName || !password) {
            return res.status(400).json({ message: "Please fill all the fields" });
        }   
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }
        
        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ message: "User already exists" });
           
        
            
        
    }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            email,
            fullName ,
            password: hashedPassword
        })
if (newUser) {
//generate JWT token here
generateToken(newUser._id, res);
await newUser.save();
        return res.status(201).json({ 
            _id: newUser._id,
            email: newUser.email,
            fullName: newUser.fullName,
            profilePic: newUser.profilePic,
         });
    }
}
    // Handle errors
    catch (error) {
        console.log("Error in signup controller", error.message) ;
         res.status(500).json({ message: "Internal server error" });   
    }
    // res.send("signup route");
};
export const login = async (req, res) => {
    const { email, password } = req.body;
    // Handle user login logic here
   try {
    const user = await User.findOne({email})
if(!user){
    return res.status(400).json({ message: "Invalid credentials" });
}

   const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Invalid Password" });
    }
    
    
   generateToken(user._id, res)
   res.status(200).json({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    profilePic: user.profilePic,
   })

   } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal server error" });
    
   };
};
export const logout = (req, res) => {
    // Handle user logout logic here
    // res.send("logout route");
    try {
        res.cookie("jwt", "", {maxAge:0, })
    res.status(200).json({ message: "Logged out successfully"});
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ message: "Internal server error" });
        
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;

        if (!profilePic) {
            return res.status(400).json({ message: "Please provide a profile picture" });
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic)
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url },
            { new: true }
        );
        res.status(200).json(updatedUser);
            
    } catch (error) {
        console.log("Unable to update ProfilePic", error);
        res.status(500).json({ message: "Internal server error" });        
    }
};

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({ message: "Internal server error" });
        
    }};