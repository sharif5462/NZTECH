import { Router } from "express";
import { createReview } from "../controllers/reviewsController";
import { authenticate, authorize } from "../middlewares/auth";

const router = Router();

router.post("/", authenticate, authorize(["ADMIN", "RECRUITER", "REVIEWER"]), createReview);

export default router;
