'use client'

import { useContext, useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select";
import { Button } from "@workspace/ui/components/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/components/table";
import { Calendar } from "@workspace/ui/components/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@workspace/ui/components/popover";
import { cn } from "@workspace/ui/lib/utils";
import { CalendarIcon, RotateCw, Search } from "lucide-react";
import trpc from "@/app/trpc/client";
import { PaginationFilterDto, ServerResponseDto, MyDataDto } from "@/admin/packages/types/constants";
import { MyDataContext } from "../../layout";
import toast from "react-hot-toast";
import { ErrorHandler } from "@/admin/packages/utils/handleError";
import GlobalHelper from "@/admin/packages/utils/globalHelper";
import { PaginationComponent } from "@/components/pagination";
import Link from "next/link";
import LoadingListComponent from "@/components/listLoading";
import { SearchQueryCareerDepartmentDto, SearchQueryCareerStatusDto, SearchQueryCareerTypeDto } from "@/admin/packages/types/career";
import { SearchQueryCareerDepartmentArray, SearchQueryCareerStatusArray, SearchQueryCareerTypeArray } from "@/admin/packages/utils/constants/variables/career";
import { CareerSchema } from "@/admin/packages/schema/career";
import TableCareerItemComponent from "./components/tableCareerItem";

interface SearchSelectDto {
    query: string;
    department: SearchQueryCareerDepartmentDto,
    status: SearchQueryCareerStatusDto,
    type: SearchQueryCareerTypeDto,
    startDate: Date | undefined;
    endDate: Date | undefined;
}

function CareerManagePage() {
    const myDataContext = useContext(MyDataContext);
    if (!myDataContext) return null;
    const [myData, setMyData] = useState(myDataContext.data as MyDataDto);
    // === Filters State ===
    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState({
        page: 1,
        limit: 20
    });
    const [paginationFilter, setPaginationFilter] = useState({
        total: 20,
        page: 1,
        totalPage: 1,
        limit: 20,
    } as PaginationFilterDto);
    const [search, setSearch] = useState("");
    const [department, setDepartment] = useState<SearchQueryCareerDepartmentDto>("DEFAULT");
    const [status, setStatus] = useState<SearchQueryCareerStatusDto>("DEFAULT");
    const [type, setType] = useState<SearchQueryCareerTypeDto>("DEFAULT");
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [careers, setCareers] = useState([] as CareerSchema[]);

    // === tRPC Query ===
    const {
        data: response,
        isLoading,
        refetch,
        isRefetching,
    } = trpc.app.admin.manage.career.list.useQuery(filter, {
        refetchOnWindowFocus: false,
        keepPreviousData: true, // smooth page transition
    });

    useEffect(() => {
        if (response) {
            const result = response?.data;
            const resultCareers = result?.data ?? []; // the array
            const pagination: PaginationFilterDto = result?.pagination; // pagination info
            setCareers(resultCareers);
            setPaginationFilter(pagination);
        }
    }, [response]);

    const convertDate = (startDate: Date | undefined, endDate: Date | undefined) => {
        const start = startDate ? GlobalHelper.formatDate(startDate) : '';
        const end = endDate ? GlobalHelper.formatDate(endDate) : '';
        return {
            startDate: start,
            endDate: end
        }
    }

    const searchQueryMutation = trpc.app.admin.manage.career.searchQuery.useMutation({
        onSuccess: (data: ServerResponseDto) => {
            if (data && data.success) {
                const result = data?.data;
                const searchQueryPagination = result?.pagination;
                const searchQueryData = result?.data;
                if (searchQueryData && searchQueryPagination) {
                    setCareers(searchQueryData);
                    setPaginationFilter(searchQueryPagination);
                }
            }
        },
        onError: (error: Error) => {
            toast.error(error.message);
        }
    });

    const onSearch = () => {
        try {
            const date = convertDate(startDate, endDate);
            searchQueryMutation.mutate({
                ...filter,
                query: search.trim(),
                department: department ?? "DEFAULT",
                type: type ?? "DEFAULT",
                status: status ?? "DEFAULT",
                startDate: date.startDate,
                endDate: date.endDate,
            });
        } catch (error) {
            ErrorHandler.handleClientError(error);
        }
    }

    const onSelectSearch = ({
        query,
        department,
        status,
        type,
        startDate,
        endDate
    }: SearchSelectDto) => {
        try {
            const date = convertDate(startDate, endDate);
            searchQueryMutation.mutate({
                ...filter,
                query,
                department: department ?? "DEFAULT",
                status: status ?? "DEFAULT",
                type: type ?? "DEFAULT",
                startDate: date.startDate,
                endDate: date.endDate,
            });
        } catch (error) {
            ErrorHandler.handleClientError(error);
        }
    }

    const onEdit = () => {
        return ["SUPER_ADMIN", "ADMIN", "EDITOR"].includes(myData.role ?? "VIEWER");
    }

    const canEdit = onEdit();

    // === Reset Filters ===
    const resetFilters = () => {
        refetch();
        setSearch("");
        setDepartment("DEFAULT");
        setStatus("DEFAULT");
        setStartDate(undefined);
        setEndDate(undefined);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl! font-bold">Career Management</h1>
                    <p className="text-muted-foreground">Manage your career portfolio</p>
                </div>
                {
                    canEdit &&
                    <Link href={"/admin/management/career/add"}>
                        <Button variant={"default"} className="cursor-pointer">+ Add Career</Button>
                    </Link>
                }
            </div>

            {/* === Filters Card === */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                    <CardDescription>Refine your career list</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                        {/* Search */}
                        <div className="relative">
                            <Search onClick={() => { }} className="absolute left-3 top-3 h-4 w-4 text-muted-foreground cursor-pointer" />
                            <Input
                                placeholder="Search by career..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onInput={e => {
                                    const value = (e.target as HTMLInputElement).value.toLowerCase()
                                    if (!value) {
                                        return;
                                    }
                                }}
                                className="pl-10"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") onSearch();
                                }}
                            />
                        </div>

                        {/* Department */}
                        <Select value={department} onValueChange={(c) => {
                            setDepartment(c as SearchQueryCareerDepartmentDto);
                            onSelectSearch({
                                query: search ?? '',
                                department: c as SearchQueryCareerDepartmentDto,
                                status: status ?? "DEFAULT",
                                type: type ?? "DEFAULT",
                                startDate,
                                endDate
                            });
                        }}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {SearchQueryCareerDepartmentArray.map((c, index) => (
                                    <SelectItem key={index} value={c}>{c === "DEFAULT" ? "All Department" : c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Status */}
                        <Select value={status} onValueChange={(s) => {
                            setStatus(s as SearchQueryCareerStatusDto);
                            onSelectSearch({
                                query: search ?? '',
                                department: department ?? "DEFAULT",
                                status: s as SearchQueryCareerStatusDto,
                                type: type ?? "DEFAULT",
                                startDate,
                                endDate
                            });
                        }}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {SearchQueryCareerStatusArray.map((s, index) => (
                                    <SelectItem key={index} value={s}>{s === "DEFAULT" ? "All Status" : s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Type */}
                        <Select value={type} onValueChange={(c) => {
                            setType(c as SearchQueryCareerTypeDto);
                            onSelectSearch({
                                query: search ?? '',
                                department: department ?? "DEFAULT",
                                status: status ?? "DEFAULT",
                                type: c as SearchQueryCareerTypeDto,
                                startDate,
                                endDate
                            });
                        }}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {SearchQueryCareerTypeArray.map((c, index) => (
                                    <SelectItem key={index} value={c}>{c === "DEFAULT" ? "All Type" : c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "justify-start text-left font-normal",
                                        !startDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? GlobalHelper.formatDate(startDate) : "Start Date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={start => {
                                        setStartDate(start);
                                        onSelectSearch({
                                            query: search ?? '',
                                            department: department ?? "DEFAULT",
                                            status: status ?? "DEFAULT",
                                            type: type ?? "DEFAULT",
                                            startDate: start,
                                            endDate
                                        });
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "justify-start text-left font-normal",
                                        !endDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate ? GlobalHelper.formatDate(endDate) : "End Date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={end => {
                                        setEndDate(end);
                                        onSelectSearch({
                                            query: search ?? '',
                                            department: department ?? "DEFAULT",
                                            status: status ?? "DEFAULT",
                                            type: type ?? "DEFAULT",
                                            startDate,
                                            endDate: end
                                        });
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button onClick={refetch} disabled={isRefetching} className="cursor-pointer">
                            <RotateCw className={cn("mr-2 h-4 w-4", isRefetching && "animate-spin")} />
                            Refresh
                        </Button>
                        <Button variant="outline" onClick={resetFilters} className="cursor-pointer">
                            Reset Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* === Users Table === */}
            <Card>
                <CardContent>
                    {
                        (isLoading || searchQueryMutation.isLoading) ? (
                            <LoadingListComponent />
                        ) :
                            <>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Id</TableHead>
                                                <TableHead>Title</TableHead>
                                                <TableHead>Department</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>CreatedAt</TableHead>
                                                <TableHead>Options</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {
                                                careers?.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                                                            No careers found
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    careers && careers.map((careerItem, index) => {
                                                        return <TableCareerItemComponent key={index} careerItem={careerItem} index={index} filter={filter} refetch={refetch} myData={myData} setOpen={setOpen} />
                                                    })
                                                )
                                            }
                                        </TableBody>
                                    </Table>
                                </div>
                                {
                                    careers.length > 0 && paginationFilter.totalPage > 1 && <PaginationComponent data={careers} filter={filter} setFilter={setFilter} pagination={paginationFilter} handleFetchData={refetch} />
                                }
                            </>
                    }
                </CardContent>
            </Card>
        </div>
    )
}

export default CareerManagePage;
