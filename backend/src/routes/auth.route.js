import { Router } from "express";
import { login, signUp, logout, update } from "../controller/auth.controller.js";

const router = Router();

router.get('/signUp', signUp);

router.get('/login', login);

router.get('/logout', logout);

router.get('/update', update);


export default router;