import mongoose from "mongoose";
import { IOrderItem, IOrderStatusHistory, Order, OrderStatus } from "../models/order.model";
import { basketService } from "./basket.service";
import { paymentService } from "./payment.service";
import { BadRequestException, NotFoundException } from "../utils/app-error";
import { logger } from "../utils/logger";
import { Env } from "../config/env.config";

export interface CreateOrderCheckoutPayload {
  deliveryAddress?: {
    label?: string;
    fullAddress: string;
    contactPhone: string;
    instructions?: string;
  };
  contactPhone?: string;
  deliveryInstructions?: string;
}

export class OrderService {
  /**
   * Helper to format human-readable reference number (#CH-XXXX)
   */
  private generateOrderNumber(): string {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `CH-${randomDigits}`;
  }

  /**
   * Creates order from current basket and initializes Stripe PaymentIntent.
   * Amounts are strictly calculated on server in INR paise.
   * Payment status is set to "pending" — only the verified webhook can mark it "succeeded".
   */
  async createCheckoutSession(
    identifier: string,
    payload: CreateOrderCheckoutPayload,
    user?: any
  ): Promise<{
    orderId: string;
    orderNumber: string;
    clientSecret: string;
    publishableKey?: string;
    amountInPaise: number;
    amount: number;
    currency: string;
    arrivalEstimate: string;
    estimatedDeliveryTime: Date;
    formattedEta: string;
  }> {
    const basket = await basketService.getBasket(identifier);
    if (!basket || !basket.items || basket.items.length === 0) {
      throw new BadRequestException("Your basket is empty. Add items before checking out.");
    }

    // Server-side calculation strictly in INR
    const subtotal = Number(basket.subtotal || 0);
    const deliveryFee = Number(basket.deliveryFee || 0);
    const serviceFee = Number(basket.serviceFee || 0);
    const discount = Number(basket.discount || 0);
    const total = Number(basket.total || Math.max(0, subtotal + deliveryFee + serviceFee - discount));

    const amountInPaise = Math.round(total * 100);
    if (amountInPaise <= 0) {
      throw new BadRequestException("Invalid order amount");
    }

    const orderNumber = this.generateOrderNumber();
    const etaMinutes = 30;
    const estimatedDeliveryTime = new Date(Date.now() + etaMinutes * 60 * 1000);

    const fullAddress =
      payload.deliveryAddress?.fullAddress ||
      basket.restaurantAddress ||
      "221B Baker Street, London";
    const contactPhone =
      payload.deliveryAddress?.contactPhone ||
      payload.contactPhone ||
      user?.phone ||
      "+44 7700 900123";
    const instructions =
      payload.deliveryAddress?.instructions ||
      payload.deliveryInstructions ||
      basket.orderNotes ||
      "Leave at the door";

    const items: IOrderItem[] = basket.items.map((i: any) => ({
      name: i.name,
      subtitle: i.subtitle || "",
      image: i.image,
      price: Number(i.price),
      quantity: Number(i.quantity),
      selectedSize: i.selectedSize,
      selectedExtras: i.selectedExtras,
      selectedRemovals: i.selectedRemovals,
      specialInstructions: i.specialInstructions,
      itemTotal: Number(i.itemTotal),
    }));

    const initialHistory: IOrderStatusHistory[] = [
      {
        status: "placed",
        title: "Order Placed",
        note: "Order initialized. Awaiting card payment confirmation.",
        timestamp: new Date(),
      },
    ];

    // Pre-create the order in MongoDB with pending payment
    const order = new Order({
      orderNumber,
      userId: user?._id || user?.id,
      sessionId: identifier,
      restaurantId: basket.restaurantId || "bella-italia",
      restaurantName: basket.restaurantName || "Bella Italia",
      restaurantAddress: basket.restaurantAddress || "221B Baker Street, London",
      items,
      deliveryAddress: {
        label: payload.deliveryAddress?.label || "Home",
        fullAddress,
        contactPhone,
        instructions,
      },
      arrivalEstimate: basket.restaurantDeliveryTime || "25-35 min",
      estimatedDeliveryTime,
      pricing: {
        subtotal,
        deliveryFee,
        serviceFee,
        discount,
        total,
        currency: "INR",
      },
      payment: {
        method: "card",
        status: "pending", // Strictly pending until Stripe webhook confirms
        amountInPaise,
        cardBrand: "visa",
        cardLast4: "4242",
      },
      status: "placed",
      statusHistory: initialHistory,
      includeCutlery: basket.includeCutlery ?? true,
      orderNotes: basket.orderNotes || "",
    });

    await order.save();

    // Create Stripe PaymentIntent with server-enforced idempotency key
    const paymentIntent = await paymentService.createPaymentIntent({
      orderId: String(order._id),
      amountInPaise,
      customerEmail: user?.email,
      metadata: {
        orderNumber,
        identifier,
      },
    });

    order.payment.stripePaymentIntentId = paymentIntent.paymentIntentId;
    order.payment.stripeClientSecret = paymentIntent.clientSecret;
    await order.save();

    logger.info("Created checkout session and pre-saved Order", {
      orderId: order._id,
      orderNumber,
      amountInPaise,
      currency: "INR",
    });

    const hours = estimatedDeliveryTime.getHours().toString().padStart(2, "0");
    const minutes = estimatedDeliveryTime.getMinutes().toString().padStart(2, "0");
    const formattedEta = `${hours}:${minutes}`;

    return {
      orderId: String(order._id),
      orderNumber,
      clientSecret: paymentIntent.clientSecret,
      publishableKey: Env.STRIPE_PUBLISHABLE_KEY,
      amountInPaise,
      amount: total,
      currency: "INR",
      arrivalEstimate: order.arrivalEstimate,
      estimatedDeliveryTime,
      formattedEta,
    };
  }

