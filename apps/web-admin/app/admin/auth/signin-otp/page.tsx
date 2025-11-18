'use client'

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@workspace/ui/components/form';
import { zodValidateSignInWithOTPAndEmail, ZodValidateSignInWithOTPAndEmail } from '@/admin/packages/validations/auth';
import { zodValidateEmail } from '@/admin/packages/validations/constants';
import Link from 'next/link';
import trpc from '@/app/trpc/client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Clock } from 'lucide-react';
import { ServerResponseDto } from '@/admin/packages/types/constants';

export default function SignInWithOTPFormPage() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds
  const [isExpired, setIsExpired] = useState(false);

  const emailForm = useForm<{ email: string }>({
    resolver: zodResolver(z.object({ email: zodValidateEmail })),
    defaultValues: { email: "" },
  });

  const signInWithOTPMutation = useForm<ZodValidateSignInWithOTPAndEmail>({
    resolver: zodResolver(zodValidateSignInWithOTPAndEmail),
    defaultValues: { email: "", code: "" },
  });

  const verifiedByEmailMutation = trpc.app.admin.auth.verifiedEmail.useMutation({
    onSuccess: (data: ServerResponseDto) => {
      if (data && data.success) {
        signInWithOTPMutation.setValue("email", email);
        setStep("otp");
        setTimeLeft(30);
        setIsExpired(false);
        toast.success(data.message);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const signInWithOTPAndEmailMutation = trpc.app.admin.auth.signInWithOTPAndEmail.useMutation({
    onSuccess: (data: ServerResponseDto) => {
      if (data && data.success) {
        toast.success(data.message);
        return router.push("/admin/dashboard");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const sendOTP = (values: { email: string }) => {
    if (values && values.email) {
      verifiedByEmailMutation.mutate({ email: values.email });
      setEmail(values.email);
    } else toast.error("Request failed, Please try again later");
  };

  const verifyOTP = (values: ZodValidateSignInWithOTPAndEmail) => {
    if (values) {
      signInWithOTPAndEmailMutation.mutate(values);
    }
  };

  useEffect(() => {
    if (step !== 'otp') return;

    if (timeLeft === 0) {
      setIsExpired(true);
      toast.error('OTP has expired. Please request a new one.');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, step]);

  return (
    <div className='w-full min-h-screen flex justify-center items-center'>
      <div className='w-full max-w-md mx-auto'>
        <h1 className="text-center !font-bold !text-4xl mb-4 bg-gradient-to-r from-purple-500 to-green-600 bg-clip-text text-transparent">Sabaiydev</h1>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className='!text-2xl text-center'>Sign In with OTP</CardTitle>
            <CardDescription className='text-center'>Enter your email to receive a one-time password.</CardDescription>
          </CardHeader>
          <CardContent>
            {step === "email" ? (
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(sendOTP)} className="space-y-4">
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full cursor-pointer" disabled={verifiedByEmailMutation.isPending}>
                    {verifiedByEmailMutation.isPending ? "Sending OTP..." : "Send OTP"}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...signInWithOTPMutation}>
                <form onSubmit={signInWithOTPMutation.handleSubmit(verifyOTP)} className="space-y-4">
                  <FormField
                    control={signInWithOTPMutation.control}
                    name="email"
                    render={() => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input value={email} placeholder="you@example.com" disabled />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signInWithOTPMutation.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enter OTP</FormLabel>
                        <FormControl>
                          <Input disabled={isExpired} placeholder="123456" maxLength={6} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {
                    !isExpired && (
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
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setStep("email")} className="flex-1 cursor-pointer">
                      Back
                    </Button>
                    <Button type="submit" className="flex-1 cursor-pointer" disabled={signInWithOTPAndEmailMutation.isPending || isExpired}>
                      {signInWithOTPAndEmailMutation.isPending ? "Verifying..." : "Verify OTP"}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
            <div className="mt-4 flex justify-between items-center text-sm">
              <div>
                <div>Didn't receive the code?</div>
                <div onClick={() => !verifiedByEmailMutation.isPending ? sendOTP({ email }) : null} className='text-blue-500 hover:underline cursor-pointer'>
                  Resend Code
                </div>
              </div>
              <Link href="/admin/auth/signin" className="text-blue-600 hover:underline">
                Sign in with password
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}