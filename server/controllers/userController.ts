import { Request, Response } from "express";
import { User } from "../models/user.js";
import { Project } from "../models/project.js";

// Get User Credits
export const getUserCredits = async (req: Request, res: Response) => {
  try {
    const { userId } = req.auth();
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const user = await User.findOne({ id: userId });

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

    res.json({ projects });
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

    res.json({ project });
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
      isPublished: updatedProject?.isPublished,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.code || error.message,
    });
  }
};
