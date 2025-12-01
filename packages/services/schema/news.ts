import { LocalDto } from "../types/constants";
import { NewsCategoryDto, NewsStatusDto } from "../types/news";
import { StaffSchema } from "./staff";

export interface NewsSchema {
    id: string;
    staffId: string;
    updatedByStaffId: string;
    category: NewsCategoryDto;
    status: NewsStatusDto;
    createdAt: Date | null;
    updatedAt: Date | null;
    staff: StaffSchema;
    updatedByStaff: StaffSchema;
    images: NewsImageSchema[];
    translationNews: TranslationNewsSchema[];
}

export interface TranslationNewsSchema {
    id: string;
    newsId: string;
    local: LocalDto;
    title: string;
    description: string;
    content: string;
    createdAt: Date | null;
    updatedAt: Date | null;
    news: NewsSchema;
}

export interface NewsImageSchema {
    id: string;
    newsId: string;
    imageUrl: string;
    cloudinaryId: string;
    type: string;
    size: number;
    width: number;
    height: number;
    createdAt: Date | null;
    updatedAt: Date | null;
    news: NewsSchema;
}