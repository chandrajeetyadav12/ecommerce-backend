import Cart from "../models/Cart";
import Product from "../models/Product";

export const getCart = async (req: any, res: any) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.userId }).populate({
      path: "items.productId",
      populate: { path: "category", select: "name" },
    });

    return res.json({
      success: true,
      cart: cart || { userId: req.user.userId, items: [] },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const addToCart = async (req: any, res: any) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const requestedQty = Number(quantity);

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product is required",
      });
    }

    if (!Number.isFinite(requestedQty) || requestedQty < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: "This product is out of stock",
      });
    }

    let cart = await Cart.findOne({ userId: req.user.userId });
    let existingQty = 0;

    if (cart) {
      const existingItem = cart.items.find(
        (item: any) => item.productId.toString() === productId.toString()
      );
      existingQty = existingItem ? existingItem.quantity : 0;
    }

    const newTotalQty = existingQty + requestedQty;

    if (newTotalQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock - existingQty} item(s) left in stock for this product`,
        maxQuantity: product.stock - existingQty,
      });
    }

    if (!cart) {
      cart = await Cart.create({
        userId: req.user.userId,
        items: [{ productId, quantity: requestedQty }],
      });
    } else {
      if (existingQty > 0) {
        const existingItem = cart.items.find(
          (item: any) => item.productId.toString() === productId.toString()
        );

        if (existingItem) {
          existingItem.quantity = newTotalQty;
        }
      } else {
        cart.items.push({ productId, quantity: requestedQty });
      }

      await cart.save();
    }

    const populatedCart = await Cart.findOne({ userId: req.user.userId }).populate({
      path: "items.productId",
      populate: { path: "category", select: "name" },
    });

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart: populatedCart,
      cartCount: populatedCart?.items.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateCartItem = async (req: any, res: any) => {
  try {
    const { productId, quantity } = req.body;
    const requestedQty = Number(quantity);

    if (!productId || !Number.isFinite(requestedQty) || requestedQty < 1) {
      return res.status(400).json({
        success: false,
        message: "Product and valid quantity are required",
      });
    }

    const cart = await Cart.findOne({ userId: req.user.userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.find(
      (cartItem: any) => cartItem.productId.toString() === productId.toString()
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (requestedQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} item(s) available in stock`,
        maxQuantity: product.stock,
      });
    }

    item.quantity = requestedQty;
    await cart.save();

    const populatedCart = await Cart.findOne({ userId: req.user.userId }).populate({
      path: "items.productId",
      populate: { path: "category", select: "name" },
    });

    return res.json({
      success: true,
      cart: populatedCart,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeFromCart = async (req: any, res: any) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId: req.user.userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = cart.items.filter(
      (item: any) => item.productId.toString() !== productId.toString()
    ) as any;

    await cart.save();

    return res.json({
      success: true,
      message: "Item removed from cart",
      cart,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
