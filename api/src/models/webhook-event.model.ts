import { Document, Schema, model } from "mongoose";

export interface IWebhookEvent {
  eventId: string;
  provider: "stripe";
  eventType: string;
  processedAt: Date;
}

export interface IWebhookEventDocument extends IWebhookEvent, Document {}

const webhookEventSchema = new Schema<IWebhookEventDocument>(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    provider: {
      type: String,
      required: true,
      default: "stripe",
    },
    eventType: {
      type: String,
      required: true,
    },
    processedAt: {
      type: Date,
      default: Date.now,
      expires: 60 * 60 * 24 * 30, // 30-day TTL auto-cleanup
    },
  },
  {
    timestamps: true,
  }
);

export const WebhookEvent = model<IWebhookEventDocument>(
  "WebhookEvent",
  webhookEventSchema
);
