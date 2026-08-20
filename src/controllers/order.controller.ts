import Cart from "../models/Cart";
import Order from "../models/Order";
import Address from "../models/Address";
import Product from "../models/Product";

export const placeOrder =
    async (req: any, res: any) => {
        try {
            const {
                addressId,
                paymentMethod,
            } = req.body;

            const cart =
                await Cart.findOne({
                    userId: req.user.userId,
                }).populate({
                    path: "items.productId",
                    populate: {
                        path: "sellerId",
                    },
                });

            if (
                !cart ||
                cart.items.length === 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Cart is empty",
                });
            }

            const address =
                await Address.findById(
                    addressId
                );

            if (!address) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Address not found",
                });
            }

            for (const item of cart.items) {
                const productId = item.productId?._id || item.productId;
                const product = await Product.findById(productId);

                if (!product) {
                    return res.status(404).json({
                        success: false,
                        message: "One of the products in your cart no longer exists",
                    });
                }

                if (product.stock < item.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `Only ${product.stock} item(s) left for ${product.name}`,
                    });
                }
            }

            const orderItems =
                cart.items.map((item: any) => ({
                    productId:
                        item.productId._id,

                    sellerId:
                        item.productId.sellerId,

                    quantity:
                        item.quantity,

                    price:
                        item.productId.price,

                    productName:
                        item.productId.name,

                    image:
                        item.productId.images[0],
                }));

            const subtotal =
                orderItems.reduce(
                    (
                        total: number,
                        item: any
                    ) =>
                        total +
                        item.price *
                        item.quantity,
                    0
                );

                const shippingCharge = 0;
                const totalAmount = subtotal + shippingCharge;

            const order =
                await Order.create({
                    userId:
                        req.user.userId,

                    items: orderItems,

                    // address,
                    address: {
                        fullName: address.fullName,
                        phone: address.phone,
                        addressLine1: address.addressLine1,
                        addressLine2: address.addressLine2,
                        city: address.city,
                        state: address.state,
                        pincode: address.pincode,
                    },

                    subtotal,

                    shippingCharge,

                    totalAmount,

                    paymentMethod,

                    paymentStatus:
                        paymentMethod === "COD"
                            ? "pending"
                            : "paid",
                });

            await Promise.all(
                cart.items.map(async (item: any) => {
                    const productId = item.productId?._id || item.productId;

                    await Product.findByIdAndUpdate(
                        productId,
                        {
                            $inc: {
                                stock: -item.quantity,
                            },
                        }
                    );
                })
            );

            await Cart.findOneAndUpdate(
                { userId: req.user.userId },
                {
                    $set: {
                        items: [],
                    },
                }
            );

            res.status(201).json({
                success: true,
                order,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    };

    // My Orders API
    export const getMyOrders =
  async (req: any, res: any) => {
    try {
      const orders =
        await Order.find({
          userId: req.user.userId,
        })
          .sort({
            createdAt: -1,
          })
          .populate(
            "items.productId"
          );

      const overallTotal = orders.reduce(
        (ordersTotal, order: any) => {
          const orderItemsTotal = order.items.reduce(
            (itemsTotal: number, item: any) =>
              itemsTotal + item.price * item.quantity,
            0
          );

          return ordersTotal + orderItemsTotal + (order.shippingCharge || 0);
        },
        0
      );

      res.json({
        success: true,
        orders,
        overallTotal,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

//   Admin Orders API
  export const getAllOrders =
  async (req: any, res: any) => {
    try {
      const orders =
        await Order.find()
          .populate(
            "userId",
            "name email"
          )
          .sort({
            createdAt: -1,
          });

      res.json({
        success: true,
        orders,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

//   Update Order Status
  export const updateOrderStatus =
  async (req: any, res: any) => {
    try {
      const order =
        await Order.findByIdAndUpdate(
          req.params.id,
          {
            orderStatus:
              req.body.status,
          },
          {
            new: true,
          }
        );

      res.json({
        success: true,
        order,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };