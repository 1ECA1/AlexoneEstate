import { Readable } from "node:stream";
import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "havenestate/properties",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    Readable.from(file.buffer).pipe(stream);
  });

export const uploadPropertyImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one image.",
      });
    }

    const results = await Promise.all(
      req.files.map(uploadToCloudinary)
    );

    res.status(200).json({
      success: true,
      images: results.map((image) => ({
        url: image.secure_url,
        publicId: image.public_id,
      })),
    });
  } catch (error) {
    next(error);
  }
};


export const uploadAgentProfilePhoto = async (req, res, next) => {
  try {
    if (req.user.role !== "agent") {
      return res.status(403).json({
        success: false,
        message: "Only agents can upload profile photos.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a profile photo.",
      });
    }

    const oldPublicId = req.user.profilePhotoPublicId;

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "havenestate/agents",
          resource_type: "image",
        },
        (error, uploadedImage) => {
          if (error) return reject(error);
          resolve(uploadedImage);
        }
      );

      Readable.from(req.file.buffer).pipe(stream);
    });

    req.user.profilePhotoUrl = result.secure_url;
    req.user.profilePhotoPublicId = result.public_id;

    await req.user.save();

    // Clean up the previous image after the new photo is saved.
    if (oldPublicId && oldPublicId !== result.public_id) {
      cloudinary.uploader.destroy(oldPublicId).catch(() => {});
    }

    res.status(200).json({
      success: true,
      message: "Profile photo updated successfully.",
      data: {
        profilePhotoUrl: req.user.profilePhotoUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};