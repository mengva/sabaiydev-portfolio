"use client"

import { ServerResponseDto } from "@/admin/packages/types/constants";
import CookieHelper from "@/admin/packages/utils/Cookie";
import { zodValidationEmail, zodValidationPassword } from "@/admin/packages/validations/constants";
import trpc from "@/app/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import z from "zod";

const zodValidationResetPassword = z.object({
    email: zodValidationEmail,
    newPassword: zodValidationPassword,
    confirmPassword: zodValidationPassword,
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type ZodValidationResetPassword = z.infer<typeof zodValidationResetPassword>;

export default function ResetPasswordFormPage() {
    const router = useRouter();
    const email = CookieHelper.getCookieByKey("email") || "";
    const [isValidationEmail, setIsValidationEmail] = useState(false);
    const form = useForm<ZodValidationResetPassword>({
        resolver: zodResolver(zodValidationResetPassword),
        defaultValues: { email, newPassword: "", confirmPassword: "" },
    });

    const resetPasswordMutation = trpc.app.admin.auth.resetPassword.useMutation({
        onSuccess: (data: ServerResponseDto) => {
            if (data && data.success) {
                toast.success(data.message);
                CookieHelper.removeCookieByKey("email");
                return router.push('/auth/signin');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message);
        }
    });

    function onSubmit(values: ZodValidationResetPassword) {
        if (values) {
            resetPasswordMutation.mutate({ email: email, newPassword: values.newPassword });
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

    return (
        <div className="w-full min-h-screen flex justify-center items-center">
            <div className="w-full max-w-md mx-auto">
                <h1 className="text-center font-bold! text-4xl! mb-4 bg-gradient-to-r from-purple-500 to-green-600 bg-clip-text text-transparent">
                    Sabaiydev
                </h1>
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="text-center text-2xl!">Reset Password</CardTitle>
                        <CardDescription className="text-center">
                            Please enter your new password below to reset your account password.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>New Password</FormLabel>
                                            <FormControl>
                                                <Input disabled={!email} type="password" placeholder="••••••" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm Password</FormLabel>
                                            <FormControl>
                                                <Input disabled={!email} type="password" placeholder="••••••" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" size={"lg"} className="w-full cursor-pointer" disabled={resetPasswordMutation.isPending || !email}>
                                    {
                                        resetPasswordMutation.isPending ? "Resetting Password..." : "Reset Password"
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
    );
}