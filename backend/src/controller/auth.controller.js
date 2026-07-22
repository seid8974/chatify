import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '../emails/emailHandlers.js';
import { ENV } from '../lib/env.js';
import User from '../models/user.model.js';
import cloudinary from '../lib/cloudinary.js';
import { generateToken } from '../lib/utils.js';

export const signUp = async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({ msg: "All Fields are Required!" });
        }
        if (password.length < 6) {
            return res.status(400).json({ msg: "Password Must be at least 6 characters!" });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ msg: "Invalid email format!" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: "Email Already Exists!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ fullName, email, password: hashedPassword });
        const savedUser = await newUser.save();

        generateToken(savedUser._id, res);

        try {
            await sendWelcomeEmail(savedUser.email, savedUser.fullName, ENV.CLIENT_URL);
        } catch (emailError) {
            console.error("Failed to send welcome email:", emailError.message);
        }

        return res.status(201).json({
            _id: savedUser._id,
            fullName: savedUser.fullName,
            email: savedUser.email,
            profilePic: savedUser.profilePic
        });
    } catch (error) {
        console.error("Error in signUp controller:", error.message);
        res.status(500).json({ msg: "Internal Server Error!" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ msg: "Email and Password are Required!" });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Invalid Credentials!" });

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) return res.status(400).json({ msg: "Invalid Credentials!" });

        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic
        });
    } catch (error) {
        console.error("Error in login controller:", error.message);
        res.status(500).json({ msg: "Internal Server Error!" });
    }
};

export const logout = (_, res) => {
    res.cookie("jwt", "", {
        maxAge: 0,
        httpOnly: true,
        sameSite: "strict",
        secure: ENV.NODE_ENV !== "development"
    });
    res.status(200).json({ msg: "Logged out successfully!" });
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        if (!profilePic) return res.status(400).json({ msg: "Profile picture is Required!" });

        const userId = req.user._id;
        const uploadResponse = await cloudinary.uploader.upload(profilePic);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url },
            { new: true }
        ).select("-password");

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error in updateProfile controller:", error.message);
        res.status(500).json({ msg: "Internal Server Error!" });
    }
};
