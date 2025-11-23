import { LocalDto } from "../types/constants";
import { ProductCategoryDto, ProductStatusDto } from "../types/product";
import { StaffSchema } from "./staff";

export interface ProductSchema {
    id: string;
    addByStaffId: string;
    updatedByStaffId: string;
    category: ProductCategoryDto;
    status: ProductStatusDto;
    technologies: string[];
    createdAt: Date | null;
    updatedAt: Date | null;
    addByStaff: StaffSchema;
    updatedByStaff: StaffSchema;
    images: ProductImageSchema[];
    translationProducts: TranslationProductSchema[];
}

export interface TranslationProductSchema {
    id: string;
    local: LocalDto;
    productId: ProductSchema;
    name: string;
    description: string;
    longDescription: string;
    features: string[];
    createdAt: Date | null;
    updatedAt: Date | null;
    product: ProductSchema;
}

export interface ProductImageSchema {
    id: string;
    productId: string;
    imageUrl: string;
    cloudinaryId: string;
    type: string;
    size: number;
    width: number;
    height: number;
    createdAt: Date | null;
    updatedAt: Date | null;
    product: ProductSchema;
}