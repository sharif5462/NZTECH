import { Router } from "express";
import {
  getApplications,
  getApplicationById,
  submitApplication,
  updateStatus,
  runAiEvaluation,
} from "../controllers/applicationsController";
import { authenticate, authorize } from "../middlewares/auth";

const router = Router();

router.get("/", getApplications);
router.get("/:id", getApplicationById);
router.post("/", submitApplication);
router.post("/:id/status", authenticate, authorize(["ADMIN", "RECRUITER"]), updateStatus);
router.post("/:id/ai-match", authenticate, authorize(["ADMIN", "RECRUITER"]), runAiEvaluation);

export default router;
