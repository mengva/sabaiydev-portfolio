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
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Label } from "@workspace/ui/components/label";
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
import { PaginationFilterDto, SearchQueryStaffPermissionDto, SearchQueryStaffRoleDto, SearchQueryStaffStatusDto, ServerResponseDto } from "@/admin/packages/types/constants";
import { SearchQueryStaffPermissionArray, SearchQueryStaffRoleArray, SearchQueryStaffStatusArray } from "@/admin/packages/utils/constants/staff";
import AddUserDialogComponent from "./components/addUserDialog";
import { StaffSessionContext } from "../../layout";
import toast from "react-hot-toast";
import { ErrorHandler } from "@/admin/packages/utils/HandleError";
import GlobalHelper from "@/admin/packages/utils/GlobalHelper";

export default function UserManagementPage() {
    const staffSessionContext = useContext(StaffSessionContext);
    if (!staffSessionContext) return <div></div>;
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
    const [permissions, setPermissions] = useState<SearchQueryStaffPermissionDto[]>([]);
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [users, setUsers] = useState([] as StaffSchema[]);

    // === tRPC Query ===
    const {
        data: response,
        isLoading,
        refetch,
        isRefetching,
    } = trpc.app.admin.staff.list.useQuery(filter, {
        refetchOnWindowFocus: false,
        keepPreviousData: true, // smooth page transition
    });

    useEffect(() => {
        if (response) {
            const staffs: StaffSchema[] = response?.data?.data ?? []; // the array
            const pagination: PaginationFilterDto = response?.pagination; // pagination info
            setUsers(staffs);
            setPaginationFilter(pagination);
        }
    }, [response]);

    const searchStaffMutation = trpc.app.admin.staff.searchStaff.useMutation({
        onSuccess: (data: ServerResponseDto) => {
            if (data && data.success) {
                toast.success(data.message);
            }
        },
        onError: (error: Error) => {
            toast.error(error.message);
        }
    });

    const onSearch = () => {
        try {
            const start = startDate ? GlobalHelper.formatDate(startDate) : '';
            const end = endDate ? GlobalHelper.formatDate(endDate) : '';
            searchStaffMutation.mutate({
                ...filter,
                query: search.trim() ?? '',
                role: role ?? "DEFAULT",
                status: status ?? "DEFAULT",
                permissions: permissions ?? ["DEFAULT"],
                startDate: start,
                endDate: end,
            });
            const searchData = searchStaffMutation?.data?.data?.data;
            if (searchData) {
                setUsers([...searchData]);
            }
        } catch (error) {
            ErrorHandler.handleClientError(error);
        }
    }

    // === Reset Filters ===
    const resetFilters = () => {
        setSearch("");
        setRole("DEFAULT");
        setStatus("DEFAULT");
        setPermissions([]);
        setStartDate(undefined);
        setEndDate(undefined);
    };

    // === Permission Toggle ===
    const togglePermission = (perm: SearchQueryStaffPermissionDto) => {
        setPermissions((prev) =>
            prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="!text-3xl font-bold">User Management</h1>
                    <p className="text-muted-foreground">Manage users, roles, and permissions</p>
                </div>
                <div>
                    <AddUserDialogComponent open={open} setOpen={setOpen} refetch={refetch} />
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
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by fullName or email..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value.trim())
                                }}
                                onInput={e => {
                                    const value = (e.target as HTMLInputElement).value.toLowerCase()
                                    if (!value) {
                                        refetch();
                                        return;
                                    }
                                }}
                                className="pl-10"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        onSearch();
                                    }
                                }}
                            />
                        </div>

                        {/* Role */}
                        <Select value={role} onValueChange={(v) => setRole(v as SearchQueryStaffRoleDto)}>
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
                        <Select value={status} onValueChange={(v) => setStatus(v as SearchQueryStaffStatusDto)}>
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
                                    {startDate ? format(startDate, "PPP") : "Start Date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={setStartDate}
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
                                    {endDate ? format(endDate, "PPP") : "End Date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={setEndDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Permissions */}
                    <div className="space-y-2">
                        <Label>Permissions</Label>
                        <div className="flex flex-wrap gap-4">
                            {(SearchQueryStaffPermissionArray).map((perm) => (
                                <div key={perm} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={perm}
                                        checked={permissions.includes(perm)}
                                        onCheckedChange={() => togglePermission(perm)}
                                    />
                                    <label
                                        htmlFor={perm}
                                        className="text-sm font-medium capitalize cursor-pointer"
                                    >
                                        {perm}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button onClick={refetch} disabled={isRefetching} className="cursor-pointer">
                            <RotateCw className={cn("mr-2 h-4 w-4", isRefetching && "animate-spin")} />
                            {isRefetching ? "Loading..." : "Refresh"}
                        </Button>
                        <Button variant="outline" onClick={resetFilters} className="cursor-pointer">
                            Reset Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* === Users Table === */}
            <Card>
                <CardHeader>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>
                        {isLoading ? "Loading..." : `${users.length} users found`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <LoadingUserComponent />
                    ) : (
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
                                    {users?.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center text-muted-foreground">
                                                No users found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        users && users.map((user, index) => {
                                            return <TableUserItemComponent key={index} user={user} index={index} filter={filter} refetch={refetch} data={staffSessionContext.data} />
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
