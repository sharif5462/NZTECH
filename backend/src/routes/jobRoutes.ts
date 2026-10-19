import { Router } from "express";
import { getJobs, getJobById, createJob, deleteJob, getDepartments } from "../controllers/jobsController";
import { authenticate, authorize } from "../middlewares/auth";

const router = Router();

router.get("/", getJobs);
router.get("/departments", getDepartments);
router.get("/:id", getJobById);
router.post("/", authenticate, authorize(["ADMIN", "RECRUITER"]), createJob);
router.delete("/:id", authenticate, authorize(["ADMIN"]), deleteJob);

export default router;
