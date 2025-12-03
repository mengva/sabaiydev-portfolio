import { LocalDto } from "../types/constants";
import { FaqCategoryDto, FaqStatusDto } from "../types/faq";
import { StaffSchema } from "./staff";

export interface FaqSchema {
    id: string;
    addByStaffId: string;
    updatedByStaffId?: string | null;
    category: FaqCategoryDto;
    status: FaqStatusDto;
    createdAt: Date;
    updatedAt: Date;
    translationFaq: FaqTranslationSchema[];
    addByStaff: StaffSchema;
    updatedByStaff?: StaffSchema | null;
}

export interface FaqTranslationSchema {
    id: string;
    local: LocalDto;
    faqId: string;
    question: string;
    answer: string;
    createdAt: Date;
    updatedAt: Date;
    faq: FaqSchema;
}