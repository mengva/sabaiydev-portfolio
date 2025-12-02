'use client';

import React, { useState } from 'react';
import {
    TableCell,
    TableRow,
} from "@workspace/ui/components/table";
import { Badge } from '@workspace/ui/components/badge';
import { StaffSchema } from '@/admin/packages/schema/staff';
import GlobalHelper from '@/admin/packages/utils/globalHelper';
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
import { FilterDto, ServerResponseDto, MyDataDto } from '@/admin/packages/types/constants';
import toast from 'react-hot-toast';
import trpc from '@/app/trpc/client';
import { CheckedRolePermissions } from '@/admin/packages/utils/constants';
import TableIdComponent from '@/components/tableId';

interface ItemDto {
    user: StaffSchema;
    index: number;
    filter: FilterDto;
    myData: MyDataDto;
    refetch: () => void;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setEditById: React.Dispatch<React.SetStateAction<string>>;
}

// Helper: Get initials
const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase();


function TableUserItemComponent({ user, index, filter, myData, refetch, setOpen, setEditById }: ItemDto) {

    const [openDelete, setOpenDelete] = useState(false);

    // Mutations
    const onSuccess = (data: ServerResponseDto) => {
        if (data?.success) {
            refetch();
            setOpenDelete(false);
            toast.success(data.message);
        }
    };

    const onError = (error: Error) => toast.error(error.message);

    const removeStaffByIdMutation = trpc.app.admin.manage.staff.removeOneById.useMutation({
        onSuccess,
        onError,
    });

    const handleDelete = () => {
        removeStaffByIdMutation.mutate({
            targetStaffId: user.id,
            removeByStaffId: myData.id,
        });
    };

    // ----------- PERMISSION CHECKERS (clean version) -----------
    const isMe = user.id === myData.id;

    const validRolePer = CheckedRolePermissions[myData.role]?.includes(user.role);

    const canDelete = !isMe && validRolePer;

    const canEdit = isMe || validRolePer;

    const canInteract = canDelete || canEdit;

    return (
        <>
            <TableRow key={user.id} className="w-auto">

                {/* Row number */}
                <TableCell>
                    <Badge variant="outline" className="capitalize">
                        <TableIdComponent filter={filter} index={index} />
                    </Badge>
                </TableCell>

                {/* User info */}
                <TableCell>
                    <div className="flex items-center gap-3">
                        <div
                            className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium ${index % 2 === 0 ? 'bg-muted' : 'bg-[#8e51ff]/50'}`}
                        >
                            {getInitials(user.fullName)}
                        </div>

                        <div>
                            <p className="font-medium">{user.fullName}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>

                        {isMe && <Badge variant="default">Me</Badge>}
                    </div>
                </TableCell>

                {/* Role */}
                <TableCell>
                    <Badge variant="outline" className="capitalize">
                        {user.role}
                    </Badge>
                </TableCell>

                {/* Status */}
                <TableCell>
                    <Badge
                        variant={user.status === 'ACTIVE' ? 'default' : 'destructive'}
                        className="capitalize"
                    >
                        {user.status}
                    </Badge>
                </TableCell>

                {/* Permissions */}
                <TableCell>
                    <div className="flex gap-1">
                        {user.permissions.map((p, i) => (
                            <Badge key={i} variant="secondary" className="text-xs capitalize">
                                {p}
                            </Badge>
                        ))}
                    </div>
                </TableCell>

                {/* Created date */}
                <TableCell className="text-muted-foreground">
                    {GlobalHelper.formatDate(user.createdAt as Date)}
                </TableCell>

                {/* ACTION DROPDOWN */}
                <TableCell className="text-muted-foreground">
                    {canInteract ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                                {/* DELETE */}
                                {canDelete && (
                                    <DropdownMenuItem
                                        onClick={() => setOpenDelete(true)}
                                        className="text-red-500 hover:text-red-600! cursor-pointer"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                                        Delete
                                    </DropdownMenuItem>
                                )}

                                {/* EDIT */}
                                {canEdit && (
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setOpen(true);
                                            setEditById(user.id);
                                        }}
                                        className="text-sky-500 hover:text-sky-600! cursor-pointer"
                                    >
                                        <Edit className="mr-2 h-4 w-4 text-sky-500" />
                                        Edit
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 cursor-not-allowed opacity-60"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    )}
                </TableCell>
            </TableRow>

            {/* CONFIRM DELETE MODAL */}
            <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl!">
                            Are you sure you want to delete this user?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. It will permanently remove{' '}
                            <span className="font-medium text-red-600">{user.fullName}</span> from
                            the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">
                            Cancel
                        </AlertDialogCancel>
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
