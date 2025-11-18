"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { zodValidateSignIn, ZodValidateSignIn } from "@/admin/packages/validations/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import trpc from "@/app/trpc/client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ServerResponseDto } from "@/admin/packages/types/constants";

export default function SignInPage() {
    const router = useRouter();

    const form = useForm<ZodValidateSignIn>({
        resolver: zodResolver(zodValidateSignIn),
        defaultValues: { email: "", password: "" },
    });

    const signInMutation = trpc.app.admin.auth.signIn.useMutation({
        onSuccess: (data: ServerResponseDto) => {
            if (data && data.success) {
                toast.success(data.message || "Signed in successfully!");
                return router.push('/admin/dashboard');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message);
        }
    });

    function onSubmit({ email, password }: ZodValidateSignIn) {
        if (email && password) {
            signInMutation.mutate({ email, password });
        }
    }

    return (
        <div className="w-full min-h-screen flex justify-center items-center">
            <div className="w-full max-w-md mx-auto">
                <h1 className="text-center !font-bold !text-4xl mb-4 bg-gradient-to-r from-purple-500 to-green-600 bg-clip-text text-transparent">
                    Sabaiydev
                </h1>
                <p className="text-center mb-4">
                    Please enter your credential to sign in to your account and go to the admin dashboard
                </p>
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="!text-2xl text-center">Sign In</CardTitle>
                        <CardDescription className="text-center">
                            Enter your email and password to sign in to your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="you@example.com"
                                                    disabled={signInMutation.isPending}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="••••••"
                                                    disabled={signInMutation.isPending}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="submit"
                                    size="lg"
                                    variant="default"
                                    className="w-full cursor-pointer"
                                    disabled={signInMutation.isPending}
                                >
                                    {signInMutation.isPending ? "Signing In..." : "Sign In"}
                                </Button>
                            </form>
                        </Form>
                        <div className="mt-4 flex justify-between items-center text-sm">
                            <Link href="/admin/auth/forgot-password" className="text-blue-600 hover:underline">
                                Forgot Password?
                            </Link>
                            <Link href="/admin/auth/signin-otp" className="text-blue-600 hover:underline">
                                SignIn With OTP?
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}