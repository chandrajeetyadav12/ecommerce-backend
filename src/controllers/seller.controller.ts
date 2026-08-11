import { Request, Response } from "express";
import VendorProfile from "../models/VendorProfile";
import User from "../models/User";
import { uploadToCloudinary } from "../utils/uploadToCloudinary";
export const createSellerProfile = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      shopName,
      gstType,
      gstNumber,
      panNumber,

      addressLine1,
      addressLine2,
      city,
      state,
      pincode,

      accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
    } = req.body;

    const pickupAddress = {
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
    };
    const bankDetails = {
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
    };
    const userId = (req as any).user.userId;
    //  upload files
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    let panCardUrl = "";
    let aadhaarCardUrl = "";
    let gstCertificateUrl = "";

    // pan
    if (files?.panCard?.[0]) {
      panCardUrl =
        await uploadToCloudinary(
          files.panCard[0].buffer,
          "seller-documents"
        );
    }
    // Aadhaar
    if (files?.aadhaarCard?.[0]) {
      aadhaarCardUrl =
        await uploadToCloudinary(
          files.aadhaarCard[0].buffer,
          "seller-documents"
        );
    }
    // gst
    if (files?.gstCertificate?.[0]) {
      gstCertificateUrl =
        await uploadToCloudinary(
          files.gstCertificate[0].buffer,
          "seller-documents"
        );
    }

    const existingProfile =
      await VendorProfile.findOne({
        userId,
      });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message:
          "Seller profile already exists",
      });
    }

    const profile =
      await VendorProfile.create({
        userId,
        shopName,
        gstType,
        gstNumber,
        panNumber,
        pickupAddress,
        bankDetails,
        documents: {
          panCard: panCardUrl,
          aadhaarCard: aadhaarCardUrl,
          gstCertificate: gstCertificateUrl,
        },
      });

 

    return res.status(201).json({
      success: true,
      profile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error,
    });
  }
};

export const getMySellerProfile =
  async (
    req: any,
    res: Response
  ) => {
    try {
      const profile =
        await VendorProfile.findOne({
          userId: req.user.userId,
        });

      return res.json({
        success: true,
        profile,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error,
      });
    }
  };

export const getPendingSellers =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const sellers =
        await VendorProfile.find({
          verificationStatus:
            "pending",
        }).populate(
          "userId",
          "name email status"
        );

      return res.json({
        success: true,
        sellers,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error,
      });
    }
  };

//approve seller profile
export const approveSeller =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { sellerId } =
        req.params;

      await VendorProfile.findOneAndUpdate(
        {
          userId: sellerId,
        },
        {
          verificationStatus:
            "approved",
        }
      );

      await User.findByIdAndUpdate(
        sellerId,
        {
          role: "seller",
          status: "approved",
        }
      );

      return res.json({
        success: true,
        message:
          "Seller Approved",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error,
      });
    }
  };
//reject seller profile
export const rejectSeller =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { sellerId } =
        req.params;

      const { reason } =
        req.body;

      await VendorProfile.findOneAndUpdate(
        {
          userId: sellerId,
        },
        {
          verificationStatus:
            "rejected",
          rejectionReason:
            reason,
        }
      );

      await User.findByIdAndUpdate(
        sellerId,
        {
          role: "customer",
          status: "active",
        }
      );

      return res.json({
        success: true,
        message:
          "Seller Rejected",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error,
      });
    }
  };