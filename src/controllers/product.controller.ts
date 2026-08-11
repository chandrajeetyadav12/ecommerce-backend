import Product from "../models/Product";
import { uploadToCloudinary } from "../utils/uploadToCloudinary";
export const createProduct =
    async (req: any, res: any) => {
        try {
            console.log("BODY:", req.body);
            console.log("FILE:", req.file);
            const {
                name,
                description,
                category,
                price,
                stock,
            } = req.body;
console.log("Before Cloudinary");
            let imageUrl = "";
            if (req.file) {
                imageUrl =
                    await uploadToCloudinary(
                        req.file.buffer,
                        "products"
                    );
            }
            console.log("After Cloudinary");
            console.log("Before Product Create");
            const product =
                await Product.create({
                    sellerId:
                        req.user.userId,
                    name,
                    description,
                    category,
                    price,
                    stock,
                    images: imageUrl ? [imageUrl] : [],
                });
console.log("After Product Create");
            return res.status(201).json({
                success: true,
                product,
            });
        } catch (error: any) {
            console.error(
                "CREATE PRODUCT ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    };

export const getMyProducts =
    async (req: any, res: any) => {
        try {
            const products =
                await Product.find({
                    sellerId:
                        req.user.userId,
                }).populate(
                    "category",
                    "name"
                );;

            return res.json({
                success: true,
                products,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                error,
            });
        }
    };

//admin getting pending products
export const getPendingProducts =
    async (req: any, res: any) => {
        try {
            const products =
                await Product.find({
                    status: "pending",
                }).populate(
                    "sellerId",
                    "name email"
                ).populate(
                    "category",
                    "name"
                );;

            return res.json({
                success: true,
                products,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message:
                    error.message,
            });
        }
    };
// Get All Approved Products (Customer Side)
export const getProducts =
    async (
        req: any,
        res: any
    ) => {
        try {
            const products =
                await Product.find({
                    status:
                        "approved",
                }).populate(
                    "category",
                    "name"
                );;

            return res.json({
                success: true,
                products,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message:
                    error.message,
            });
        }
    };

//   Approve Product (Admin)
export const approveProduct =
    async (
        req: any,
        res: any
    ) => {
        try {
            await Product.findByIdAndUpdate(
                req.params.id,
                {
                    status:
                        "approved",
                }
            );

            return res.json({
                success: true,
                message:
                    "Product approved",
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message:
                    error.message,
            });
        }
    };

//   Reject Product (Admin)
export const rejectProduct =
    async (
        req: any,
        res: any
    ) => {
        try {
            await Product.findByIdAndUpdate(
                req.params.id,
                {
                    status:
                        "rejected",
                }
            );

            return res.json({
                success: true,
                message:
                    "Product rejected",
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message:
                    error.message,
            });
        }
    };

export const getProductById = async (
    req: any,
    res: any
) => {
    try {
        const product =
            await Product.findById(
                req.params.id
            );

        if (!product) {
            return res.status(404).json({
                success: false,
                message:
                    "Product not found",
            });
        }

        return res.json({
            success: true,
            product,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateProduct = async (
    req: any,
    res: any
) => {
    try {
        const product =
            await Product.findOne({
                _id: req.params.id,
                sellerId:
                    req.user.userId,
            });

        if (!product) {
            return res.status(404).json({
                success: false,
                message:
                    "Product not found",
            });
        }

        let imageUrls =
            product.images;

        if (req.file) {
            const uploadedUrl =
                await uploadToCloudinary(
                    req.file.buffer,
                    "products"
                );

            imageUrls = [
                uploadedUrl,
            ];
        }

        const updatedProduct =
            await Product.findByIdAndUpdate(
                req.params.id,
                {
                    ...req.body,
                    images: imageUrls,
                },
                { new: true }
            );

        return res.json({
            success: true,
            product:
                updatedProduct,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message:
                error.message,
        });
    }
};


export const deleteProduct = async (
    req: any,
    res: any
) => {
    try {
        const product =
            await Product.findOne({
                _id: req.params.id,
                sellerId:
                    req.user.userId,
            });

        if (!product) {
            return res.status(404).json({
                success: false,
                message:
                    "Product not found",
            });
        }

        await Product.findByIdAndDelete(
            req.params.id
        );

        return res.json({
            success: true,
            message:
                "Product deleted successfully",
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message:
                error.message,
        });
    }
};

