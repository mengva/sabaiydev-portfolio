"use client";

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
import { CalendarIcon, Search, RotateCw } from "lucide-react";
import trpc from "@/app/trpc/client";
import { StaffSchema } from "@/admin/packages/schema/staff";
import LoadingUserComponent from "./components/loading";
import TableUserItemComponent from "./components/tableUserItem";
import { PaginationFilterDto, SearchQueryStaffRoleDto, SearchQueryStaffStatusDto, ServerResponseDto } from "@/admin/packages/types/constants";
import { SearchQueryStaffRoleArray, SearchQueryStaffStatusArray } from "@/admin/packages/utils/constants/staff";
import AddUserDialogComponent from "./components/addUserDialog";
import { MyDataContext } from "../../layout";
import toast from "react-hot-toast";
import { ErrorHandler } from "@/admin/packages/utils/HandleError";
import GlobalHelper from "@/admin/packages/utils/GlobalHelper";
import { PaginationComponent } from "@/components/pagination";

interface SearchSelectDto {
    query: string;
    role: SearchQueryStaffRoleDto,
    status: SearchQueryStaffStatusDto,
    startDate: Date | undefined;
    endDate: Date | undefined;
}

export default function UserManagementPage() {
    const myDataContext = useContext(MyDataContext);
    if (!myDataContext) return null;
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
    const [role, setRole] = useState<SearchQueryStaffRoleDto>("DEFAULT");
    const [status, setStatus] = useState<SearchQueryStaffStatusDto>("DEFAULT");
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [users, setUsers] = useState([] as StaffSchema[]);
    const [editById, setEditById] = useState('');

    // === tRPC Query ===
    const {
        data: response,
        isLoading,
        refetch,
        isRefetching,
    } = trpc.app.admin.manage.staff.list.useQuery(filter, {
        refetchOnWindowFocus: false,
        keepPreviousData: true, // smooth page transition
    });

    useEffect(() => {
        if (response) {
            const result = response?.data;
            const staffs: StaffSchema[] = result?.data ?? []; // the array
            const pagination: PaginationFilterDto = result?.pagination; // pagination info
            setUsers(staffs);
            setPaginationFilter(pagination);
        }
    }, [response]);

    const searchQueryMutation = trpc.app.admin.manage.staff.searchQuery.useMutation({
        onSuccess: (data: ServerResponseDto) => {
            if (data && data.success) {
                const result = data?.data;
                const searchQueryPagination = result?.pagination;
                const searchQueryData = result?.data;
                if (searchQueryData && searchQueryPagination) {
                    setUsers([...searchQueryData]);
                    setPaginationFilter(searchQueryPagination);
                }
            }
        },
        onError: (error: Error) => {
            toast.error(error.message);
        }
    });

    const convertDate = (startDate: Date | undefined, endDate: Date | undefined) => {
        const start = startDate ? GlobalHelper.formatDate(startDate) : '';
        const end = endDate ? GlobalHelper.formatDate(endDate) : '';
        return {
            startDate: start,
            endDate: end
        }
    }

    const onSearch = () => {
        try {
            const date = convertDate(startDate, endDate);
            searchQueryMutation.mutate({
                ...filter,
                query: search.trim() ?? '',
                role: role ?? "DEFAULT",
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
        role,
        status,
        startDate,
        endDate
    }: SearchSelectDto) => {
        try {
            const date = convertDate(startDate, endDate);
            searchQueryMutation.mutate({
                ...filter,
                query,
                role: role ?? "DEFAULT",
                status: status ?? "DEFAULT",
                startDate: date.startDate,
                endDate: date.endDate,
            });
        } catch (error) {
            ErrorHandler.handleClientError(error);
        }
    }

    // === Reset Filters ===
    const resetFilters = () => {
        refetch();
        setSearch("");
        setRole("DEFAULT");
        setStatus("DEFAULT");
        setStartDate(undefined);
        setEndDate(undefined);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="!text-3xl font-bold">User Management</h1>
                    <p className="text-muted-foreground">Manage users, roles, and permissions</p>
                </div>
                <div>
                    <AddUserDialogComponent open={open} setOpen={setOpen} refetch={refetch} setEditById={setEditById} editById={editById} myData={myDataContext.data} refetchMyData={myDataContext.refetch} />
                </div>
            </div>

            {/* === Filters Card === */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                    <CardDescription>Refine your user list</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        {/* Search */}
                        <div className="relative">
                            <Search onClick={() => onSearch()} className="absolute left-3 top-3 h-4 w-4 text-muted-foreground cursor-pointer" />
                            <Input
                                placeholder="Search by fullName or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value.trim())}
                                onInput={e => {
                                    const value = (e.target as HTMLInputElement).value.toLowerCase()
                                    if (!value) {
                                        refetch();
                                        return;
                                    }
                                }}
                                className="pl-10"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") onSearch();
                                }}
                            />
                        </div>

                        {/* Role */}
                        <Select value={role} onValueChange={r => {
                            setRole(r as SearchQueryStaffRoleDto);
                            onSelectSearch({
                                query: search ?? '',
                                role: r as SearchQueryStaffRoleDto,
                                status: status ?? "DEFAULT",
                                startDate,
                                endDate
                            });
                        }}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                {
                                    SearchQueryStaffRoleArray.map((s, index) => (
                                        <SelectItem key={index} value={s}>{s === "DEFAULT" ? "All Role" : s}</SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>

                        {/* Status */}
                        <Select value={status} onValueChange={(s) => {
                            setStatus(s as SearchQueryStaffStatusDto);
                            onSelectSearch({
                                query: search ?? '',
                                role: role ?? "DEFAULT",
                                status: s as SearchQueryStaffStatusDto,
                                startDate,
                                endDate
                            });
                        }}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {SearchQueryStaffStatusArray.map((s, index) => (
                                    <SelectItem key={index} value={s}>{s === "DEFAULT" ? "All Status" : s}</SelectItem>
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
                                            role: role ?? "DEFAULT",
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
                                            role: role ?? "DEFAULT",
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
                            <LoadingUserComponent />
                        ) :
                            <>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Id</TableHead>
                                                <TableHead>FullName</TableHead>
                                                <TableHead>Role</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Permissions</TableHead>
                                                <TableHead>CreatedAt</TableHead>
                                                <TableHead>Options</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {
                                                users?.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                                                            No users found
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    users && users.map((user, index) => {
                                                        return <TableUserItemComponent key={index} user={user} index={index} filter={filter} refetch={refetch} myData={myDataContext.data} setOpen={setOpen} setEditById={setEditById} />
                                                    })
                                                )
                                            }
                                        </TableBody>
                                    </Table>
                                </div>
                                {
                                    users.length > 0 && paginationFilter.totalPage > 1 && <PaginationComponent data={users} filter={filter} setFilter={setFilter} pagination={paginationFilter} handleFetchData={refetch} />
                                }
                            </>
                    }
                </CardContent>
            </Card>
        </div>
    );
}
