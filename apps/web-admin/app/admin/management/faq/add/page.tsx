'use client'

import React from 'react'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
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
import trpc from '@/app/trpc/client';
import { ServerResponseDto } from '@/admin/packages/types/constants';
import { zodValidationAddOneFaqData, ZodValidationAddOneFaqData } from '@/admin/packages/validations/faq';
import { FaqCategoryArray, FaqStatusArray } from '@/admin/packages/utils/constants/variables/faq';

function FaqManageAddFormPage() {

    const myDataContext = useContext(MyDataContext);
    if (!myDataContext) return null;
    
    const [myData, setMyData] = useState(myDataContext.data);
    const router = useRouter();

    const form = useForm<ZodValidationAddOneFaqData>({
        resolver: zodResolver(zodValidationAddOneFaqData),
        defaultValues: {
            addByStaffId: myData.id ?? "",
            status: "PUBLISHED",
            category: "GENERAL",
            // demo image object - cast to match your ZodValidationFiles type
            translations: [
                {
                    local: "en",
                    question: "How long does it take to process a visa application?",
                    answer: "Standard visa processing usually takes 5–10 business days after we receive all required documents. Expedited processing (additional fee applies) can be completed in 2–3 business days."
                },
                {
                    local: "lo",
                    question: "ການຂໍວີຊ້າໃຊ້ເວລາດົນປານໃດ?",
                    answer: "ການປະມວນຜົນວີຊ້າມາດຕະຖານປົກກະຕິໃຊ້ເວລາ 5–10 ມື້ເຮັດວຽກ ຫຼັງຈາກພວກເຮົາໄດ້ຮັບເອກະສານທັງໝົດທີ່ຕ້ອງການ. ການປະມວນຜົນດ່ວນ (ມີຄ່າທຳນຽມເພີ່ມ) ສາມາດສຳເລັດພາຍໃນ 2–3 ມື້ເຮັດວຽກ."
                },
                {
                    local: "th",
                    question: "การขอวีซ่าใช้เวลาดำเนินการนานแค่ไหน?",
                    answer: "การพิจารณาวีซ่าปกติใช้เวลา 5–10 วันทำการ หลังจากที่เราได้รับเอกสารครบถ้วนแล้ว การดำเนินการแบบเร่งด่วน (มีค่าธรรมเนียมเพิ่มเติม) สามารถเสร็จสิ้นภายใน 2–3 วันทำการ"
                }
            ],
        },
    });


    const onResetForm = () => {
        form.reset({
            status: "PUBLISHED",
            category: "GENERAL",
            translations: [
                { answer: "", local: "en", question: "", },
                { answer: "", local: "lo", question: "", },
                { answer: "", local: "th", question: "", },
            ],
        });
    }

    const addMutation = {
        onSuccess: (data: ServerResponseDto) => {
            if (data && data.success) {
                onResetForm();
                toast.success(data.message);
                router.push("/admin/management/faq");
            }
        },
        onError: (error: Error) => {
            toast.error(error.message);
        }
    }

    const addOneMutation = trpc.app.admin.manage.faq.addOne.useMutation(addMutation);

    const onSubmit = (data: ZodValidationAddOneFaqData) => {
        // check data is empty
        if (!data) return;

        addOneMutation.mutate(data);
    };

    const isLoading = addOneMutation.isPending;

    return (
        <>
            <div className='mb-4 flex items-center justify-start gap-x-4'>
                <Link href={'/admin/management/faq'}>
                    <Button className="cursor-pointer">
                        <ArrowLeft />
                    </Button>
                </Link>
                <BreadcrumbComponent path='/admin/management/faq' title="Add" linkTitle='Faq Management' />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <Globe className="w-6 h-6" />
                        Add New Faq
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

                            <Button type="submit" size="lg" className="cursor-pointer w-full" disabled={isLoading}>
                                {isLoading ? "Adding..." : "Add Faq"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </>
    )
}

export default FaqManageAddFormPage;
