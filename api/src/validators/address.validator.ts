import { z } from "zod";

export const createAddressSchema = z.object({
  label: z.enum(["Home", "Work", "Other"]).default("Home"),
  street: z.string().min(1, "Street is required"),
  unit: z.string().optional().default(""),
  city: z.string().min(1, "City is required"),
  state: z.string().optional().default(""),
  zipCode: z.string().optional().default(""),
  formattedAddress: z.string().min(1, "Formatted address is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  instructions: z.string().optional().default(""),
  isDefault: z.boolean().optional().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
