import { Request, Response } from "express";
import { HttpStatus } from "../config/http-status.config";
import { isStripeMock } from "../config/stripe.config";
import { paymentService } from "../services/payment.service";
import { BadRequestException } from "../utils/app-error";

export class PaymentController {
  /**
   * Stripe Webhook Endpoint (Mounted with express.raw body parser before express.json)
   */
  handleWebhook = async (req: Request, res: Response): Promise<void> => {
    const signature = req.headers["stripe-signature"] as string | undefined;
    const rawBody = req.body;

    if (!rawBody) {
      throw new BadRequestException("Missing webhook raw payload");
    }

    const result = await paymentService.handleWebhook(rawBody, signature);
    res.status(HttpStatus.OK).json(result);
  };

  /**
   * Helper endpoint for development / testing environments to simulate webhook success
   * Only accessible when NODE_ENV !== "production"
   */
  simulateWebhookSuccess = async (req: Request, res: Response): Promise<void> => {
    if (process.env.NODE_ENV === "production") {
      throw new BadRequestException("Simulator not allowed in production");
    }

    const { orderId, paymentIntentId } = req.body;
    if (!orderId && !paymentIntentId) {
      throw new BadRequestException("orderId or paymentIntentId is required");
    }

    const mockEvent = {
      id: `evt_sim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: "payment_intent.succeeded",
      data: {
        object: {
          id: paymentIntentId || `pi_sim_${Date.now()}`,
          metadata: { orderId },
          payment_method_types: ["card"],
        },
      },
    };

    const result = await paymentService.handleWebhook(
      Buffer.from(JSON.stringify(mockEvent)),
      "test_mock_sig"
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: "Simulated Stripe payment_intent.succeeded webhook processed",
      result,
    });
  };
}

export const paymentController = new PaymentController();
