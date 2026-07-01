import { Request, Response } from "express";
import { User } from "../models/user.js";
import { Project } from "../models/project.js";

const ensureUserRecord = async (userId: string) => {
  return await User.findOneAndUpdate(
    { id: userId },
    {
      $setOnInsert: {
        email: `${userId}@no-reply.clerk`,
        name: "Clerk User",
        image: "",
        credits: 20,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
};

// Get User Credits
export const getUserCredits = async (req: Request, res: Response) => {
  try {
    const { userId } = req.auth();
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const user = await ensureUserRecord(userId);

    res.json({
      credits: user?.credits || 0,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.code || error.message,
    });
  }
};

// All User Projects
export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const { userId } = req.auth();
    const projects = await Project.find({ userId }).sort({ createdAt: -1 });

    const formattedProjects = projects.map((project) => ({
      ...project.toObject(),
      id: project._id.toString(),
    }));

    res.json({ projects: formattedProjects });
  } catch (error: any) {
    res.status(500).json({
      message: error.code || error.message,
    });
  }
};

// Specific Project
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.auth();
    const projectId = Array.isArray(req.params.projectId)
      ? req.params.projectId[0]
      : req.params.projectId;
    const project = await Project.findOne({ _id: projectId, userId });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const formattedProject = {
      ...project.toObject(),
      id: project._id.toString(),
    };

    res.json({ project: formattedProject });
  } catch (error: any) {
    res.status(500).json({
      message: error.code || error.message,
    });
  }
};

// Publish Toggler
export const toggleProjectPublic = async (req: Request, res: Response) => {
  try {
    const { userId } = req.auth();
    const projectId = Array.isArray(req.params.projectId)
      ? req.params.projectId[0]
      : req.params.projectId;
    const project = await Project.findOne({
      _id: projectId,
      userId,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (!project?.generatedImage && !project?.generatedVideo) {
      return res.status(404).json({
        message: "Image/Video is not yet generated",
      });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { isPublished: !project.isPublished },
      { new: true }
    );

    res.json({
      message: updatedProject?.isPublished
        ? "Project published successfully"
        : "Project unpublished successfully",
      isPublished: updatedProject?.isPublished,
      project: {
        ...updatedProject?.toObject(),
        id: updatedProject?._id.toString(),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.code || error.message,
    });
  }
};
