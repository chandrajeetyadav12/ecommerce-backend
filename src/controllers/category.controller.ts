import Category from "../models/Category";

export const createCategory =
  async (req: any, res: any) => {
    try {
      const category =
        await Category.create({
          name: req.body.name,
        });

      return res.json({
        success: true,
        category,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

export const getCategories =
  async (req: any, res: any) => {
    try {
      const categories =
        await Category.find();

      return res.json({
        success: true,
        categories,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };