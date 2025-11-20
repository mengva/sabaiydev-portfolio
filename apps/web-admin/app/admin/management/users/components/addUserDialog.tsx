import { StaffSchema } from '@/admin/packages/schema/staff';
import { ServerResponseDto, StaffPermissionDto, StaffRoleDto } from '@/admin/packages/types/constants';
import { RolePermissions } from '@/admin/packages/utils/constants';
import { StaffRoleArray, StaffStatusArray } from '@/admin/packages/utils/constants/auth';
import { zodValidateAddNewStaff, ZodValidateAddNewStaff } from '@/admin/packages/validations/staff';
import { StaffSessionContext } from '@/app/admin/layout';
import trpc from '@/app/trpc/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@workspace/ui/components/dialog';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { AlertCircle } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface AddUserDialogDto {
    open: boolean;
    refetch: () => void;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    editById: string;
    setEditById: React.Dispatch<React.SetStateAction<string>>;
}

function AddUserDialogComponent({
    open, setOpen, refetch, editById, setEditById
}: AddUserDialogDto) {

    const staffSessionContext = useContext(StaffSessionContext);
    if (!staffSessionContext) return null;

    const [permissions, setPermissions] = useState(['READ'] as StaffPermissionDto[]);
    const [showConfirmClose, setShowConfirmClose] = useState(false);
    const isNotViewer = staffSessionContext.data && staffSessionContext.data.role !== "VIEWER";
    const [editUser, setEditUser] = useState({} as StaffSchema);

    const form = useForm<ZodValidateAddNewStaff>({
        resolver: zodResolver(zodValidateAddNewStaff),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            role: "VIEWER",
            status: "ACTIVE",
            permissions: ["READ"],
        },
    });

    const formValueKeys = ['fullName', 'email', 'password'] as const;

    const hasUnsavedChanges = () => {
        return formValueKeys.some(key => {
            const value = form.getValues(key);
            const isEdit = !isEditFullNameAndEmail() && !isEditRoleStatusAndPermissions();
            return value !== "" && isEdit;
        });
    };

    const onResetForm = () => {
        setEditById("");
        setEditUser({} as StaffSchema);
        form.reset({
            fullName: "",
            email: "",
            password: "",
            role: "VIEWER",
            status: "ACTIVE",
            permissions: ["READ"],
        });
    }

    // Handle dialog close attempt
    const handleClose = () => {
        if (hasUnsavedChanges()) {
            setShowConfirmClose(true);
        } else {
            setOpen(false);
            onResetForm();
        }
    };

    // Confirm close (user clicks "Yes, discard")
    const confirmClose = () => {
        setOpen(false);
        setShowConfirmClose(false);
        onResetForm();
    };

    // Cancel close (stay in dialog)
    const cancelClose = () => {
        setShowConfirmClose(false);
        onResetForm();
    };

    const onChangeRole = (value: StaffRoleDto) => {
        form.setValue("role", value as StaffRoleDto);
        if (value === "SUPER_ADMIN") {
            setPermissions(RolePermissions.SUPER_ADMIN)
        } else if (value === "ADMIN") {
            setPermissions(RolePermissions.ADMIN);
        } else if (value === "EDITOR") {
            setPermissions(RolePermissions.EDITOR);
        } else setPermissions(RolePermissions.VIEWER);
    }

    const getUserOneQuery = trpc.app.admin.manage.staff.getOne.useQuery(
        { staffId: editById },
        {
            enabled: !!editById && open, // fetch only when true
            refetchOnWindowFocus: false,
            keepPreviousData: true,
        }
    );

    // 2. When loaded → reset form
    useEffect(() => {
        const user = getUserOneQuery?.data?.data;

        if (user) {
            // save for later (optional)
            setEditUser(user);
            // reset the form with fetched values
            onChangeRole(user.role);
            form.reset({
                fullName: user.fullName ?? "",
                email: user.email ?? "",
                password: "",              // usually kept empty
                role: user.role ?? "VIEWER",
                status: user.status ?? "ACTIVE",
                permissions: user.permissions ?? ["READ"],
            });
        }
    }, [getUserOneQuery.data]);

    const isEditFullNameAndEmail = () => {

        // if editUser empty can add new user
        if (!editUser || !editUser?.id || !editById) {
            return true;
        }

        const myUser = staffSessionContext.data;
        const isEditMe = myUser.id === editUser.id;

        // it's me can edit my fullName and email
        if (isEditMe) {
            return true;
        }

        // can't edit other user fullName and email
        return false;
    }

    const isEditRoleStatusAndPermissions = () => {

        // if editUser empty can add new user
        if (!editUser || !editUser?.id || !editById) {
            return true;
        }

        const myUser = staffSessionContext.data;
        const isEditMe = myUser.id === editUser.id;

        // it's me can edit my role, status and permissions
        if (isEditMe && myUser.role === "SUPER_ADMIN") {
            return true;
        }

        if (["VIEWER", "EDITOR", "ADMIN"].includes(editUser.role) && !isEditMe) {
            return true;
        }

        // can't edit other user role, status and permissions
        return false;
    }

    const addOneUserMutation = trpc.app.admin.manage.staff.addOne.useMutation({
        onSuccess: (data: ServerResponseDto) => {
            setOpen(false);
            toast.success(data.message);
            onResetForm();
            refetch(); // refresh list
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const onSubmit = (data: ZodValidateAddNewStaff) => {
        if (data) {
            addOneUserMutation.mutate(data);
        }
    };

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
                        isEditFullNameAndEmail() &&
                        <>
                            <div>
                                <Label htmlFor="fullName" className='mb-2'>Full Name</Label>
                                <Input
                                    id="fullName"
                                    placeholder="John Doe"
                                    {...form.register("fullName")}
                                    className={form.formState.errors.fullName ? "border-destructive" : ""}
                                />
                                {form.formState.errors.fullName && (
                                    <p className="text-sm text-destructive mt-1">{form.formState.errors.fullName.message}</p>
                                )}
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
                        isEditRoleStatusAndPermissions() &&
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
                                            StaffRoleArray.map((s, index) => (
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
                                            <label htmlFor={perm.toLowerCase()} className="text-sm font-medium capitalize cursor-pointer">
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
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={addOneUserMutation.isPending} className='cursor-pointer'>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={addOneUserMutation.isPending} className='cursor-pointer'>
                            {
                                editById && open ? (false ? "Editing..." : "Edit User") : (addOneUserMutation.isPending ? "Adding..." : "Add User")
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

export default AddUserDialogComponent
