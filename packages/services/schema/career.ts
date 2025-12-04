import { CareerDepartmentDto, CareerStatusDto, CareerTypeDto, CustomerStatusDto } from "../types/career";
import { LocalDto } from "../types/constants";
import { StaffSchema } from "./staff";

export interface CareerSchema {
    id: string;
    addByStaffId: string;
    updatedByStaffId?: string;
    department: CareerDepartmentDto;
    jobType: CareerTypeDto;
    isApplyCareer: boolean;
    isFeatured: boolean;
    status: CareerStatusDto;
    salaryRange: string[];
    createdAt: Date;
    updatedAt: Date;
    addByStaff: StaffSchema;
    updatedByStaff?: StaffSchema;
    translationCareers: TranslationCareerSchema[];
    applyCareers: ApplyCareerSchema[];
}

export interface TranslationCareerSchema {
    id: string;
    local: LocalDto;
    careerId: string;
    location: string;
    jobTitle: string;
    description: string;
    requirements: string;
    benefits: string;
    createdAt: Date;
    updatedAt: Date;
    career: CareerSchema;
}

export interface ApplyCareerSchema {
    id: string;
    local: LocalDto;
    careerId: string;
    coverLetter?: string;
    reference?: string;
    isView: boolean;
    benefits: string;
    createdAt: Date;
    updatedAt: Date;
    career: CareerSchema;
    customerInformation?: CustomerInformationSchema;
}

export interface CustomerInformationSchema {
    id: string;
    applyCareerId: string;
    email: string;
    phoneNumber: string;
    address?: string;
    status: CustomerStatusDto;
    createdAt: Date;
    updatedAt: Date;
    applyCareer: ApplyCareerSchema;
    experiences: ExperienceSchema[];
    educations: EducationSchema[];
    skills: SkillSchema[];
    cvCustomers: CvCustomerSchema[];
    customerImages: CustomerImageSchema[];
}

export interface ExperienceSchema {
    id: string;
    customerId: string;
    companyName?: string;
    position?: string;
    startDate: Date;
    endDate: Date;
    description?: string;
    companyLinks: string[];
    createdAt: Date;
    updatedAt: Date;
    customerInformation: CustomerInformationSchema;
}

export interface EducationSchema {
    id: string;
    customerId: string;
    school?: string;
    graduationYear?: string;
    degreeOrCertificate?: string;
    createdAt: Date;
    updatedAt: Date;
    customerInformation: CustomerInformationSchema;
}

export interface SkillSchema {
    id: string;
    customerId: string;
    technicalSkills: string[];
    softSkills: string[];
    certifications: string[];
    createdAt: Date;
    updatedAt: Date;
    customerInformation: CustomerInformationSchema;
}

export interface CvCustomerSchema {
    id: string;
    customerId: string;
    cvUrl: string;
    cloudinaryId: string;
    type: string;
    size: number;
    width: number;
    height: number;
    createdAt: Date;
    updatedAt: Date;
    customerInformation: CustomerInformationSchema;
}

export interface CustomerImageSchema {
    id: string;
    customerId: string;
    imageUrl: string;
    cloudinaryId: string;
    type: string;
    size: number;
    width: number;
    height: number;
    createdAt: Date;
    updatedAt: Date;
    customerInformation: CustomerInformationSchema;
}