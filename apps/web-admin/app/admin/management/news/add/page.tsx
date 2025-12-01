'use client'

import React from 'react'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useRef, useState } from "react";
import { Plus, Trash2, Globe, ArrowLeft, Upload } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";
import { HiMiniXMark } from "react-icons/hi2";
import { MyDataContext } from "@/app/admin/layout";
import { BreadcrumbComponent } from "@/components/breadcrumb";
import Link from "next/link";
import { AllowedImageFileType, LocalArray } from "@/admin/packages/utils/constants/variables";
import { UploadFileServices } from "@/admin/packages/utils/ClientUploadFile";
import toast from "react-hot-toast";
import { ErrorHandler } from "@/admin/packages/utils/HandleError";
import { ZodValidationFiles } from "@/admin/packages/validations/constants";
import { zodValidationAddOneNews, ZodValidationAddOneNews } from '@/admin/packages/validations/news';
import { NewsCategoryArray, NewsStatusArray } from '@/admin/packages/utils/constants/variables/news';

function NewsManageAddFormPage() {

    const myDataContext = useContext(MyDataContext);
    if (!myDataContext) return null;

    const [myData, setMyData] = useState(myDataContext.data);
    const inputFiles = useRef<HTMLInputElement | null>(null);
    const [imageFiles, setImageFiles] = useState([] as ZodValidationFiles);

    const form = useForm<ZodValidationAddOneNews>({
        resolver: zodResolver(zodValidationAddOneNews),
        defaultValues: {
            staffId: myData.id ?? "",
            status: "PUBLISHED",
            category: "CLOUD",
            // demo image object - cast to match your ZodValidationFiles type
            imageFiles: [],
            translations: [
                {
                    title: "Demo news (EN)",
                    local: "en",
                    description: "Short demo description in English.",
                    content: "The long more detail"
                },
                {
                    title: "news ຕົວຢ່າງ (LO)",
                    local: "lo",
                    description: "ຄຳອະທິບາຍສັ້ນໃນພາສາລາວ",
                    content: "ຄຳອະທິບາຍຍາວເພີ່ມເຕີມ",
                },
                {
                    title: "news เดโม (TH)",
                    local: "th",
                    description: "คำอธิบายสั้น ๆ เป็นภาษาไทย",
                    content: "คำอธิบายยาวสำหรับผลิตภัณฑ์ตัวอย่างเป็นภาษาไทย",
                },
            ],
        },
    });

    const onSubmit = (data: ZodValidationAddOneNews) => {
        if (!data) return;

        console.log("data news", data);
    }

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const files = e.target.files;
            if (!files) return;

            const arrayFiles = Array.from(files);

            const cleanFiles = await UploadFileServices.uploadFiles(arrayFiles);

            if (cleanFiles.message !== "success" && cleanFiles.files.length === 0) {
                toast.error(cleanFiles.message);
                return;
            }

            form.setValue("imageFiles", [...(form.getValues("imageFiles") || []), ...cleanFiles.files]);
            setImageFiles(prev => [...prev, ...cleanFiles.files] as ZodValidationFiles);
        } catch (error) {
            const message = ErrorHandler.getErrorMessage(error);
            toast.error(message || "Falied Upload files");
        }
    };

    const removeImage = (index: number) => {
        const currentFiles = (form.getValues("imageFiles") || imageFiles).filter((_, i) => i !== index);
        setImageFiles(currentFiles);
        form.setValue("imageFiles", currentFiles);
    };

    const isLoading = false;

    return (
        <>
            <div className='mb-4 flex items-center justify-start gap-x-4'>
                <Link href={'/admin/management/news'}>
                    <Button className="cursor-pointer">
                        <ArrowLeft />
                    </Button>
                </Link>
                <BreadcrumbComponent path='/admin/management/news' title="Add" linkTitle='News Management' />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <Globe className="w-6 h-6" />
                        Add New News
                    </CardTitle>
                    <CardDescription>
                        Fill in News details with multilingual support
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                            {/* Image Upload */}
                            <div>
                                <div>
                                    {/* <div className="sm:mt-6">
                                                <Button type="button" variant={"destructive"} onClick={() => form.setValue("imageFiles", [])} className="cursor-pointer w-full">Delete All File Select</Button>
                                            </div> */}
                                    <Label>News Images</Label>
                                    <Card className="mt-2 grid place-items-center">
                                        <CardContent onClick={() => inputFiles.current?.click()} className="lg:min-w-xl w-[80%] border-dotted border-4 p-4 dark:border-slate-600 cursor-pointer h-48 grid place-items-center rounded-xl">
                                            <Input
                                                ref={inputFiles}
                                                type="file"
                                                multiple
                                                accept={AllowedImageFileType}
                                                onChange={handleImageChange}
                                                className="sr-only"
                                            />
                                            <div className="w-16 h-16 rounded-full border grid place-items-center">
                                                <Upload />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {
                                    imageFiles.length > 0 && (
                                        <Card className="mt-4">
                                            <CardContent className="grid 2xl:grid-cols-8 xl:grid-cols-6 lg:grid-cols-4 sm:grid-cols-2 gap-4">
                                                {imageFiles.map((src, idx) => (
                                                    <div key={idx} className="relative group">
                                                        <img src={src.fileData} alt="preview" className="w-full aspect-5/4 object-cover rounded-lg border" />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(idx)}
                                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full transition cursor-pointer"
                                                        >
                                                            <HiMiniXMark className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    )
                                }
                            </div>

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
                                                        NewsStatusArray.map((status, index) => (
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
                                                        NewsCategoryArray.map((category, index) => (
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
                                                name={`translations.${langIdx}.title`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>News Title ({lang.toUpperCase()})</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder={`News title in ${lang}`} {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`translations.${langIdx}.description`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Description</FormLabel>
                                                        <FormControl>
                                                            <Textarea rows={3} placeholder="description..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`translations.${langIdx}.content`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Content</FormLabel>
                                                        <FormControl>
                                                            <Textarea rows={6} placeholder="Full news content..." {...field} />
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
                                {isLoading ? "Adding News..." : "Add News"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </>
    )
}

export default NewsManageAddFormPage;
