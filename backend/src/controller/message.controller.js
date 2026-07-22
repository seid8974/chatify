import Message from '../models/message.model.js';
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { isValidObjectId } from 'mongoose';
import { getReceiverSocketId, io } from '../lib/socket.js';

export const getAllContacts = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error("Error in getAllContacts:", error.message);
        res.status(500).json({ msg: "Internal Server Error!" });
    }
};

export const getMessagesByIdUserId = async (req, res) => {
    try {
        const myId = req.user._id;
        const { id: userToChatId } = req.params;

        if (!isValidObjectId(userToChatId)) {
            return res.status(400).json({ msg: "Invalid user ID" });
        }

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        });

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getMessagesByIdUserId:", error.message);
        res.status(500).json({ msg: "Internal Server Error!" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        if (!text && !image) {
            return res.status(400).json({ msg: "Text or Image is Required!" });
        }

        if (!isValidObjectId(receiverId)) {
            return res.status(400).json({ msg: "Invalid receiver ID" });
        }

        if (senderId.equals(receiverId)) {
            return res.status(400).json({ msg: "Cannot send messages to yourself!" });
        }

        const receiverExists = await User.exists({ _id: receiverId });
        if (!receiverExists) {
            return res.status(404).json({ msg: "Receiver Not Found!" });
        }

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({ senderId, receiverId, text, image: imageUrl });
        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error in sendMessage:", error.message);
        res.status(500).json({ msg: "Internal Server Error!" });
    }
};

export const getChatPartners = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: loggedInUserId },
                { receiverId: loggedInUserId }
            ]
        }).sort({ createdAt: -1 });

        const chatPartnerMap = {};
        messages.forEach((msg) => {
            const partnerId = msg.senderId.toString() === loggedInUserId.toString()
                ? msg.receiverId.toString()
                : msg.senderId.toString();
            if (!chatPartnerMap[partnerId]) {
                chatPartnerMap[partnerId] = msg;
            }
        });

        const chatPartnerIds = Object.keys(chatPartnerMap);
        const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");

        const result = chatPartners.map(partner => ({
            ...partner.toObject(),
            lastMessage: chatPartnerMap[partner._id.toString()]
        }));

        result.sort((a, b) => new Date(b.lastMessage?.createdAt) - new Date(a.lastMessage?.createdAt));

        res.status(200).json(result);
    } catch (error) {
        console.error("Error in getChatPartners:", error.message);
        res.status(500).json({ msg: "Internal Server Error!" });
    }
};

export const markMessagesAsRead = async (req, res) => {
    try {
        const { senderId } = req.params;
        const receiverId = req.user._id;

        if (!isValidObjectId(senderId)) {
            return res.status(400).json({ msg: "Invalid sender ID" });
        }

        await Message.updateMany(
            { senderId, receiverId, read: false },
            { read: true }
        );

        const senderSocketId = getReceiverSocketId(senderId);
        if (senderSocketId) {
            io.to(senderSocketId).emit("messagesRead", { by: receiverId.toString() });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error in markMessagesAsRead:", error.message);
        res.status(500).json({ msg: "Internal Server Error!" });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ msg: "Invalid message ID" });
        }

        const message = await Message.findById(id);
        if (!message) return res.status(404).json({ msg: "Message not found!" });

        if (message.senderId.toString() !== userId.toString()) {
            return res.status(403).json({ msg: "You can only delete your own messages!" });
        }

        if (message.image) {
            try {
                // extract public_id — handles folder paths like "folder/filename"
                const urlParts = message.image.split('/');
                const uploadIndex = urlParts.indexOf('upload');
                // public_id is everything after "upload/v{version}/" without extension
                const publicIdWithExt = urlParts.slice(uploadIndex + 2).join('/');
                const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
                await cloudinary.uploader.destroy(publicId);
            } catch (cloudinaryError) {
                console.error("Cloudinary delete failed:", cloudinaryError.message);
            }
        }

        await Message.findByIdAndDelete(id);

        const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("messageDeleted", id);
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error in deleteMessage:", error.message);
        res.status(500).json({ msg: "Internal Server Error!" });
    }
};
