import { LocalDto } from "./constants";

export type FaqCategoryDto = "GENERAL" | "SERVICES" | "SUPPORT" | "PRICING" | "TECHNICAL";
export type FaqStatusDto = "PUBLISHED" | "DRAFT";

export type SearchQueryFaqCategoryDto = "DEFAULT" | FaqCategoryDto;
export type SearchQueryFaqStatusDto = "DEFAULT" | FaqStatusDto;

export interface TranslationFaqDto {
    local: LocalDto;
    question: string;
    answer: string;
}