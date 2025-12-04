import { CareerDepartmentArray, CareerStatusArray, CareerTypeArray, CustomerStatusArray, SearchQueryCareerDepartmentArray, SearchQueryCareerStatusArray, SearchQueryCareerTypeArray } from "../utils/constants/variables/career";
import { LocalDto } from "./constants";

export type CareerDepartmentDto = (typeof CareerDepartmentArray)[number];
export type CareerTypeDto = (typeof CareerTypeArray)[number];
export type CareerStatusDto = (typeof CareerStatusArray)[number];
export type CustomerStatusDto = (typeof CustomerStatusArray)[number];

export type SearchQueryCareerDepartmentDto = (typeof SearchQueryCareerDepartmentArray)[number];
export type SearchQueryCareerTypeDto = (typeof SearchQueryCareerTypeArray)[number];
export type SearchQueryCareerStatusDto = (typeof SearchQueryCareerStatusArray)[number];

export type TranslationCareerDto = {
    local: LocalDto;
    location: string;
    jobTitle: string;
    description: string;
    requirements: string[];
    benefits: string[];
};