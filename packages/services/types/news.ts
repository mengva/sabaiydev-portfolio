import { LocalDto } from "./constants";

export type NewsCategoryDto = "TECHNOLOGY" | "CLOUD" | "COMPANY" | "PRODUCT" | "INDUSTRY";
export type NewsStatusDto = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type SearchQueryNewsCategoryDto = "DEFAULT" | NewsCategoryDto;
export type SearchQueryNewsStatusDto = "DEFAULT" | NewsStatusDto;

export interface TranslationNewsDto {
    local: LocalDto;
    title: string;
    description: string;
    content: string;
}