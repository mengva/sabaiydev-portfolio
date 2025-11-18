'use client';

import React, { useContext, useState } from 'react';
import {
    TableCell,
    TableRow,
} from "@workspace/ui/components/table";
import { Badge } from '@workspace/ui/components/badge';
import { StaffSchema } from '@/admin/packages/schema/staff';
import GlobalHelper from '@/admin/packages/utils/GlobalHelper';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Button } from '@workspace/ui/components/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { FilterDto, ServerResponseDto, StaffSessionDto } from '@/admin/packages/types/constants';
import toast from 'react-hot-toast';
import trpc from '@/app/trpc/client';
import { StaffSessionContext } from '@/app/admin/layout';

interface ItemDto {
    user: StaffSchema;
    index: number;
    filter: FilterDto;
    data: StaffSessionDto;
    refetch: () => void;
}

function TableUserItemComponent({ user, index, filter, data, refetch }: ItemDto) {
    const staffSessionContext = useContext(StaffSessionContext);
    if (!staffSessionContext) return <div></div>;
    const myData = staffSessionContext.data;
    const [openDelete, setOpenDelete] = useState(false);

    const onSuccess = (data: ServerResponseDto) => {
        if (data && data.success) {
            refetch();
            setOpenDelete(false);
            toast.success(data.message);
        }
    }

    const onError = (error: Error) => {
        toast.error(error.message);
    }

    const removeStaffByIdMutation = trpc.app.admin.staff.removeStaffById.useMutation({ onSuccess, onError });

    const handleDelete = async () => {
        removeStaffByIdMutation.mutate({ targetStaffId: user.id, removeByStaffId: myData.id });
    };

    const isDeleted = () => {
        // can't delete my account
        const isMe = user.id === myData.id;
        if (isMe) {
            return false;
        }
        // "SUPER_ADMIN" can't delete "SUPER_ADMIN"
        if (myData.role === "SUPER_ADMIN" && ["SUPER_ADMIN"].includes(user.role)) {
            return false;
        }
        // "ADMIN" can't delete "ADMIN"
        if (myData.role === "ADMIN" && ["ADMIN"].includes(user.role)) {
            return false;
        }
        // VIEWER AND EDITOR can't delete other account
        if (["VIEWER", "EDITOR"].includes(myData.role)) {
            return false;
        }
        return true;
    }

    const isEdited = () => {
        const isMe = user.id === myData.id;
        // "SUPER_ADMIN" can't edit "SUPER_ADMIN"
        if (myData.role === "SUPER_ADMIN" && ["SUPER_ADMIN"].includes(user.role) && !isMe) {
            return false;
        }
        // "ADMIN" can't edit "ADMIN"
        if (myData.role === "ADMIN" && ["ADMIN"].includes(user.role) && !isMe) {
            return false;
        }
        // VIEWER AND EDITOR can't edit other account
        if (["EDITOR"].includes(myData.role) && !isMe) {
            return false;
        }
        if (myData.role === "VIEWER") {
            return false;
        }
        return true;
    }

    return (
        <>
            <TableRow key={user.id} className="w-auto">
                <TableCell>
                    <Badge variant="outline" className="capitalize">
                        {(
                            filter.page > 1
                                ? filter.limit * (filter.page === 2 ? 1 : filter.page - 1) + index + 1
                                : index + 1
                        )
                            .toString()
                            .padStart(4, '0')}
                    </Badge>
                </TableCell>

                <TableCell>
                    <div className="flex items-center gap-3">
                        <div
                            className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium ${index % 2 === 0 ? 'bg-muted' : 'bg-green-600/50'
                                }`}
                        >
                            {user.fullName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()}
                        </div>
                        <div>
                            <p className="font-medium">{user.fullName}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        {
                            data.id === user.id &&
                            <Badge variant={"default"}>Me</Badge>
                        }
                    </div>
                </TableCell>

                <TableCell>
                    <Badge variant="outline" className="capitalize">
                        {user.role}
                    </Badge>
                </TableCell>

                <TableCell>
                    <Badge
                        variant={user.status === 'ACTIVE' ? 'default' : 'destructive'}
                        className="capitalize"
                    >
                        {user.status}
                    </Badge>
                </TableCell>

                <TableCell>
                    <div className="flex gap-1">
                        {user.permissions.map((p, i) => (
                            <Badge key={i} variant="secondary" className="text-xs capitalize">
                                {p}
                            </Badge>
                        ))}
                    </div>
                </TableCell>

                <TableCell className="text-muted-foreground">
                    {GlobalHelper.formatDate(user.createdAt as Date)}
                </TableCell>

                <TableCell className="text-muted-foreground">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                            {/* ---------- DELETE ---------- */}
                            {
                                isDeleted() &&
                                <DropdownMenuItem
                                    className="text-red-500 hover:!text-red-600 cursor-pointer"
                                    onSelect={(e) => {
                                        e.preventDefault(); // prevent menu from closing
                                        setOpenDelete(true);
                                    }}
                                >
                                    <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                                    Delete
                                </DropdownMenuItem>
                            }

                            {/* ---------- EDIT ---------- */}
                            {
                                isEdited() &&
                                <DropdownMenuItem className="text-sky-500 hover:!text-sky-600 cursor-pointer">
                                    <Edit className="mr-2 h-4 w-4 text-sky-500" />
                                    Edit
                                </DropdownMenuItem>
                            }
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
            </TableRow>

            {/* ==================== DELETE CONFIRM DIALOG ==================== */}
            <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className='!text-xl'>Are you sure you want to delete this user?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. It will permanently remove{' '}
                            <span className="font-medium text-red-600">{user.fullName}</span> from the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel className='cursor-pointer'>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 cursor-pointer"
                            onClick={handleDelete}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export default TableUserItemComponent;