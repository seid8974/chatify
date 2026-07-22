import { Router } from "express";
import protectRoute from "../middleware/auth.middleware.js"
import { getAllContacts, getMessagesByIdUserId, sendMessage, getChatPartners, markMessagesAsRead, deleteMessage } from "../controller/message.controller.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = Router();

router.use(arcjetProtection, protectRoute);

router.get('/contacts', getAllContacts);
router.get('/chats', getChatPartners);
router.get('/:id', getMessagesByIdUserId);
router.post('/send/:id', sendMessage);
router.put('/read/:senderId', markMessagesAsRead);
router.delete('/:id', deleteMessage);

export default router;