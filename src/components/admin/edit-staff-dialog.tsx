
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type Staff } from "@/app/admin/staff/page";
import { Loader2 } from "lucide-react";

interface EditStaffDialogProps {
  staff: Staff;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (staff: Staff) => Promise<void>;
}

const formSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Staff name is required."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters.").optional().or(z.literal('')),
});

export function EditStaffDialog({
  staff,
  isOpen,
  onOpenChange,
  onSave,
}: EditStaffDialogProps) {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      password: "",
    },
  });
  
  const { formState: { isSubmitting } } = form;

  useEffect(() => {
    if (staff) {
      form.reset({
        id: staff.id,
        name: staff.name,
        email: staff.email,
        password: "",
      });
    }
  }, [staff, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Only include the password if it's been changed
    const dataToSave: Staff = {
        id: values.id,
        name: values.name,
        email: values.email,
    };
    if (values.password) {
        (dataToSave as any).password = values.password;
    }
    await onSave(dataToSave);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Staff Member</DialogTitle>
          <DialogDescription>
            Update the details for "{staff.name}".
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Staff Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} disabled={isSubmitting} placeholder="Leave blank to keep current password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
