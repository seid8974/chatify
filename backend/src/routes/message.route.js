import { Router } from "express";
import { receiveMessage, sendMessage } from "../controller/message.controller";
const router = Router();

router.get('/send', sendMessage);

router.get('/receive', receiveMessage);

export default router;