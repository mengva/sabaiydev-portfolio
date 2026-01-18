'use client'

import React, { useEffect } from 'react'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, ArrowLeft, Trash2, Plus } from "lucide-react";
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
import { zodValidationAddOneCareerData, ZodValidationAddOneCareerData } from '@/admin/packages/validations/career';
import { CareerDepartmentArray, CareerStatusArray, CareerTypeArray } from '@/admin/packages/utils/constants/variables/career';
import { Input } from '@workspace/ui/components/input';

function CareerManageAddFormPage() {

    const myDataContext = useContext(MyDataContext);
    if (!myDataContext) return null;

    const [myData, setMyData] = useState(myDataContext?.data || null);
    const router = useRouter();

    useEffect(() => {
        if(myDataContext?.data){
            setMyData(myDataContext.data);
        }
    }, [myDataContext?.data]);

    const form = useForm<ZodValidationAddOneCareerData>({
        resolver: zodResolver(zodValidationAddOneCareerData),
        defaultValues: {
            addByStaffId: myData.id ?? "",
            status: "OPEN",
            department: "ENGINEERING",
            saralyRange: ["", ""],
            jobType: "FULL_TIME",
            translations: [
                {
                    jobTitle: "Senior Frontend Developer",
                    local: "en",
                    location: "Vientiane, Laos (Hybrid)",
                    requirements: [
                        "5+ years of experience with React/TypeScript",
                        "Strong proficiency in modern CSS (Tailwind/Flexbox/Grid)",
                        "Experience with state management (Redux, Zustand, or Context API)",
                        "Excellent English communication skills",
                        "Ability to work independently and in a team"
                    ],
                    benefits: [
                        "Competitive salary: $40,000 – $65,000 USD/year",
                        "Health insurance & annual health check-up",
                        "15–20 days of paid annual leave",
                        "Remote/hybrid work options",
                        "Latest MacBook Pro + external monitor",
                        "Visa and work permit sponsorship (if needed)"
                    ],
                },
                {
                    jobTitle: "ນັກພັດທະນາ Frontend ອາວຸໂสໃຫຍ່",
                    local: "lo",
                    location: "ນະຄອນຫຼວງວຽງຈັນ, ລາວ (ປະສົມການເຮັດວຽກທີ່ບ້ານ)",
                    requirements: [
                        "ປະສົບການ 5+ ປີ ກັບ React/TypeScript",
                        "ມີຄວາມຊຳນານດ້ານ CSS ສະໄຫມໃໝ່ (Tailwind/Flexbox/Grid)",
                        "ມີປະສົບການກັບການຈັດການສະຖານະ (Redux, Zustand ຫຼື Context API)",
                        "ສື່ສານພາສາອັງກິດໄດ້ດີ",
                        "ສາມາດເຮັດວຽກດ້ວຍຕົນເອງ ແລະ ເປັນທີມໄດ້"
                    ],
                    benefits: [
                        "ເງິນເດືອນທີ່ແຂ່ງຂັນ: $40,000 – $65,000 USD/ປີ",
                        "ປະກັນສຸຂະພາບ ແລະ ກວດສຸຂະພາບປະຈຳປີ",
                        "ພັກຜ່ອນປະຈຳປີ 15–20 ມື້ (ມີເງິນ)",
                        "ເຮັດວຽກຈາກບ້ານ/ປະສົມໄດ້",
                        "MacBook Pro ລຸ້ນໃໝ່ + ຈໍພາຍນອກ",
                        "ສະໜັບສະໜູນວີຊາ ແລະ ໃບອະນຸຍາດເຮັດວຽກ (ຖ້າຕ້ອງການ)"
                    ],
                },
                {
                    jobTitle: "Senior Frontend Developer (อาวุโส)",
                    local: "th",
                    location: "นครหลวงเวียงจันทน์ ลาว (Hybrid)",
                    requirements: [
                        "ประสบการณ์ 5+ ปี กับ React/TypeScript",
                        "เชี่ยวชาญ CSS สมัยใหม่ (Tailwind/Flexbox/Grid)",
                        "มีประสบการณ์กับ State Management (Redux, Zustand หรือ Context API)",
                        "สื่อสารภาษาอังกฤษได้ดี",
                        "ทำงานอิสระและเป็นทีมได้ดี"
                    ],
                    benefits: [
                        "เงินเดือนแข่งขัน: $40,000 – $65,000 USD/ปี",
                        "ประกันสุขภาพและตรวจสุขภาพประจำปี",
                        "ลาพักร้อนมีค่า 15–20 วัน",
                        "ทำงานแบบ Hybrid/Remote ได้",
                        "MacBook Pro รุ่นล่าสุด + จอภายนอก",
                        "สนับสนุนวีซ่าและใบอนุญาตทำงาน (หากต้องการ)"
                    ],
                },
            ],
        },
    });

    const onResetForm = () => {
        form.reset({
            status: "OPEN",
            department: "ENGINEERING",
            jobType: "FULL_TIME",
            saralyRange: [],
            translations: [
                { jobTitle: "", local: "en", location: "", requirements: [""], benefits: [""], },
                { jobTitle: "", local: "lo", location: "", requirements: [""], benefits: [""], },
                { jobTitle: "", local: "th", location: "", requirements: [""], benefits: [""], },
            ],
        });
    }

    const addMutation = {
        onSuccess: (data: ServerResponseDto) => {
            if (data && data.success) {
                toast.success(data.message);
                router.push("/admin/management/career");
                return;
            }
        },
        onError: (error: Error) => {
            toast.error(error.message);
        }
    }

    const addOneMutation = trpc.app.admin.manage.career.addOne.useMutation(addMutation);

    const onSubmit = (data: ZodValidationAddOneCareerData) => {
        // check data is empty
        if (!data) return;

        console.log("data", data);

        // addOneMutation.mutate(data);
    };

    const isLoading = false;

    return (
        <>
            <div className='mb-4 flex items-center justify-start gap-x-4'>
                <Link href={'/admin/management/career'}>
                    <Button className="cursor-pointer">
                        <ArrowLeft />
                    </Button>
                </Link>
                <BreadcrumbComponent path='/admin/management/career' title="Add" linkTitle='Career Management' />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <Globe className="w-6 h-6" />
                        Add New Career
                    </CardTitle>
                    <CardDescription>
                        Fill in Career details with multilingual support
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                {/* Department */}
                                <FormField
                                    control={form.control}
                                    name="department"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Department</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select department" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {
                                                        CareerDepartmentArray.map((department, index) => (
                                                            <SelectItem key={index} value={department}>{department}</SelectItem>
                                                        ))
                                                    }
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

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
                                                        CareerStatusArray.map((status, index) => (
                                                            <SelectItem key={index} value={status}>{status}</SelectItem>
                                                        ))
                                                    }
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* JobType */}
                                <FormField
                                    control={form.control}
                                    name="jobType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>JobType</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {
                                                        CareerTypeArray.map((type, index) => (
                                                            <SelectItem key={index} value={type}>{type}</SelectItem>
                                                        ))
                                                    }
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div>
                                <FormLabel>Key Saraly Range</FormLabel>
                                {
                                    form.watch(`saralyRange`)?.map((_, featureIdx) => (
                                        <div key={featureIdx} className="flex gap-2 mt-2">
                                            <FormField
                                                control={form.control}
                                                name={`saralyRange.${featureIdx}`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormControl>
                                                            <Input placeholder={featureIdx === 0 ? "Min saraly" : 'Max saraly' } {...field} />
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
                                                    const saralyRanges = form.getValues(`saralyRange`);
                                                    form.setValue(
                                                        `saralyRange`,
                                                        saralyRanges.filter((_: string, i: number) => i !== featureIdx)
                                                    );
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))
                                }
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-3 cursor-pointer"
                                    disabled={form.watch(`saralyRange`).length === 2}
                                    onClick={() => {
                                        form.setValue(`saralyRange`, [
                                            ...form.getValues(`saralyRange`),
                                            "",
                                        ]);
                                    }}
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Add SaralyRange
                                </Button>
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
                                                name={`translations.${langIdx}.jobTitle`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Job Title</FormLabel>
                                                        <FormControl>
                                                            <Textarea rows={2} placeholder="Job title..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`translations.${langIdx}.location`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Location</FormLabel>
                                                        <FormControl>
                                                            <Textarea rows={2} placeholder="Job location..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Requirements Array */}
                                            <div>
                                                <FormLabel>Key Requirements</FormLabel>
                                                {form.watch(`translations.${langIdx}.requirements`)?.map((_, featureIdx) => (
                                                    <div key={featureIdx} className="flex gap-2 mt-2">
                                                        <FormField
                                                            control={form.control}
                                                            name={`translations.${langIdx}.requirements.${featureIdx}`}
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
                                                                const requirements = form.getValues(`translations.${langIdx}.requirements`);
                                                                form.setValue(
                                                                    `translations.${langIdx}.requirements`,
                                                                    requirements.filter((_: any, i: number) => i !== featureIdx)
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
                                                    className="mt-3 cursor-pointer"
                                                    onClick={() => {
                                                        form.setValue(`translations.${langIdx}.requirements`, [
                                                            ...form.getValues(`translations.${langIdx}.requirements`),
                                                            "",
                                                        ]);
                                                    }}
                                                >
                                                    <Plus className="w-4 h-4 mr-2" /> Add Requirements
                                                </Button>
                                            </div>

                                            {/* Benefits Array */}
                                            <div>
                                                <FormLabel>Key Benefits</FormLabel>
                                                {form.watch(`translations.${langIdx}.benefits`)?.map((_, featureIdx) => (
                                                    <div key={featureIdx} className="flex gap-2 mt-2">
                                                        <FormField
                                                            control={form.control}
                                                            name={`translations.${langIdx}.benefits.${featureIdx}`}
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
                                                                const benefits = form.getValues(`translations.${langIdx}.benefits`);
                                                                form.setValue(
                                                                    `translations.${langIdx}.benefits`,
                                                                    benefits.filter((_: any, i: number) => i !== featureIdx)
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
                                                    className="mt-3 cursor-pointer"
                                                    onClick={() => {
                                                        form.setValue(`translations.${langIdx}.benefits`, [
                                                            ...form.getValues(`translations.${langIdx}.benefits`),
                                                            "",
                                                        ]);
                                                    }}
                                                >
                                                    <Plus className="w-4 h-4 mr-2" /> Add Benefits
                                                </Button>
                                            </div>
                                        </TabsContent>
                                    ))}
                                </Tabs>
                            </div>

                            <Button type="submit" size="lg" className="cursor-pointer w-full" disabled={isLoading}>
                                {isLoading ? "Adding..." : "Add Career"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </>
    )
}

export default CareerManageAddFormPage;
