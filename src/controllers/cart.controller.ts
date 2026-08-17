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

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product is required",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let cart = await Cart.findOne({ userId: req.user.userId });

    if (!cart) {
      cart = await Cart.create({
        userId: req.user.userId,
        items: [{ productId, quantity }],
      });
    } else {
      const existingItem = cart.items.find(
        (item: any) => item.productId.toString() === productId.toString()
      );

      if (existingItem) {
        existingItem.quantity += Number(quantity);
      } else {
        cart.items.push({ productId, quantity: Number(quantity) });
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

    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Product and quantity are required",
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

    item.quantity = Number(quantity);
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
