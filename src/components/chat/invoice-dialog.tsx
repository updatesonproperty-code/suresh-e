"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface InvoiceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceContent: string;
}

export function InvoiceDialog({
  isOpen,
  onOpenChange,
  invoiceContent,
}: InvoiceDialogProps) {

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl printable-area">
        <DialogHeader>
          <DialogTitle>Generated Invoice</DialogTitle>
          <DialogDescription>
            Review the invoice below. You can print it or save it as a PDF.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto rounded-md border bg-secondary/20 p-4">
          <pre className="whitespace-pre-wrap font-mono text-sm text-foreground">
            {invoiceContent}
          </pre>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
