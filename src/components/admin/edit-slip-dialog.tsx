
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
import { Textarea } from "@/components/ui/textarea";
import { type Slip } from "@/lib/slips";
import { Loader2 } from "lucide-react";
import { Input } from "../ui/input";

interface EditSlipDialogProps {
  slip: Slip;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (slip: Slip) => Promise<void>;
}

const formSchema = z.object({
  invoiceContent: z.string().min(1, "Invoice content cannot be empty."),
  staffName: z.string().min(1, "Staff name cannot be empty."),
});

export function EditSlipDialog({
  slip,
  isOpen,
  onOpenChange,
  onSave,
}: EditSlipDialogProps) {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invoiceContent: slip.invoiceContent,
      staffName: slip.staffName,
    },
  });
  
  const { formState: { isSubmitting } } = form;

  useEffect(() => {
    if (slip) {
      form.reset({
        invoiceContent: slip.invoiceContent,
        staffName: slip.staffName,
      });
    }
  }, [slip, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const updatedSlip = {
      ...slip,
      ...values,
    };
    await onSave(updatedSlip);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Slip</DialogTitle>
          <DialogDescription>
            Modify the details for slip {slip.id.slice(0,8)}...
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="staffName"
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
              name="invoiceContent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Content</FormLabel>
                  <FormControl>
                    <Textarea {...field} disabled={isSubmitting} rows={15} className="font-mono"/>
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
