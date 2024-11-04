import { z } from "zod";

export const RegisterSchema = z
  .object({
    email: z.string().email({ message: "Not a valide email formate" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const LoginSchema = z.object({
  email: z.string().email({ message: "Not a valide email formate" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

export const EmailVerificationSchema = z.object({
  code: z.string().length(8, { message: "Code is 8 characters long" }),
});

export type GitHubType = {
  login: string;
  id: number;
  avatar_url: string;
  email?: string;
};

export type GoogleType = {
  sub: string;
  email: string;
  name: string;
  picture?: string;
};
