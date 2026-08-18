import Address from "../models/Address";

export const createAddress =
  async (req: any, res: any) => {
    try {
      const address =
        await Address.create({
          userId: req.user.userId,
          ...req.body,
        });

      res.status(201).json({
        success: true,
        address,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  export const getAddresses =
  async (req: any, res: any) => {
    try {
      const addresses =
        await Address.find({
          userId: req.user.userId,
        });

      res.json({
        success: true,
        addresses,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };