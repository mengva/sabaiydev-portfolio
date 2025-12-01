import { NewsCategoryDto, NewsStatusDto, SearchQueryNewsCategoryDto, SearchQueryNewsStatusDto } from "../../../types/news";

export const NewsCategoryArray = ["TECHNOLOGY", "CLOUD", "COMPANY", "PRODUCT", "INDUSTRY"] as NewsCategoryDto[];

export const NewsStatusArray = ["DRAFT", "PUBLISHED", "ARCHIVED"] as NewsStatusDto[];

export const SearchQueryNewsCategoryArray = ["DEFAULT", ...NewsCategoryArray] as SearchQueryNewsCategoryDto[];

export const SearchQueryNewsStatusArray = ["DEFAULT", ...NewsStatusArray] as SearchQueryNewsStatusDto[];