  /**
   * Progression Guard:
   * Block order status progression beyond "placed" unless paymentStatus is "succeeded"
   */
  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    title?: string,
    note?: string
  ): Promise<any> {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundException("Order not found");
    }

    // Strict Progression Guard
    if (order.payment.status !== "succeeded" && newStatus !== "cancelled") {
      throw new BadRequestException(
        `Cannot advance order to '${newStatus}' because payment status is '${order.payment.status}'. Payment must be succeeded.`
      );
    }

    order.status = newStatus;
    order.statusHistory.push({
      status: newStatus,
      title: title || `Status: ${newStatus}`,
      note: note || "",
      timestamp: new Date(),
    });

    await order.save();
    return order;
  }

  /**
   * Get order details by ID or orderNumber
   */
  async getOrderById(orderId: string): Promise<any> {
    const isObjectId = mongoose.Types.ObjectId.isValid(orderId);
    const filter = isObjectId ? { _id: orderId } : { orderNumber: orderId };
    const order = await Order.findOne(filter).exec();
    if (!order) {
      throw new NotFoundException("Order not found");
    }

    const eta = new Date(order.estimatedDeliveryTime);
    const hours = eta.getHours().toString().padStart(2, "0");
    const minutes = eta.getMinutes().toString().padStart(2, "0");
    const formattedEta = `${hours}:${minutes}`;

    return {
      ...order.toObject(),
      formattedEta,
    };
  }

  /**
   * List customer's orders
   */
  async getUserOrders(identifier: string): Promise<any[]> {
    const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
    const filter = isObjectId
      ? { $or: [{ userId: identifier }, { sessionId: identifier }] }
      : { sessionId: identifier };

    return Order.find(filter)
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Driver: Get ready orders available for claim
   */
  async getReadyOrders(): Promise<any[]> {
    return Order.find({
      $or: [
        { status: "ready" },
        { status: { $in: ["placed", "accepted", "preparing"] }, "driver.name": { $exists: false } },
        { "driver.name": null },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .exec();
  }

  /**
   * Driver: Claim an order
   */
  async claimOrder(orderId: string, driverData?: any): Promise<any> {
    const isObjectId = mongoose.Types.ObjectId.isValid(orderId);
    const filter = isObjectId ? { _id: orderId } : { orderNumber: orderId };
    const order = await Order.findOne(filter);

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    order.driver = {
      id: driverData?.id || driverData?._id || "driver-tunde",
      name: driverData?.name || "Tunde A.",
      role: "Your courier",
      phone: driverData?.phone || "+44 7700 900111",
      avatar: driverData?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      rating: 4.9,
      totalRatings: 184,
      vehicleType: "Bicycle / Scooter",
      plateNumber: "LD68 ABC",
    };

    if (order.status === "placed" || order.status === "ready") {
      order.status = "accepted";
    }

    order.statusHistory.push({
      status: "accepted",
      title: "Courier Assigned",
      note: `${order.driver.name} is on the way to collect your order`,
      timestamp: new Date(),
    });

    await order.save();
    return order;
  }

  /**
   * Driver: Update delivery progression (picked_up -> on_the_way -> delivered)
   */
  async updateDriverOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    note?: string
  ): Promise<any> {
    const isObjectId = mongoose.Types.ObjectId.isValid(orderId);
    const filter = isObjectId ? { _id: orderId } : { orderNumber: orderId };
    const order = await Order.findOne(filter);

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    order.status = newStatus;
    const titleMap: Record<string, string> = {
      picked_up: "Food Collected",
      on_the_way: "Out for Delivery",
      delivered: "Delivered",
    };

    order.statusHistory.push({
      status: newStatus,
      title: titleMap[newStatus] || `Status: ${newStatus}`,
      note: note || (newStatus === "picked_up" ? "Courier collected food from kitchen" : "Order safely delivered to recipient"),
      timestamp: new Date(),
    });

    await order.save();
    return order;
  }

  /**
   * Driver: Delivery history
   */
  async getDriverHistory(driverName: string = "Tunde A."): Promise<any[]> {
    return Order.find({
      $or: [
        { "driver.name": driverName },
        { status: "delivered" },
      ],
    })
      .sort({ updatedAt: -1 })
      .limit(30)
      .exec();
  }
}

export const orderService = new OrderService();
