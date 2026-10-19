import { Router } from "express";
import { register, login, getMe, getDemoUsers, logout } from "../controllers/authController";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authenticate, getMe);
router.get("/users", getDemoUsers);

export default router;
