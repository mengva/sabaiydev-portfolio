'use client'

import Link from "next/link";
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Form, FormItem, FormField, FormLabel, FormControl, FormMessage } from "@workspace/ui/components/form";
import { useForm } from "react-hook-form";
import { Input } from "@workspace/ui/components/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import React, { useEffect } from "react";
import z from "zod";
import { zodValidationEmail, zodValidationPhoneNumber } from "@/admin/packages/validations/constants";
import trpc from "@/app/trpc/client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import CookieHelper from "@/admin/packages/utils/Cookie";
import { ServerResponseDto } from "@/admin/packages/types/constants";

type VerifiedEmailDto = "EMAIL" | "PHONE_NUMBER";

const zodValidateForgotPasswordForm = z.object({
    email: zodValidationEmail,
    phoneNumber: zodValidationPhoneNumber
});

type ZodValidateForgotPasswordForm = z.infer<typeof zodValidateForgotPasswordForm>;

function ForgotPasswordFormComponent() {
    const [verifiedEmail, setVerifiedEmail] = React.useState("EMAIL" as VerifiedEmailDto);
    const router = useRouter();
    const form = useForm<ZodValidateForgotPasswordForm>({
        resolver: zodResolver(zodValidateForgotPasswordForm),
        defaultValues: { email: "", phoneNumber: "" },
    });

    const verifiedEmailMutation = trpc.app.admin.auth.verifiedEmail.useMutation({
        onSuccess: (data: ServerResponseDto) => {
            if (data && data.success) {
                toast.success(data.message);
                CookieHelper.setCookieByKey("email", form.getValues("email"), 1);
                return router.push('/auth/verify-otp');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message);
        }
    });

    function onSubmit(values: ZodValidateForgotPasswordForm) {
        if (verifiedEmail === "EMAIL") {
            verifiedEmailMutation.mutate({ email: values.email });
            return;
        }
    }

    useEffect(() => {
        if (verifiedEmail === "EMAIL") {
            form.setValue("email", "");
            form.setValue("phoneNumber", "+8562012345678");
        } else {
            form.setValue("phoneNumber", "");
            form.setValue("email", "you@example.com");
        }
    }, [verifiedEmail]);

    return (
        <div className="w-full min-h-screen flex justify-center items-center">
            <div className="w-full max-w-md mx-auto">
                <h1 className="text-center font-bold! text-4xl! mb-4 bg-gradient-to-r from-purple-500 to-green-600 bg-clip-text text-transparent">Sabaiydev</h1>
                <p className="text-center mb-4">Enter your email address below and we'll send you a link to reset your password.</p>
                <Card className="w-full max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle className="text-center text-2xl!">Forgot Password</CardTitle>
                        <CardDescription className="text-center mb-4">
                            Enter your email or phone number to receive a password reset link.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <Tabs defaultValue="email">
                                    <TabsList className="w-full mb-2">
                                        <TabsTrigger onClick={() => setVerifiedEmail("EMAIL")} className="cursor-pointer" value="email">Email</TabsTrigger>
                                        <TabsTrigger onClick={() => setVerifiedEmail("PHONE_NUMBER")} className="cursor-pointer" value="phoneNumber">Phone Number</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="email">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input type="email" placeholder="you@example.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TabsContent>
                                    <TabsContent value="phoneNumber">
                                        <FormField
                                            control={form.control}
                                            name="phoneNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Phone Number</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="+8562012345678, 2012345678" {...field} minLength={8} maxLength={14} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TabsContent>
                                </Tabs>
                                <Button type="submit" size={"lg"} className="w-full mt-4 cursor-pointer" variant="default">
                                    {
                                        verifiedEmail === "EMAIL" ?
                                            (verifiedEmailMutation.isPending ? "Sending OTP..." : "Send OTP") : "Send OTP"
                                    }
                                </Button>
                            </form>
                        </Form>
                        <div className="mt-4 text-center text-sm">
                            <Link href="/auth/signin" className="text-blue-600 hover:underline">
                                Back to Sign In
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default ForgotPasswordFormComponent
