import { ServerResponseDto } from '@/admin/packages/types/constants';
import { StaffPermissionArray, StaffRoleArray, StaffStatusArray } from '@/admin/packages/utils/constants/auth';
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
import { useContext } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface AddUserDialogDto {
    open: boolean;
    refetch: () => void;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function AddUserDialogComponent({
    open, setOpen, refetch
}: AddUserDialogDto) {
    const staffSessionContext = useContext(StaffSessionContext);
    if (!staffSessionContext) return <div></div>;
    const isNotViewer = staffSessionContext.data && staffSessionContext.data.role !== "VIEWER";
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

    const addUserMutation = trpc.app.admin.staff.addNewStaff.useMutation({
        onSuccess: (data: ServerResponseDto) => {
            toast.success(data.message);
            setOpen(false);
            form.reset();
            refetch(); // refresh list
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const onSubmit = (data: ZodValidateAddNewStaff) => {
        if (data) {
            addUserMutation.mutate(data);
        }
    };
    return <>
        {/* === Add User Dialog === */}
        <Dialog open={open} onOpenChange={setOpen} >
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
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to add a new user account.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Full Name */}
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

                    {/* Password */}
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

                    {/* Role */}
                    <div>
                        <Label htmlFor="role" className='mb-2'>Role</Label>
                        <Select
                            onValueChange={(value) => form.setValue("role", value as any)}
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
                            {(StaffPermissionArray).map((perm) => (
                                <div key={perm} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={perm}
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
                                    <label htmlFor={perm} className="text-sm font-medium capitalize cursor-pointer">
                                        {perm}
                                    </label>
                                </div>
                            ))}
                        </div>
                        {form?.formState?.errors?.permissions && (
                            <p className="text-sm text-destructive mt-1">{form?.formState?.errors?.permissions?.message}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={addUserMutation.isPending} className='cursor-pointer'>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={addUserMutation.isPending} className='cursor-pointer'>
                            {addUserMutation.isPending ? "Adding..." : "Add User"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    </>
}

export default AddUserDialogComponent
