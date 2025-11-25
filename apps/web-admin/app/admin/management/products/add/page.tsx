'use client';

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
import { Badge } from "@workspace/ui/components/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@workspace/ui/components/command";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { HiMiniXMark, HiXMark } from "react-icons/hi2";
import { zodValidationAddOneProduct, ZodValidationAddOneProduct } from "@/admin/packages/validations/product";
import { ProductCategoryArray, ProductStatusArray } from "@/admin/packages/utils/constants/product";
import { MyDataContext } from "@/app/admin/layout";
import { BreadcrumbComponent } from "@/components/breadcrumb";
import Link from "next/link";
import { LocalArray } from "@/admin/packages/utils/constants";
import { UploadFileServices } from "@/admin/packages/utils/ClientUploadFile";
import { ValidationSecureFileUploadServices } from "@/admin/packages/utils/SecureFile";
import toast from "react-hot-toast";
import { getHTTPError, HTTPErrorMessage } from "@/admin/packages/utils/HttpJsError";
import { ErrorHandler } from "@/admin/packages/utils/HandleError";

const availableTechnologies = [
    "React", "Node.js", "TypeScript", "Next.js", "Tailwind CSS",
    "PostgreSQL", "MongoDB", "Docker", "AWS", "Firebase", "GraphQL"
];

export default function AddProductFormPage() {
    const myDataContext = useContext(MyDataContext);
    if (!myDataContext) return null;
    const [openTechPopover, setOpenTechPopover] = useState(false);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const inputFiles = useRef<HTMLInputElement | null>(null)

    const form = useForm<ZodValidationAddOneProduct>({
        resolver: zodResolver(zodValidationAddOneProduct),
        defaultValues: {
            addByStaffId: myDataContext.data.id ?? "",
            technologies: [],
            status: "ACTIVE",
            category: "MEDIA",
            imageFiles: [],
            translations: [
                { name: "", local: "en", description: "", longDescription: "", features: [""] },
                { name: "", local: "lo", description: "", longDescription: "", features: [""] },
                { name: "", local: "th", description: "", longDescription: "", features: [""] },
            ],
        },
    });

    const onSubmit = (data: ZodValidationAddOneProduct) => {
        console.log("data", data);
        alert("Product added successfully!");
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const files = e.target.files;
            if (!files) return;

            const arrayFiles = Array.from(files);

            const cleanFiles = await UploadFileServices.uploadFiles(arrayFiles);
            if (!cleanFiles || cleanFiles === undefined) return;
            form.setValue("imageFiles", [...(form.getValues("imageFiles") || []), ...cleanFiles]);
        } catch (error) {
            const message = ErrorHandler.getErrorMessage(error);
            toast.error(message || "Falied Upload files");
        }
    };

    const removeImage = (index: number) => {
        setPreviewImages((prev) => prev.filter((_, i) => i !== index));
        const currentFiles = form.getValues("imageFiles") || [];
        form.setValue("imageFiles", currentFiles.filter((_, i) => i !== index));
    };

    return (
        <>
            <div className='mb-4 flex items-center justify-start gap-x-4'>
                <Link href={'/admin/management/products'}>
                    <Button className="cursor-pointer">
                        <ArrowLeft />
                    </Button>
                </Link>
                <BreadcrumbComponent path='/admin/management/products' />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <Globe className="w-6 h-6" />
                        Add New Product
                    </CardTitle>
                    <CardDescription>
                        Fill in product details with multilingual support
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
                                                        ProductStatusArray.map((status, index) => (
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
                                                        ProductCategoryArray.map((category, index) => (
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

                            {/* Technologies Multi-Select */}
                            <FormField
                                control={form.control}
                                name="technologies"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Technologies Used</FormLabel>
                                        <FormControl>
                                            <Input placeholder="technology1, technology2, technology3,..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Image Upload */}
                            <div>
                                <div>
                                    <div className="sm:mt-6">
                                        <Button type="button" variant={"destructive"} onClick={() => form.setValue("imageFiles", [])} className="cursor-pointer w-full">Delete All File Select</Button>
                                    </div>
                                    <Label>Product Images</Label>
                                    <Card className="mt-2 grid place-items-center">
                                        <CardContent className="min-w-xl border-dotted border-4 p-4 border-slate-600 cursor-pointer h-48 grid place-items-center rounded-xl">
                                            <Input
                                                ref={inputFiles}
                                                type="file"
                                                multiple
                                                accept="image/jpeg, image/png, image/web"
                                                onChange={handleImageChange}
                                                className="cursor-pointer"
                                            />
                                            <div onClick={() => inputFiles.current?.focus()} className="w-16 h-16 rounded-full border grid place-items-center">
                                                <Upload />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                                {previewImages.length > 0 && (
                                    <div className="grid 2xl:grid-cols-8 xl:grid-cols-6 lg:grid-cols-4 sm:grid-cols-2 gap-4 mt-4">
                                        {previewImages.map((src, idx) => (
                                            <div key={idx} className="relative group">
                                                <img src={src} alt="preview" className="w-full aspect-[5/4] object-cover rounded-lg border" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(idx)}
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer"
                                                >
                                                    <HiMiniXMark className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
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
                                                name={`translations.${langIdx}.name`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Product Name ({lang.toUpperCase()})</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder={`Product name in ${lang}`} {...field} />
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
                                                        <FormLabel>Short Description</FormLabel>
                                                        <FormControl>
                                                            <Textarea rows={3} placeholder="Brief description..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`translations.${langIdx}.longDescription`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Detailed Description</FormLabel>
                                                        <FormControl>
                                                            <Textarea rows={6} placeholder="Full product details..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Features Array */}
                                            <div>
                                                <FormLabel>Key Features</FormLabel>
                                                {form.watch(`translations.${langIdx}.features`)?.map((_, featureIdx) => (
                                                    <div key={featureIdx} className="flex gap-2 mt-2">
                                                        <FormField
                                                            control={form.control}
                                                            name={`translations.${langIdx}.features.${featureIdx}`}
                                                            render={({ field }) => (
                                                                <FormItem className="flex-1">
                                                                    <FormControl>
                                                                        <Input placeholder="e.g. Fast performance" {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            className="cursor-pointer"
                                                            size="icon"
                                                            onClick={() => {
                                                                const features = form.getValues(`translations.${langIdx}.features`);
                                                                form.setValue(
                                                                    `translations.${langIdx}.features`,
                                                                    features.filter((_: any, i: number) => i !== featureIdx)
                                                                );
                                                            }}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-3"
                                                    onClick={() => {
                                                        form.setValue(`translations.${langIdx}.features`, [
                                                            ...form.getValues(`translations.${langIdx}.features`),
                                                            "",
                                                        ]);
                                                    }}
                                                >
                                                    <Plus className="w-4 h-4 mr-2" /> Add Feature
                                                </Button>
                                            </div>
                                        </TabsContent>
                                    ))}
                                </Tabs>
                            </div>

                            <Button type="submit" size="lg" className="cursor-pointer w-full">
                                Add Product
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </>
    );
}