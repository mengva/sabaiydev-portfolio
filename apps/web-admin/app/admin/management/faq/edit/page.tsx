'use client'

import React, { useEffect } from 'react'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useState } from "react";
import { Globe, ArrowLeft } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";
import { MyDataContext } from "@/app/admin/layout";
import { BreadcrumbComponent } from "@/components/breadcrumb";
import Link from "next/link";
import { LocalArray } from "@/admin/packages/utils/constants/variables";
import toast from "react-hot-toast";
import { zodValidationUuid } from "@/admin/packages/validations/constants";
import trpc from '@/app/trpc/client';
import { ServerResponseDto } from '@/admin/packages/types/constants';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import LoadingComponent from '@/components/loading';
import { FaqSchema } from '@/admin/packages/schema/faq';
import { zodValidationEditOneFaqData, ZodValidationEditOneFaqData } from '@/admin/packages/validations/faq';
import { FaqCategoryArray, FaqStatusArray } from '@/admin/packages/utils/constants/variables/faq';

function FaqManageEditFormPage() {

    const myDataContext = useContext(MyDataContext);
    if (!myDataContext) return null;

    const searchParams = useSearchParams();

    const [myData, setMyData] = useState(myDataContext.data);
    const [faqId, setFaqId] = useState<string>("");
    const [faqData, setFaqData] = useState<FaqSchema | null>(null);
    const router = useRouter();

    const form = useForm<ZodValidationEditOneFaqData>({
        resolver: zodResolver(zodValidationEditOneFaqData),
        defaultValues: {
            updatedByStaffId: myData.id ?? "",
            faqId: faqId,
            status: "PUBLISHED",
            category: "GENERAL",
            translations: [
                { question: "", local: "en", answer: "" },
                { question: "", local: "lo", answer: "" },
                { question: "", local: "th", answer: "" },
            ],
        },
    });

    // Get newsId from searchParams
    useEffect(() => {
        const id = searchParams.get("id");
        if (id) {
            const validationId = zodValidationUuid.safeParse(id);
            if (!validationId?.success) {
                router.push("/admin/management/faq");
                return;
            }
            setFaqId(id);
        }
    }, [searchParams]);

    // Update myData from context
    useEffect(() => {
        if (myDataContext?.data) {
            setMyData(myDataContext.data);
        }
    }, [myDataContext]);

    // Fetch product - moved after all useState calls
    const {
        data: response,
        isLoading,
        refetch,
        isRefetching,
    } = trpc.app.admin.manage.faq.getOne.useQuery(
        { faqId: faqId || "" },
        {
            enabled: !!faqId,
            refetchOnWindowFocus: false,
            keepPreviousData: false,
        },
    );

    const onResetForm = () => {
        form.reset({
            status: "PUBLISHED",
            category: "GENERAL",
            translations: [
                { question: "", local: "en", answer: "" },
                { question: "", local: "lo", answer: "" },
                { question: "", local: "th", answer: "" },
            ],
        });
    }

    const addMutation = {
        onSuccess: (data: ServerResponseDto) => {
            if (data && data.success) {
                toast.success(data.message);
                router.push("/admin/management/faq");
            }
        },
        onError: (error: Error) => {
            toast.error(error.message);
        }
    }

    const editOneDataMutation = trpc.app.admin.manage.faq.editDataById.useMutation(addMutation);

    const editOneMutation = trpc.app.admin.manage.faq.editById.useMutation(addMutation);

    // Load product data into form when response arrives
    useEffect(() => {
        if (response?.data && myData && form && faqId) {
            const faqResultData = response.data as FaqSchema;
            console.log("faqResultData", faqResultData);
            setFaqData(faqResultData);
            const translations = faqResultData.translationFaq.map(tr => ({
                answer: tr.answer,
                local: tr.local,
                question: tr.question,
            }));
            form.reset({
                status: faqResultData.status,
                category: faqResultData.category,
                translations,
                updatedByStaffId: myData.id || '',
            } as ZodValidationEditOneFaqData);// Force Select components to update after reset

            setTimeout(() => {
                form.setValue("status", faqResultData.status, { shouldDirty: true });
                form.setValue("category", faqResultData.category, { shouldDirty: true });
            }, 0);
        }
    }, [response?.data, myData?.id, form, faqId]);

    // Now we can have early returns - all hooks are already called
    if (!myDataContext || !myDataContext.data) {
        return <LoadingComponent />;
    }

    if (!faqId || !myData) {
        return <LoadingComponent />;
    }

    if (isLoading && !response) {
        return <LoadingComponent />;
    }

    const onSubmit = (data: ZodValidationEditOneFaqData) => {
        // check data is empty
        if (!data) return;

        editOneMutation.mutate(data);
    };

    const isLoadingEdit = editOneDataMutation.isPending || editOneMutation.isPending;

    return (
        <>
            <div className='mb-4 flex items-center justify-start gap-x-4'>
                <Link href={'/admin/management/faq'}>
                    <Button className="cursor-pointer">
                        <ArrowLeft />
                    </Button>
                </Link>
                <BreadcrumbComponent path='/admin/management/faq' title="Edit" linkTitle='Faq Management' />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <Globe className="w-6 h-6" />
                        Edit Faq
                    </CardTitle>
                    <CardDescription>
                        Fill in Faq details with multilingual support
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Status */}
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {
                                                        FaqStatusArray.map((status, index) => (
                                                            <SelectItem key={index} value={status}>{status}</SelectItem>
                                                        ))
                                                    }
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Category */}
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {
                                                        FaqCategoryArray.map((category, index) => (
                                                            <SelectItem key={index} value={category}>{category}</SelectItem>
                                                        ))
                                                    }
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Translations Tabs */}
                            <div>
                                <Label className="text-lg font-semibold">Translations</Label>
                                <Tabs defaultValue="en" className="mt-4">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger className="cursor-pointer" value="en">English (en)</TabsTrigger>
                                        <TabsTrigger className="cursor-pointer" value="lo">Lao (lo)</TabsTrigger>
                                        <TabsTrigger className="cursor-pointer" value="th">Thai (th)</TabsTrigger>
                                    </TabsList>

                                    {LocalArray.map((lang, langIdx) => (
                                        <TabsContent key={lang} value={lang} className="space-y-4 mt-6">
                                            <FormField
                                                control={form.control}
                                                name={`translations.${langIdx}.answer`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Answer</FormLabel>
                                                        <FormControl>
                                                            <Textarea rows={3} placeholder="answer..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`translations.${langIdx}.question`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Question</FormLabel>
                                                        <FormControl>
                                                            <Textarea rows={6} placeholder="Full faq question..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                        </TabsContent>
                                    ))}
                                </Tabs>
                            </div>

                            <Button type="submit" size="lg" className="cursor-pointer w-full" disabled={isLoadingEdit}>
                                {isLoadingEdit ? "Editing..." : "Edit Faq"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </>
    )
}

export default FaqManageEditFormPage;
