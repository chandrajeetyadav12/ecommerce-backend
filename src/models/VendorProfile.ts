import mongoose from "mongoose";

const vendorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    shopName: {
      type: String,
      required: true,
    },

    gstType: {
      type: String,
      enum: ["GST", "NON_GST"],
      required: true,
    },

    gstNumber: {
      type: String,
      default: "",
    },

    panNumber: {
      type: String,
      required: true,
    },

    pickupAddress: {
      addressLine1: {
        type: String,
        required: true,
      },

      addressLine2: {
        type: String,
      },

      city: {
        type: String,
        required: true,
      },

      state: {
        type: String,
        required: true,
      },

      pincode: {
        type: String,
        required: true,
      },
    },

    bankDetails: {
      accountHolderName: {
        type: String,
        required: true,
      },

      accountNumber: {
        type: String,
        required: true,
      },

      ifscCode: {
        type: String,
        required: true,
      },

      bankName: {
        type: String,
        required: true,
      },
    },

    documents: {
      gstCertificate: {
        type: String,
        default: "",
      },

      panCard: {
        type: String,
        default: "",
      },

      aadhaarCard: {
        type: String,
        default: "",
      },
    },

    verificationStatus: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
      ],
      default: "pending",
    },

    rejectionReason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "VendorProfile",
  vendorProfileSchema
);