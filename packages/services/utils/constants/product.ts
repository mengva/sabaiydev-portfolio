export const ProductCategoryArray = ["COLLABORATION", "MEDIA", "ANALYTICS", "SECURITY", "DEVELOPMENT"] as const;
export const ProductStatusArray = ["ACTIVE", "INACTIVE", "DEVELOPMENT", "DEPRECATED"] as const;

export const SearchQueryProductCategoryArray = ["DEFAULT", ...ProductCategoryArray] as const;
export const SearchQueryProductStatusArray = ["DEFAULT", ...ProductStatusArray] as const;