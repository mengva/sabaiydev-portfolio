'use client'

import { useContext, useEffect, useState } from "react";
import { format } from "date-fns";
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
import ListLoadingComponent from "@/components/listLoading";
import TableNewsItemComponent from "./components/tableNewItem";
import { SearchQueryNewsCategoryDto, SearchQueryNewsStatusDto } from "@/admin/packages/types/news";
import { SearchQueryNewsCategoryArray, SearchQueryNewsStatusArray } from "@/admin/packages/utils/constants/variables/news";
import { NewsSchema } from "@/admin/packages/schema/news";

interface SearchSelectDto {
    query: string;
    category: SearchQueryNewsCategoryDto,
    status: SearchQueryNewsStatusDto,
    startDate: Date | undefined;
    endDate: Date | undefined;
}

function NewManagePage() {
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
    const [category, setCategory] = useState<SearchQueryNewsCategoryDto>("DEFAULT");
    const [status, setStatus] = useState<SearchQueryNewsStatusDto>("DEFAULT");
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [news, setNews] = useState([] as NewsSchema[]);

    // === tRPC Query ===
    const {
        data: response,
        isLoading,
        refetch,
        isRefetching,
    } = trpc.app.admin.manage.news.list.useQuery(filter, {
        refetchOnWindowFocus: false,
        keepPreviousData: true, // smooth page transition
    });

    useEffect(() => {
        if (refetch) {
            refetch();
        }
    }, [refetch]);

    useEffect(() => {
        if (response) {
            const result = response?.data;
            const resultnews = result?.data ?? []; // the array
            const pagination: PaginationFilterDto = result?.pagination; // pagination info
            setNews(resultnews);
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

    const searchQueryMutation = trpc.app.admin.manage.news.searchQuery.useMutation({
        onSuccess: (data: ServerResponseDto) => {
            if (data && data.success) {
                const result = data?.data;
                const searchQueryPagination = result?.pagination;
                const searchQueryData = result?.data;
                if (searchQueryData && searchQueryPagination) {
                    setNews(searchQueryData);
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
                category: category ?? "DEFAULT",
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
        category,
        status,
        startDate,
        endDate
    }: SearchSelectDto) => {
        try {
            const date = convertDate(startDate, endDate);
            searchQueryMutation.mutate({
                ...filter,
                query,
                category: category ?? "DEFAULT",
                status: status ?? "DEFAULT",
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
        setCategory("DEFAULT");
        setStatus("DEFAULT");
        setStartDate(undefined);
        setEndDate(undefined);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl! font-bold">News Management</h1>
                    <p className="text-muted-foreground">Manage your news portfolio</p>
                </div>
                {
                    canEdit &&
                    <Link href={"/admin/management/news/add"}>
                        <Button variant={"default"} className="cursor-pointer">+ Add News</Button>
                    </Link>
                }
            </div>

            {/* === Filters Card === */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                    <CardDescription>Refine your news list</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        {/* Search */}
                        <div className="relative">
                            <Search onClick={() => { }} className="absolute left-3 top-3 h-4 w-4 text-muted-foreground cursor-pointer" />
                            <Input
                                placeholder="Search by title..."
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

                        {/* Status */}
                        <Select value={status} onValueChange={(s) => {
                            setStatus(s as SearchQueryNewsStatusDto);
                            onSelectSearch({
                                query: search ?? '',
                                category: category ?? "DEFAULT",
                                status: s as SearchQueryNewsStatusDto,
                                startDate,
                                endDate
                            });
                        }}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {SearchQueryNewsStatusArray.map((s, index) => (
                                    <SelectItem key={index} value={s}>{s === "DEFAULT" ? "All Status" : s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Category */}
                        <Select value={category} onValueChange={(c) => {
                            setCategory(c as SearchQueryNewsCategoryDto);
                            onSelectSearch({
                                query: search ?? '',
                                category: c as SearchQueryNewsCategoryDto,
                                status: status ?? "DEFAULT",
                                startDate,
                                endDate
                            });
                        }}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {SearchQueryNewsCategoryArray.map((c, index) => (
                                    <SelectItem key={index} value={c}>{c === "DEFAULT" ? "All Category" : c}</SelectItem>
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
                                            category: category ?? "DEFAULT",
                                            status: status ?? "DEFAULT",
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
                                            category: category ?? "DEFAULT",
                                            status: status ?? "DEFAULT",
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
                            <ListLoadingComponent />
                        ) :
                            <>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Id</TableHead>
                                                <TableHead>Title</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>CreatedAt</TableHead>
                                                <TableHead>Options</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {
                                                news?.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                                            No news found
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    news && news.map((newsItem, index) => {
                                                        return <TableNewsItemComponent key={index} newsItem={newsItem} index={index} filter={filter} refetch={refetch} myData={myData} setOpen={setOpen} />
                                                    })
                                                )
                                            }
                                        </TableBody>
                                    </Table>
                                </div>
                                {
                                    news.length > 0 && paginationFilter.totalPage > 1 && <PaginationComponent data={news} filter={filter} setFilter={setFilter} pagination={paginationFilter} handleFetchData={refetch} />
                                }
                            </>
                    }
                </CardContent>
            </Card>
        </div>
    )
}

export default NewManagePage
