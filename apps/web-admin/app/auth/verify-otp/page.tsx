"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import CookieHelper from "@/admin/packages/utils/Cookie";
import trpc from "@/app/trpc/client";
import toast from "react-hot-toast";
import { zodValidationEmail } from "@/admin/packages/validations/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { ServerResponseDto } from "@/admin/packages/types/constants";
import { zodValidationSignInOTP, ZodValidationSignInOTP } from "@/admin/packages/validations/auth";

export default function VerifyOtpFormPage() {
  const email = CookieHelper.getCookieByKey("email") || "";
  const router = useRouter();
  const [isValidationEmail, setIsValidationEmail] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds
  const [isExpired, setIsExpired] = useState(false);
  const form = useForm<ZodValidationSignInOTP>({
    resolver: zodResolver(zodValidationSignInOTP),
    defaultValues: { email, code: "" },
  });

  const onSuccess = (data: ServerResponseDto) => {
    if (data && data.success) {
      setTimeLeft(30);
      setIsExpired(false);
      toast.success(data.message);
    }
  }

  const onError = (error: Error) => {
    toast.error(error.message);
  }

  const verifiedByEmailMutation = trpc.app.admin.auth.verifiedEmail.useMutation({ onSuccess, onError });
  const verifiedOTPCodeMutation = trpc.app.admin.auth.verifiedOTPCode.useMutation({
    onSuccess: (data: ServerResponseDto) => {
      if (data && data.success) {
        toast.success(data.message);
        return router.push('/auth/reset-password');
      }
    }, onError
  });

  const sendOTP = () => {
    if (email && isValidationEmail) {
      verifiedByEmailMutation.mutate({ email });
      return;
    } else toast.error("Request failed, Please try again later");
  };

  const onSubmit = (data: ZodValidationSignInOTP) => {
    if (data) {
      verifiedOTPCodeMutation.mutate({ email: data.email, code: data.code });
    }
  }

  useEffect(() => {
    if (!isValidationEmail && email) {
      const ValidationEmail = zodValidationEmail.safeParse(email);
      if (ValidationEmail?.success) {
        setIsValidationEmail(true);
      }
    } else {
      setIsValidationEmail(false);
      toast.error("Email is required, Please try again later.")
    }
  }, [email]);

  useEffect(() => {
    if (timeLeft === 0) {
      setIsExpired(true);
      toast.error('OTP has expired. Please request a new one.');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  return (
    <div className="w-full min-h-screen flex justify-center items-center">
      <div className="w-full max-w-md shadow-xl">
        <h1 className="text-center font-bold! text-4xl! mb-4 bg-gradient-to-r from-purple-500 to-green-600 bg-clip-text text-transparent">Sabaiydev</h1>
        <Card className="">
          <CardHeader>
            <CardTitle className="text-center text-2xl!">Verify OTP</CardTitle>
            <CardDescription className="text-center">Please enter the OTP code sent to your email.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mb-4">
                <FormField name="code" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>OTP Code</FormLabel>
                    <FormControl>
                      <Input disabled={isExpired || !email} placeholder="xxxxxx" {...field} maxLength={6} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                {
                  !isExpired && email && (
                    <div className={`rounded-lg p-3 text-center ${isExpired
                      ? 'bg-red-50 dark:bg-slate-900 border border-red-200 dark:border-red-700'
                      : timeLeft <= 10
                        ? 'bg-orange-50 dark:bg-slate-900 border border-orange-200 dark:border-orange-700'
                        : 'bg-blue-50 dark:bg-slate-900 border border-blue-200 dark:border-blue-700'
                      }`}>
                      <div className="flex items-center justify-center gap-2">
                        <Clock className={`h-4 w-4 ${isExpired
                          ? 'text-red-600'
                          : timeLeft <= 10
                            ? 'text-orange-600'
                            : 'text-blue-600'
                          }`} />
                        <p className={`text-sm font-medium ${isExpired
                          ? 'text-red-700'
                          : timeLeft <= 10
                            ? 'text-orange-700'
                            : 'text-blue-700'
                          }`}>
                          {isExpired
                            ? 'OTP Expired'
                            : `OTP expires in ${timeLeft}s`}
                        </p>
                      </div>
                    </div>
                  )
                }
                <Button type="submit" size={"lg"} className="w-full cursor-pointer" disabled={verifiedOTPCodeMutation.isPending || isExpired || !email}>
                  {verifiedOTPCodeMutation.isPending ? "Verifying..." : "Verify OTP"}
                </Button>
              </form>
              <div className="text-center">
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <div>Didn't receive the code?</div>
                  <div onClick={() => !verifiedByEmailMutation.isPending ? sendOTP() : null} className='text-blue-500 hover:underline cursor-pointer'>
                    {
                      verifiedByEmailMutation.isPending ? "Resending Code..." : "Resend Code"
                    }
                  </div>
                </div>
                <Link href={'/auth/signin'} className='text-blue-500 hover:underline'>
                  Back to sign in
                </Link>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
