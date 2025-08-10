
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Edit, Loader2 } from "lucide-react";
import { type Slip } from "@/lib/slips";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { InvoiceDialog } from "@/components/chat/invoice-dialog";
import { useToast } from "@/hooks/use-toast";
import { EditSlipDialog } from "@/components/admin/edit-slip-dialog"; // Can reuse this dialog
import { useUser } from "@/lib/auth";

export default function StaffSlipsPage() {
  const [slips, setSlips] = useState<Slip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingSlip, setViewingSlip] = useState<Slip | null>(null);
  const [editingSlip, setEditingSlip] = useState<Slip | null>(null);
  const { toast } = useToast();
  const user = useUser();

  const fetchSlips = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/slips');
      if (!response.ok) throw new Error('Failed to fetch slips');
      let data = await response.json();
      // Staff can only see their own slips
      if (user) {
        data = data.filter((slip: Slip) => slip.staffName === user.name);
      }
      setSlips(data);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch slips.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) { // Only fetch when user is loaded
      fetchSlips();
    }
  }, [user]); // Rerun when user object is available

  const handleSaveSlip = async (updatedSlip: Slip) => {
    try {
      const response = await fetch('/api/slips', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedSlip),
      });
      if (!response.ok) throw new Error('Failed to update slip');
      toast({ title: "Slip Updated", description: "The slip has been updated successfully." });
      fetchSlips(); // Refresh
      setEditingSlip(null);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update slip.' });
    }
  };

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Your Generated Slips</h2>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Slip ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                     <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                        </TableCell>
                    </TableRow>
                  ) : slips.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        You haven't generated any slips yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    slips.map((slip) => (
                      <TableRow key={slip.id}>
                        <TableCell className="font-mono">{slip.id.slice(0, 8)}...</TableCell>
                        <TableCell>{new Date(slip.date).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{slip.items.length}</Badge>
                        </TableCell>
                        <TableCell>₹{slip.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => setViewingSlip(slip)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                           <Button variant="ghost" size="icon" onClick={() => setEditingSlip(slip)}>
                              <Edit className="h-4 w-4" />
                           </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      {viewingSlip && (
        <InvoiceDialog
          isOpen={!!viewingSlip}
          onOpenChange={() => setViewingSlip(null)}
          invoiceContent={viewingSlip.invoiceContent}
        />
      )}
       {editingSlip && (
        <EditSlipDialog
          slip={editingSlip}
          isOpen={!!editingSlip}
          onOpenChange={() => setEditingSlip(null)}
          onSave={handleSaveSlip}
        />
       )}
    </>
  );
}
