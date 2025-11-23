import type { FileDto, LocalDto } from "./constants";

export type ProductCategoryDto = "COLLABORATION" | "MEDIA" | "ANALYTICS" | "SECURITY" | "DEVELOPMENT";
export type ProductStatusDto = "ACTIVE" | "INACTIVE" | "DEVELOPMENT" | "DEPRECATED";
export type SearchQueryProductCategoryDto = "DEFAULT" | ProductCategoryDto;
export type SearchQueryProductStatusDto = "DEFAULT" | ProductStatusDto;

export interface AddNewProductDto {
    addByStaffId: string;
    translations: TranslationProductDto[];
    technologies: string[];
    category: ProductCategoryDto;
    status: ProductStatusDto;
    imageFiles: FileDto[];
}

export interface TranslationProductDto {
    name: string;
    description: string;
    longDescription: string;
    features: string[];
    local: LocalDto;
}