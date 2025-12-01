import { ProductCategoryDto, ProductStatusDto, SearchQueryProductCategoryDto, SearchQueryProductStatusDto } from "../../../types/product";

export const ProductCategoryArray = ["COLLABORATION", "MEDIA", "ANALYTICS", "SECURITY", "DEVELOPMENT"] as ProductCategoryDto[];
export const ProductStatusArray = ["ACTIVE", "INACTIVE", "DEVELOPMENT", "DEPRECATED"] as ProductStatusDto[];

export const SearchQueryProductCategoryArray = ["DEFAULT", ...ProductCategoryArray] as SearchQueryProductCategoryDto[];
export const SearchQueryProductStatusArray = ["DEFAULT", ...ProductStatusArray] as SearchQueryProductStatusDto[];