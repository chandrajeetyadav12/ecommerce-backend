import Cart from "../models/Cart";
import Order from "../models/Order";
import Address from "../models/Address";

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

                    shippingCharge: 0,

                    totalAmount: subtotal,

                    paymentMethod,

                    paymentStatus:
                        paymentMethod === "COD"
                            ? "pending"
                            : "paid",
                });

     
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