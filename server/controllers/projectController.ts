import { Request, Response } from "express";
import { User } from "../models/user.js";
import { Project } from "../models/project.js";
import { v2 as cloudinary } from "cloudinary";
import {
  GenerateContentConfig,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/genai";

import fs from "fs";
import path from "path";
import ai from "../configs/ai.js";
import axios from "axios";

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

const loadImage = (path: string, mimeType: string) => {
  return {
    inlineData: {
      data: fs.readFileSync(path).toString("base64"),
      mimeType,
    },
  };
};

export async function createProject(req: Request, res: Response) {
  let tempProjectId: string | undefined;
  const { userId } = req.auth();
  let isCreditDeducted = false;

  const {
    name = "New Project",
    aspectRatio,
    userPrompt,
    productName,
    productDescription,
    targetLength = 5,
  } = req.body;

  const images: any = req.files;

  if (!images || !Array.isArray(images) || images.length < 2 || !productName) {
    return res.status(400).json({
      message: "Please upload at least 2 images",
    });
  }

  // Validate images have required properties
  if (
    !images[0]?.path ||
    !images[1]?.path ||
    !images[0]?.mimetype ||
    !images[1]?.mimetype
  ) {
    return res.status(400).json({
      message: "Invalid image files uploaded",
    });
  }

  const user = await ensureUserRecord(userId);

  if (!user || user.credits < 5) {
    return res.status(401).json({ message: "Insufficient credits" });
  }

  // deduct credits for image generation
  try {
    await User.findOneAndUpdate(
      { id: userId },
      { $inc: { credits: -5 } },
      { new: true },
    );
    isCreditDeducted = true;
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "Failed to deduct credits: " + error.message });
  }

  try {
    let uploadedImages = await Promise.all(
      images.map(async (item: any) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return result.secure_url;
      }),
    );

    const project = new Project({
      name,
      userId,
      productName,
      productDescription,
      userPrompt,
      aspectRatio,
      targetLength: Math.max(1, parseInt(targetLength) || 5),
      uploadedImages,
      isGenerating: true,
    });

    await project.save();
    tempProjectId = project._id.toString();

    // AI integration
    const preferredModels = [
      "gemini-2.5-flash-image-preview",
      "gemini-3-pro-image-preview",
    ];
    let model = preferredModels[0];
    const generationConfig: GenerateContentConfig = {
      maxOutputTokens: 32768,
      temperature: 1,
      topP: 0.95,
      responseModalities: ["IMAGE"],
      imageConfig: {
        aspectRatio: aspectRatio || "9:16",
        imageSize: "1K",
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.OFF,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.OFF,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.OFF,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.OFF,
        },
      ],
    };

    // generate images using ai model
    const img1base64 = loadImage(images[0].path, images[0].mimetype);
    const img2base64 = loadImage(images[1].path, images[1].mimetype);

    const prompt = {
      text: `Combine the person and product into a realistic photo.
      Make the person naturally hold or use the product.
      Match lighting, shadows scale, and perspective.
      Make the person stand in professional studio lighting.
      Output ecommerce-quality photo realistic imagery.
      ${userPrompt}`,
    };

    let response: any;
    try {
      response = await ai.models.generateContent({
        model,
        contents: [img1base64, img2base64, prompt],
        config: generationConfig,
      });
    } catch (error: any) {
      if (preferredModels.length > 1) {
        model = preferredModels[1];
        console.warn(
          `Primary model failed, retrying with fallback model ${model}:`,
          error.message,
        );
        response = await ai.models.generateContent({
          model,
          contents: [img1base64, img2base64, prompt],
          config: generationConfig,
        });
      } else {
        throw error;
      }
    }

    if (!response.candidates?.[0].content?.parts) {
      throw new Error("Unexpect response");
    }

    const parts = response.candidates[0].content.parts;
    let finalBuffer: Buffer | null = null;

    for (const part of parts) {
      if (part.inlineData) {
        finalBuffer = Buffer.from(part.inlineData.data, "base64");
      }
    }

    if (!finalBuffer) {
      throw new Error("Failed to generate image");
    }

    const base64Image = `data:image/png;base64,${finalBuffer.toString("base64")}`;

    const uploadResult = await cloudinary.uploader.upload(base64Image, {
      resource_type: "image",
    });

    await Project.findByIdAndUpdate(project._id, {
      generatedImage: uploadResult.secure_url,
      isGenerating: false,
    });

    res.json({
      projectId: project._id.toString(),
      message: "Image generation started successfully",
    });

    // error catching
  } catch (error: any) {
    if (tempProjectId) {
      // update project status & error message
      await Project.findByIdAndUpdate(tempProjectId, {
        isGenerating: false,
        error: error.message,
      });
    }

    if (isCreditDeducted) {
      // add credits back
      await User.findOneAndUpdate(
        { id: userId },
        { $inc: { credits: 5 } },
        { new: true },
      );
    }

    res.status(500).json({
      message: error.message,
    });
  }
}

export async function createVideo(req: Request, res: Response) {
  const { userId } = req.auth();
  const { projectId } = req.body;

  if (!projectId || typeof projectId !== "string") {
    return res.status(400).json({
      message: "Project ID is required",
    });
  }

  let isCreditDeducted = false;
  const user = await ensureUserRecord(userId);

  if (!user || user.credits < 10) {
    return res.status(401).json({
      message: "Insufficient credits",
    });
  }

  // deduct credits for video generation
  try {
    await User.findOneAndUpdate(
      { id: userId },
      { $inc: { credits: -10 } },
      { new: true },
    );
    isCreditDeducted = true;
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "Failed to deduct credits: " + error.message });
  }

  try {
    const project = await Project.findOne({ _id: projectId, userId });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (project.isGenerating) {
      return res.status(409).json({
        message: "Video generation already in progress",
      });
    }

    if (project.generatedVideo) {
      return res.status(409).json({
        message: "Video already generated for this project",
      });
    }

    if (!project.generatedImage) {
      return res.status(400).json({
        message: "Generated image not found. Create image first",
      });
    }

    await Project.findByIdAndUpdate(projectId, { isGenerating: true });

    const prompt = `make the person showcase the product which is ${project.productName} ${project.productDescription && `and Product Description: ${project.productDescription}`}`;

    const model = "veo-3.1-generate-preview";

    const image = await axios.get(project.generatedImage, {
      responseType: "arraybuffer",
      timeout: 30000, // 30 second timeout
    });
    const imageBytes: any = Buffer.from(image.data);

    let operation: any = await ai.models.generateVideos({
      model,
      prompt,
      image: {
        imageBytes: imageBytes.toString("base64"),
        mimeType: "image/png",
      },
      config: {
        aspectRatio: project?.aspectRatio || "9:16",
        numberOfVideos: 1,
        resolution: "720p",
      },
    });

    // Poll with timeout (max 5 minutes = 300 seconds)
    let pollCount = 0;
    const maxPolls = 30; // 30 * 10 seconds = 5 minutes

    while (!operation.done && pollCount < maxPolls) {
      console.log(
        `Waiting for video generation... (${pollCount + 1}/${maxPolls})`,
      );
      await new Promise((resolve) => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({
        operation: operation,
      });
      pollCount++;
    }

    if (pollCount >= maxPolls) {
      throw new Error("Video generation timeout - operation took too long");
    }

    if (!operation.response?.generatedVideos?.[0]?.video) {
      const filterReason =
        operation.response?.raiMediaFilteredReasons?.[0] ||
        "Video generation failed";
      throw new Error(filterReason);
    }

    const filename = `${userId}-${Date.now()}.mp4`;
    const filePath = path.join("videos", filename);

    // create videos directory if absent
    fs.mkdirSync("videos", { recursive: true });

    // download the video
    try {
      await ai.files.download({
        file: operation.response.generatedVideos[0].video,
        downloadPath: filePath,
      });
    } catch (downloadError: any) {
      throw new Error(`Failed to download video: ${downloadError.message}`);
    }

    if (!fs.existsSync(filePath)) {
      throw new Error("Downloaded video file not found");
    }

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "video",
    });

    await Project.findByIdAndUpdate(projectId, {
      generatedVideo: uploadResult.secure_url,
      isGenerating: false,
    });

    // remove video file from disk after upload
    try {
      fs.unlinkSync(filePath);
    } catch (cleanupError) {
      console.warn(`Failed to clean up temp video file: ${filePath}`);
    }

    res.json({
      message: "Video generation completed",
      videoUrl: uploadResult.secure_url,
    });
  } catch (error: any) {
    // update project status & error message
    await Project.findByIdAndUpdate(projectId, {
      isGenerating: false,
      error: error.message,
    });

    // add credits back
    if (isCreditDeducted) {
      await User.findOneAndUpdate(
        { id: userId },
        { $inc: { credits: 10 } },
        { new: true },
      );
    }
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function getAllPublishedProjects(req: Request, res: Response) {
  try {
    const projects = await Project.find({ isPublished: true }).sort({
      createdAt: -1,
    });

    // Populate user info for each project
    const enrichedProjects = await Promise.all(
      projects.map(async (project) => {
        const user = await User.findOne({ id: project.userId });
        return {
          ...project.toObject(),
          id: project._id.toString(),
          user: {
            name: user?.name || "Unknown",
            image: user?.image || "",
            id: user?.id,
          },
        };
      }),
    );

    res.json({ projects: enrichedProjects });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function deleteProject(req: Request, res: Response) {
  try {
    const { userId } = req.auth();
    const projectId = Array.isArray(req.params.projectId)
      ? req.params.projectId[0]
      : req.params.projectId;

    const project = await Project.findOne({ _id: projectId, userId });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await Project.deleteOne({ _id: projectId });

    res.json({ message: "Project deleted" });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
}
