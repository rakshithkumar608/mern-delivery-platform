import Stripe from "stripe";
import { Env } from "../config/env.config";
import { isStripeMock, stripe } from "../config/stripe.config";
import { Order } from "../models/order.model";
import { WebhookEvent } from "../models/webhook-event.model";
import { basketService } from "./basket.service";
import { BadRequestException } from "../utils/app-error";
import { logger } from "../utils/logger";

export class PaymentService {
  /**
   * Create a Stripe PaymentIntent with server-enforced idempotency key
   * Amounts are strictly in paise (INR)
   */
  async createPaymentIntent({
    orderId,
    amountInPaise,
    customerEmail,
    metadata,
  }: {
    orderId: string;
    amountInPaise: number;
    customerEmail?: string;
    metadata?: Record<string, string>;
  }): Promise<{
    paymentIntentId: string;
    clientSecret: string;
  }> {
    if (amountInPaise <= 0) {
      throw new BadRequestException("Order amount must be greater than zero");
    }

    const idempotencyKey = `pi_order_${orderId}_${amountInPaise}`;

    if (isStripeMock) {
      const mockId = `pi_mock_${orderId.slice(-6)}_${Date.now()}`;
      const mockSecret = `${mockId}_secret_${Math.random().toString(36).substring(2, 9)}`;
      logger.info("[Mock Payment] Generated mock PaymentIntent", {
        orderId,
        amountInPaise,
        idempotencyKey,
      });
      return {
        paymentIntentId: mockId,
        clientSecret: mockSecret,
      };
    }

    try {
      // Stripe requires non-USD transactions to equal at least 50 US cents (~₹45-50 INR / 5000 paise)
      const MIN_STRIPE_INR_PAISE = 5000;
      const chargePaise = Math.max(amountInPaise, MIN_STRIPE_INR_PAISE);

      const paymentIntent = await stripe.paymentIntents.create(
        {
          amount: chargePaise,
          currency: "inr",
          payment_method_types: ["card"],
          receipt_email: customerEmail,
          metadata: {
            orderId,
            actualAmountInPaise: String(amountInPaise),
            ...metadata,
          },
        },
        {
          idempotencyKey,
        }
      );

      return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret || "",
      };
    } catch (error: any) {
      logger.error("Failed to create Stripe PaymentIntent", {
        orderId,
        amountInPaise,
        error: error.message,
      });
      throw new BadRequestException(
        error.message || "Failed to initialize card payment session"
      );
    }
  }

  /**
   * Handle incoming Stripe webhook with raw body verification and durable event deduplication
   */
  async handleWebhook(
    rawBody: Buffer | string,
    signature: string | undefined
  ): Promise<{ received: boolean; eventType?: string }> {
    let event: Stripe.Event;

    // Handle simulated webhook if testing in local dev without live Stripe CLI
    if (
      Env.NODE_ENV !== "production" &&
      (!signature || signature === "test_mock_sig" || isStripeMock)
    ) {
      try {
        event = typeof rawBody === "string" ? JSON.parse(rawBody) : JSON.parse(rawBody.toString("utf8"));
      } catch {
        throw new BadRequestException("Invalid mock webhook JSON");
      }
    } else {
      if (!signature) {
        throw new BadRequestException("Missing Stripe-Signature header");
      }
      try {
        event = stripe.webhooks.constructEvent(
          rawBody,
          signature,
          Env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err: any) {
        logger.error("Stripe webhook signature verification failed", {
          error: err.message,
        });
        throw new BadRequestException(`Webhook Error: ${err.message}`);
      }
    }

    // Deduplicate event using durable MongoDB unique constraint
    try {
      await WebhookEvent.create({
        eventId: event.id,
        provider: "stripe",
        eventType: event.type,
      });
    } catch (duplicateErr: any) {
      // Event already processed idempotently
      logger.info("Stripe webhook already processed (idempotent skip)", {
        eventId: event.id,
        type: event.type,
      });
      return { received: true, eventType: event.type };
    }

    logger.info("Processing verified Stripe webhook event", {
      type: event.type,
      eventId: event.id,
    });

    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const orderId = paymentIntent.metadata?.orderId;
    const paymentIntentId = paymentIntent.id;

    switch (event.type) {
      case "payment_intent.succeeded": {
        await this.onPaymentSucceeded(paymentIntentId, orderId, paymentIntent);
        break;
      }

      case "payment_intent.payment_failed": {
        await this.onPaymentFailed(paymentIntentId, orderId, paymentIntent);
        break;
      }

      case "payment_intent.canceled": {
        await this.onPaymentCanceled(paymentIntentId, orderId, paymentIntent);
        break;
      }

      default:
        logger.debug("Unhandled Stripe webhook event", { type: event.type });
        break;
    }

    return { received: true, eventType: event.type };
  }

  private async onPaymentSucceeded(
    paymentIntentId: string,
    orderId?: string,
    paymentIntent?: Stripe.PaymentIntent
  ) {
    const filter = orderId
      ? { _id: orderId }
      : { "payment.stripePaymentIntentId": paymentIntentId };

    const order = await Order.findOne(filter);
    if (!order) {
      logger.warn("Order not found for succeeded payment", {
        orderId,
        paymentIntentId,
      });
      return;
    }

    // Set paid status strictly on verified webhook
    order.payment.status = "succeeded";
    if (paymentIntent?.payment_method_types?.[0]) {
      order.payment.cardBrand = "visa";
    }

    order.statusHistory.push({
      status: "placed",
      title: "Payment Confirmed",
      note: "Card payment verified via Stripe. Order has been sent to the kitchen.",
      timestamp: new Date(),
    });

    await order.save();
    logger.info("Order marked as paid via verified Stripe webhook", {
      orderNumber: order.orderNumber,
      orderId: order._id,
    });

    // Clear basket for this customer / session
    const identifier = order.userId ? String(order.userId) : order.sessionId;
    if (identifier) {
      try {
        await basketService.clearBasket(identifier);
      } catch (err: any) {
        logger.warn("Failed to clear basket after order payment", {
          identifier,
          error: err.message,
        });
      }
    }
  }

  private async onPaymentFailed(
    paymentIntentId: string,
    orderId?: string,
    paymentIntent?: Stripe.PaymentIntent
  ) {
    const filter = orderId
      ? { _id: orderId }
      : { "payment.stripePaymentIntentId": paymentIntentId };

    const order = await Order.findOne(filter);
    if (!order) return;

    order.payment.status = "failed";
    order.status = "cancelled";
    const failMessage =
      paymentIntent?.last_payment_error?.message ||
      "Card payment could not be processed.";

    order.statusHistory.push({
      status: "cancelled",
      title: "Payment Failed",
      note: failMessage,
      timestamp: new Date(),
    });

    await order.save();
    logger.info("Order marked as failed via Stripe webhook", {
      orderNumber: order.orderNumber,
      reason: failMessage,
    });
  }

  private async onPaymentCanceled(
    paymentIntentId: string,
    orderId?: string,
    _paymentIntent?: Stripe.PaymentIntent
  ) {
    const filter = orderId
      ? { _id: orderId }
      : { "payment.stripePaymentIntentId": paymentIntentId };

    const order = await Order.findOne(filter);
    if (!order) return;

    order.payment.status = "cancelled";
    order.status = "cancelled";

    order.statusHistory.push({
      status: "cancelled",
      title: "Payment Canceled",
      note: "Payment session was canceled by user or gateway.",
      timestamp: new Date(),
    });

    await order.save();
    logger.info("Order marked as cancelled via Stripe webhook", {
      orderNumber: order.orderNumber,
    });
  }
}

export const paymentService = new PaymentService();
