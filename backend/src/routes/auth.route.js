import { Router } from "express";
import { login, signUp, logout, updateProfile } from "../controller/auth.controller.js";
import protectRoute from '../middleware/auth.middleware.js'
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = Router();

router.use(arcjetProtection);

// router.get('/test', arcjetProtection, (req,res) => {
//       res.status(200).json({ msg: "test route." });
// });
router.post('/signUp', signUp);

router.post('/login', login);

router.post('/logout', logout);

router.put('/update-profile', protectRoute, updateProfile);

router.get('/check', protectRoute, (req,res) => res.status(200).json(req.user));


export default router;