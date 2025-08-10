
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type Product } from "@/lib/products";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "../ui/scroll-area";
import { Loader2 } from "lucide-react";

interface ConfirmImportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  onConfirm: (products: Product[]) => void;
  onCancel: () => void;
}

export function ConfirmImportDialog({
  isOpen,
  onOpenChange,
  products,
  onConfirm,
  onCancel,
}: ConfirmImportDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = () => {
    setIsConfirming(true);
    onConfirm(products);
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onCancel();
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Confirm Product Import</DialogTitle>
          <DialogDescription>
            The AI found the following {products.length} products in your file. Please review them before importing.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Hidden Cost</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((product, index) => (
                        <TableRow key={`${product.id}-${index}`}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.id}</TableCell>
                            <TableCell>₹{product.price.toFixed(2)}</TableCell>
                            <TableCell>₹{product.hiddenCost.toFixed(2)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isConfirming}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isConfirming}>
            {isConfirming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
