'use client';

import React, { useEffect, useState } from 'react';
import {
    TableCell,
    TableRow,
} from "@workspace/ui/components/table";
import { Badge } from '@workspace/ui/components/badge';
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
import { FilterDto, ServerResponseDto, MyDataDto, StaffRoleDto } from '@/admin/packages/types/constants';
import toast from 'react-hot-toast';
import trpc from '@/app/trpc/client';
import TableIdComponent from '@/components/tableId';
import Link from 'next/link';
import { FaqSchema } from '@/admin/packages/schema/faq';
import { TranslationFaqDto } from '@/admin/packages/types/faq';

interface ItemDto {
    faqItem: FaqSchema;
    index: number;
    filter: FilterDto;
    myData: MyDataDto;
    refetch: () => void;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

// Helper: Get initials
const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

function TableFaqItemComponent({ faqItem, index, filter, myData, refetch, setOpen }: ItemDto) {

    const [openDelete, setOpenDelete] = useState(false);
    const [myRole, setMyRole] = useState("VIEWER" as StaffRoleDto);
    const [translations, setTranslations] = useState({} as TranslationFaqDto);

    useEffect(() => {
        if (faqItem && myData) {
            setMyRole(myData.role);
            const translation = faqItem?.translationFaq?.find(tr => tr.local === "en");
            if (translation) {
                setTranslations(translation);
            }
        }
    }, [faqItem, myData]);

    // Mutations
    const onSuccess = (data: ServerResponseDto) => {
        if (data?.success) {
            refetch();
            setOpenDelete(false);
            toast.success(data.message);
        }
    };

    const onError = (error: Error) => toast.error(error.message);

    const removeStaffByIdMutation = trpc.app.admin.manage.faq.removeOneById.useMutation({
        onSuccess,
        onError,
    });

    const handleDelete = () => {
        removeStaffByIdMutation.mutate({
            faqId: faqItem.id,
            removeByStaffId: myData.id,
        });
    };

    const canDelete = ["SUPER_ADMIN", "ADMIN"].includes(myRole);
    const canEdit = !(["VIEWER"].includes(myRole));
    const canInteract = canDelete || canEdit;

    return (
        <>
            <TableRow key={faqItem.id} className="w-auto">

                {/* Row number */}
                <TableCell>
                    <Badge variant="outline" className="capitalize">
                        <TableIdComponent filter={filter} index={index} />
                    </Badge>
                </TableCell>

                {/* User info */}
                <TableCell>
                    <div className="flex items-center gap-3">
                        <div className='flex items-center gap-1'>
                            <div
                                className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium ${index % 2 === 0 ? 'bg-muted' : 'bg-purple-600/50'
                                    }`}
                            >
                                {getInitials(translations.question ?? '')}
                            </div>
                            &
                            <div
                                className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium ${index % 2 === 0 ? 'bg-muted' : 'bg-purple-600/50'
                                    }`}
                            >
                                {getInitials(translations.answer ?? '')}
                            </div>

                        </div>
                        <div>
                            <p className="font-medium truncate w-md">{translations?.question ?? ''}</p>
                            <p className="font-medium truncate w-md">{translations?.answer ?? ''}</p>
                        </div>
                    </div>
                </TableCell>

                {/* Role */}
                <TableCell>
                    <Badge variant="outline" className="capitalize">
                        {faqItem.category}
                    </Badge>
                </TableCell>

                {/* Status */}
                <TableCell>
                    <Badge
                        variant={"default"}
                        className="capitalize"
                    >
                        {faqItem.status}
                    </Badge>
                </TableCell>

                {/* Created date */}
                <TableCell className="text-muted-foreground">
                    {GlobalHelper.formatDate(faqItem.createdAt as Date)}
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
                                {canEdit && <>
                                    <Link href={`/admin/management/faq/edit?id=${faqItem.id}`}>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setOpen(true);
                                            }}
                                            className="text-sky-500 hover:text-sky-600! cursor-pointer"
                                        >
                                            <Edit className="mr-2 h-4 w-4 text-sky-500" />
                                            Edit
                                        </DropdownMenuItem>
                                    </Link>
                                </>}
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
                            Are you sure you want to delete this faq?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. It will permanently remove{' '}
                            <span className="font-medium text-red-600 truncate w-sm">{translations?.question ?? ''}</span> from
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

export default TableFaqItemComponent;
