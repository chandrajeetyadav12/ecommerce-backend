import User from "../models/User";

export const isSeller =
  async (req: any, res: any, next: any) => {
    const user =
      await User.findById(
        req.user.userId
      );

    if (
      !user ||
      user.role !== "seller" ||
      user.status !== "approved"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only approved sellers allowed",
      });
    }

    next();
  };