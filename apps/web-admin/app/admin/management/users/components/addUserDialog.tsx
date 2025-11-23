import { StaffSchema } from '@/admin/packages/schema/staff';
import { ServerResponseDto, StaffPermissionDto, StaffRoleDto, MyDataDto } from '@/admin/packages/types/constants';
import { UserValidRolePermissions } from '@/admin/packages/utils/constants';
import { StaffRoleArray, StaffStatusArray } from '@/admin/packages/utils/constants/auth';
import { zodValidateAddNewStaff, ZodValidateAddNewStaff } from '@/admin/packages/validations/staff';
import trpc from '@/app/trpc/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@workspace/ui/components/dialog';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface AddUserDialogDto {
    open: boolean;
    refetch: () => void;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    editById: string;
    setEditById: React.Dispatch<React.SetStateAction<string>>;
    myData: MyDataDto;
    refetchMyData: () => void;
}

function AddUserDialogComponent({
    open, setOpen, refetch, editById, setEditById, myData, refetchMyData
}: AddUserDialogDto) {

    const router = useRouter();
    const [permissions, setPermissions] = useState(["READ"] as StaffPermissionDto[])
    const [showConfirmClose, setShowConfirmClose] = useState(false);
    const [editRoles, setEditRoles] = useState([] as StaffRoleDto[]);
    const isNotViewer = myData && myData.role !== "VIEWER";
    const form = useForm<ZodValidateAddNewStaff>({
        resolver: zodResolver(zodValidateAddNewStaff),
        defaultValues: {
            addByStaffId: myData.id,
            fullName: "",
            email: "",
            password: "",
            role: "VIEWER",
            status: "ACTIVE",
            permissions: ["READ"],
        },
    });

    const formValueKeys = ['fullName', 'email', 'password'] as const;

    // TRUE = editing existing user, FALSE = adding new user
    const isEditing = !!editById;

    const isEditMe = editById === myData.id;

    const onEditRoleStatusAndPermissions = () => {

        // if editUser empty can add new user
        if (!isEditing) {
            return true;
        }

        // it's me can edit my role, status and permissions
        if (isEditMe && ["SUPER_ADMIN", "ADMIN"].includes(myData.role)) {
            return true;
        }

        if (["VIEWER", "EDITOR", "ADMIN"].includes(form.getValues("role")) && !isEditMe) {
            return true;
        }

        // can't edit other user role, status and permissions
        return false;
    }

    // Who can edit what
    const canEditFullNameAndEmail = !isEditing || isEditMe;

    const canEditRoleStatusAndPermission = onEditRoleStatusAndPermissions()

    const hasUnsavedChanges = () => {
        return formValueKeys.some(key => {
            const value = form.getValues(key);
            const isEdit = canEditFullNameAndEmail && canEditRoleStatusAndPermission;
            return value && isEdit;
        });
    };

    const onResetForm = () => {
        setEditById("");
        form.reset({
            fullName: "",
            email: "",
            password: "",
            role: "VIEWER",
            status: "ACTIVE",
            permissions: ["READ"],
        });
    }

    const handleClose = () => {
        const hasUnsaved = hasUnsavedChanges();
        if (hasUnsaved) {
            setShowConfirmClose(true);
        } else {
            setOpen(false);
            onResetForm();
        }
    };

    const confirmClose = () => {
        setShowConfirmClose(false);
        setOpen(false);
        onResetForm();
    };

    const cancelClose = () => {
        setShowConfirmClose(false); // DO NOT reset form — keep editing
    };

    const onChangeRole = (value: StaffRoleDto) => {
        form.setValue("role", value as StaffRoleDto);
        const pers = UserValidRolePermissions;
        if (value === "SUPER_ADMIN") {
            form.setValue("permissions", pers.SUPER_ADMIN);
            setPermissions(pers.SUPER_ADMIN)
        } else if (value === "ADMIN") {
            setPermissions(pers.ADMIN)
            form.setValue("permissions", pers.ADMIN);
        } else if (value === "EDITOR") {
            setPermissions(pers.EDITOR)
            form.setValue("permissions", pers.EDITOR);
        } else {
            setPermissions(pers.VIEWER)
            form.setValue("permissions", pers.VIEWER);
        }
    }

    const getUserOneQuery = trpc.app.admin.manage.staff.getOne.useQuery(
        { staffId: editById },
        {
            enabled: !!editById && open, // fetch only when true
            refetchOnWindowFocus: false,
            keepPreviousData: false,
        }
    );

    useEffect(() => {
        if (editById) {
            refetchMyData();
            getUserOneQuery.refetch();
        }
    }, [editById]);

    useEffect(() => {
        const user = getUserOneQuery.data?.data as StaffSchema;
        const pers = UserValidRolePermissions.PERMISSIONS;
        if (user && editById) {
            if (user.role === "SUPER_ADMIN") {
                setEditRoles(pers)
            } else if (user.role === "ADMIN") {
                setEditRoles(pers.filter(per => per !== "SUPER_ADMIN"))
            } else if (user.role === "EDITOR") {
                setEditRoles(pers.filter(per => ["EDITOR", "VIEWER"].includes(per)))
            } else setEditRoles(pers.filter(per => per === "VIEWER"))

            const resetValues = {
                addByStaffId: myData.id,
                fullName: user.fullName ?? "",
                email: user.email ?? "",
                password: "Demo@1234",
                role: user.role ?? "VIEWER",
                status: user.status ?? "ACTIVE",
                permissions: user.permissions ?? ["READ"],
            } as ZodValidateAddNewStaff;

            onChangeRole(user.role);
            form.reset(resetValues);
        }
    }, [getUserOneQuery.data, editById]);

    const userMutation = {
        onSuccess: (data: ServerResponseDto) => {
            if (!isEditMe) {
                setOpen(false);
                toast.success(data.message);
                onResetForm();
                refetch(); // refresh list
            }
            const getStatus = form.getValues("status");
            if (getStatus === "INACTIVE") {
                return router.push("/auth/signin");
            }
            refetchMyData();
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    }

    const addOneUserMutation = trpc.app.admin.manage.staff.addOne.useMutation({ ...userMutation });

    const editOneUserMutation = trpc.app.admin.manage.staff.editById.useMutation({ ...userMutation });

    const editMyDataMutation = trpc.app.admin.manage.staff.editMyDataById.useMutation({ ...userMutation });

    const onSubmit = (data: ZodValidateAddNewStaff) => {
        if (!data) return;

        if (!editById) return addOneUserMutation.mutate(data);

        const editUserData = {
            role: data.role,
            status: data.status,
            permissions: data.permissions,
            updatedByStaffId: myData.id,
            targetStaffId: editById
        }

        // edit my account
        if (isEditMe) {
            return editMyDataMutation.mutate({
                email: data.email,
                ...editUserData
            });
        }
        // edit other account
        editOneUserMutation.mutate(editUserData);
    };

    const isLoadingEditUser = editOneUserMutation.isPending || editMyDataMutation.isPending;
    const isLoadingAddUser = addOneUserMutation.isPending;

    if (getUserOneQuery.isLoading) return null;

    return <>
        {/* === Add User Dialog === */}
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
            {
                isNotViewer &&
                <DialogTrigger asChild>
                    <div>
                        <Button type='button' variant="default" onClick={() => setOpen(true)} className="cursor-pointer">
                            + Add User
                        </Button>
                    </div>
                </DialogTrigger>
            }
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{editById ? 'Edit User' : 'Add New User'}</DialogTitle>
                    <DialogDescription>
                        {
                            editById ? 'Fill in the details below to edit a user account.' : 'Fill in the details below to add a new user account.'
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Full Name */}
                    {
                        canEditFullNameAndEmail &&
                        <>
                            <div>
                                <Label htmlFor="fullName" className='mb-2'>Full Name</Label>
                                <Input
                                    id="fullName"
                                    placeholder="John Doe"
                                    {...form.register("fullName")}
                                    className={form.formState.errors.fullName ? "border-destructive" : ""}
                                />
                                {
                                    form.formState.errors.fullName && (
                                        <p className="text-sm text-destructive mt-1">{form.formState.errors.fullName.message}</p>
                                    )
                                }
                            </div>

                            {/* Email */}
                            <div>
                                <Label htmlFor="email" className='mb-2'>Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    {...form.register("email")}
                                    className={form.formState.errors.email ? "border-destructive" : ""}
                                />
                                {form.formState.errors.email && (
                                    <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
                                )}
                            </div>
                        </>
                    }

                    {/* Password */}
                    {
                        !editById &&
                        <div>
                            <Label htmlFor="password" className='mb-2'>Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                {...form.register("password")}
                                className={form.formState.errors.password ? "border-destructive" : ""}
                            />
                            {form.formState.errors.password && (
                                <p className="text-sm text-destructive mt-1">{form.formState.errors.password.message}</p>
                            )}
                        </div>
                    }

                    {
                        canEditRoleStatusAndPermission &&
                        <>

                            {/* Role */}
                            <div>
                                <Label htmlFor="role" className='mb-2'>Role</Label>
                                <Select
                                    onValueChange={onChangeRole}
                                    defaultValue={form.getValues("role")}
                                >
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {
                                            (editById && open && isEditMe ? editRoles : StaffRoleArray).map((s, index) => (
                                                <SelectItem key={index} value={s}>{s}</SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status */}
                            <div>
                                <Label htmlFor="status" className='mb-2'>Status</Label>
                                <Select
                                    onValueChange={(value) => form.setValue("status", value as any)}
                                    defaultValue={form.getValues("status")}
                                >
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {
                                            StaffStatusArray.map((s, index) => (
                                                <SelectItem key={index} value={s}>{s}</SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Permissions */}
                            <div>
                                <Label className='mb-2'>Permissions</Label>
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                    {(permissions).map((perm) => (
                                        <div key={perm} className="flex items-center space-x-2">
                                            <Checkbox
                                                disabled
                                                id={perm.toLowerCase()}
                                                checked={form.watch("permissions").includes(perm as any)}
                                                onCheckedChange={(checked) => {
                                                    const current = form.getValues("permissions");
                                                    if (checked) {
                                                        form.setValue("permissions", [...current, perm] as any);
                                                    } else {
                                                        form.setValue("permissions", current.filter((p) => p !== perm) as any);
                                                    }
                                                }}
                                            />
                                            <label htmlFor={perm.toLowerCase()} className="text-sm font-medium capitalize">
                                                {perm}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                {form?.formState?.errors?.permissions && (
                                    <p className="text-sm text-destructive mt-1">{form?.formState?.errors?.permissions?.message}</p>
                                )}
                            </div>
                        </>
                    }

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoadingAddUser} className='cursor-pointer'>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoadingAddUser || isLoadingEditUser} className='cursor-pointer'>
                            {
                                editById && open ? (isLoadingEditUser ? "Editing..." : "Edit User") : (isLoadingAddUser ? "Adding..." : "Add User")
                            }
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >

        {/* Confirmation Dialog when trying to close with unsaved changes */}
        <Dialog open={showConfirmClose} onOpenChange={setShowConfirmClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        Discard changes?
                    </DialogTitle>
                    <DialogDescription>
                        You have unsaved changes. If you close this dialog, your changes will be lost.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={cancelClose} className='cursor-pointer'>
                        No, keep editing
                    </Button>
                    <Button variant="destructive" onClick={confirmClose} className='cursor-pointer'>
                        Yes, discard
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
}

export default AddUserDialogComponent;
