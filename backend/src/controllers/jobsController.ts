import { Request, Response } from "express";
import prisma from "../config/db";
import { AuthRequest } from "../types";

export async function getJobs(req: Request, res: Response): Promise<void> {
  try {
    const { search, department, type, status } = req.query;

    const where: any = {};
    if (status) where.status = String(status);
    if (department) where.department = String(department);
    if (type) where.type = String(type);
    if (search) {
      where.OR = [
        { title: { contains: String(search), mode: "insensitive" } },
        { description: { contains: String(search), mode: "insensitive" } },
        { requiredSkills: { contains: String(search), mode: "insensitive" } },
      ];
    }

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        _count: { select: { applications: true } },
      },
    });

    res.json({ jobs });
  } catch (error) {
    console.error("Get jobs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getDepartments(_req: Request, res: Response): Promise<void> {
  try {
    const jobs = await prisma.job.findMany({
      select: { department: true },
      distinct: ["department"],
    });
    const departments = jobs.map((j) => j.department);
    res.json({ departments });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getJobById(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        applications: {
          select: {
            id: true,
            candidateName: true,
            status: true,
            aiScore: true,
            compositeScore: true,
          },
        },
      },
    });

    if (!job) {
      res.status(404).json({ error: "Job position not found" });
      return;
    }

    res.json({ job });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function createJob(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthenticated" });
      return;
    }

    const job = await prisma.job.create({
      data: {
        ...req.body,
        createdById: req.user.userId,
      },
    });

    res.status(201).json({ message: "Job created successfully", job });
  } catch (error) {
    console.error("Create job error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteJob(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    await prisma.job.delete({ where: { id } });
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
