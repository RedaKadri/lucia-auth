"use client";

import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EmailVerificationSchema } from "@/types";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { RingResizeSpinner } from "@/components/icons/spinners";
import { toast } from "sonner";

import {
  EmailVerificationAction,
  ResendEmailVerificationAction,
} from "../action";

export default function EmailVerificationForm() {
  const router = useRouter();

  const form = useForm<z.infer<typeof EmailVerificationSchema>>({
    resolver: zodResolver(EmailVerificationSchema),
    defaultValues: {
      code: "",
    },
  });

  const resendForm = useForm({});

  async function onSubmit(values: z.infer<typeof EmailVerificationSchema>) {
    const res = await EmailVerificationAction(values);
    if (res.status === "error") {
      toast("Error", {
        description: res.message,
      });
    }
    if (res.status === "success") {
      toast("Success", {
        description: res.message,
      });
      router.push("/");
    }
  }

  async function onResendCode() {
    const res = await ResendEmailVerificationAction();
    if (res.status === "error") {
      toast("Error", {
        description: res.message,
      });
    }
    if (res.status === "success") {
      toast("Success", {
        description: res.message,
      });
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputOTP maxLength={8} {...field}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                      <InputOTPSlot index={6} />
                      <InputOTPSlot index={7} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col gap-3">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <RingResizeSpinner />}
              <span>Submit</span>
            </Button>
          </div>
        </form>
      </Form>

      <Form {...resendForm}>
        <form
          onSubmit={resendForm.handleSubmit(onResendCode)}
          className="w-full mt-3"
        >
          <Button type="submit" variant={"outline"} className="w-full">
            Resend code
          </Button>
        </form>
      </Form>
    </>
  );
}
