import { z } from "zod";

export const authCredentialsSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

export type AuthCredentials = z.infer<typeof authCredentialsSchema>;
