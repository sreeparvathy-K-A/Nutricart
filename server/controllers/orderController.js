import Order from "../models/orderModel.js";
import DeliveryBoy from "../models/deliveryboyModel.js";
import Client from "../models/clientModel.js";

const buildClientAddress = (client) => {
  const address = client?.address;

  if (!address) {
    return "";
  }

  if (typeof address === "string") {
    return address;
  }

  return [address.street, address.city, address.state, address.pincode]
    .filter(Boolean)
    .join(", ");
};

const enrichOrdersWithClientDetails = async (orders) => {
  return Promise.all(
    orders.map(async (order) => {
      const plainOrder = order.toObject ? order.toObject() : order;
      const client = await Client.findById(plainOrder.userId).select("name phone address");

      return {
        ...plainOrder,
        address: plainOrder.address || buildClientAddress(client),
        clientName: client?.name || "",
        clientPhone: client?.phone || "",
      };
    })
  );
};

export const placeOrder = async (req, res) => {
  try {
    const { userId, items, totalAmount, address } = req.body;
    const normalizedAddress = String(address || "").trim();
    const validItems = Array.isArray(items)
      ? items.filter((item) => item?.foodId && Number(item?.quantity || 0) > 0)
      : [];

    if (!userId || validItems.length === 0 || !totalAmount || !normalizedAddress) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const order = new Order({
      userId,
      items: validItems,
      totalAmount,
      address: normalizedAddress,
      status: "Pending",
    });

    await order.save();

    res.status(201).json({
      message: "Order placed",
      order,
    });
  } catch (error) {
    console.error("Place order error:", error);
    res.status(500).json({ message: "Error placing order" });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId })
      .populate("items.foodId")
      .populate("deliveryBoyId", "name phone")
      .sort({ createdAt: -1 });

    const enrichedOrders = await enrichOrdersWithClientDetails(orders);

    res.status(200).json(enrichedOrders);
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const onlyAssignable = req.query.assignable === "true";
    const filter = onlyAssignable
      ? {
          deliveryBoyId: null,
          status: { $nin: ["Delivered", "Cancelled"] },
        }
      : {};

    const orders = await Order.find(filter)
      .populate("items.foodId")
      .populate("deliveryBoyId", "name phone vehicleType")
      .sort({ createdAt: -1 });

    const enrichedOrders = await enrichOrdersWithClientDetails(orders);

    res.status(200).json(enrichedOrders);
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

export const assignDeliveryBoy = async (req, res) => {
  try {
    const { orderId, deliveryBoyId } = req.body;

    if (!orderId || !deliveryBoyId) {
      return res.status(400).json({ message: "orderId and deliveryBoyId required" });
    }

    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);

    if (!deliveryBoy) {
      return res.status(404).json({ message: "Delivery boy not found" });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        deliveryBoyId,
        deliveryBoyName: deliveryBoy.name,
        status: "Assigned",
      },
      { new: true }
    )
      .populate("items.foodId")
      .populate("deliveryBoyId", "name phone vehicleType");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Delivery boy assigned",
      order,
    });
  } catch (error) {
    console.error("Assign delivery boy error:", error);
    res.status(500).json({ message: "Error assigning delivery boy" });
  }
};

export const getDeliveryOrders = async (req, res) => {
  try {
    const { deliveryBoyId } = req.params;

    const orders = await Order.find({ deliveryBoyId })
      .populate("items.foodId")
      .populate("deliveryBoyId", "name phone vehicleType")
      .sort({ createdAt: -1 });

    const enrichedOrders = await enrichOrdersWithClientDetails(orders);

    res.status(200).json(enrichedOrders);
  } catch (error) {
    console.error("Get delivery orders error:", error);
    res.status(500).json({ message: "Error fetching delivery orders" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ message: "orderId and status required" });
    }

    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order status updated",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "Error updating order status" });
  }
};
