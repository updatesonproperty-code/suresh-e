
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
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Trash2, Calendar as CalendarIcon, Edit, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type Slip } from "@/lib/slips";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { InvoiceDialog } from "@/components/chat/invoice-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, isSameDay } from "date-fns";
import { EditSlipDialog } from "@/components/admin/edit-slip-dialog";

export default function SlipsPage() {
  const { toast } = useToast();
  const [slips, setSlips] = useState<Slip[]>([]);
  const [selectedSlips, setSelectedSlips] = useState<string[]>([]);
  const [viewingSlip, setViewingSlip] = useState<Slip | null>(null);
  const [editingSlip, setEditingSlip] = useState<Slip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const fetchSlips = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/slips');
      if (!response.ok) throw new Error('Failed to fetch slips');
      const data = await response.json();
      setSlips(data);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch slips.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlips();
  }, []);

  const filteredSlips = slips.filter(slip => {
    if (!selectedDate) return true;
    return isSameDay(new Date(slip.date), selectedDate);
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSlips(filteredSlips.map((s) => s.id));
    } else {
      setSelectedSlips([]);
    }
  };

  const handleSelectSlip = (slipId: string, checked: boolean) => {
    if (checked) {
      setSelectedSlips((prev) => [...prev, slipId]);
    } else {
      setSelectedSlips((prev) => prev.filter((id) => id !== slipId));
    }
  };

  const handleDeleteSelected = async () => {
    try {
      const response = await fetch('/api/slips', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedSlips }),
      });
      if (!response.ok) throw new Error('Failed to delete slips');
      toast({
        title: "Slips Deleted",
        description: `${selectedSlips.length} slip(s) have been deleted.`,
      });
      fetchSlips(); // Refresh
      setSelectedSlips([]);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete slips.' });
    }
  };

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

  const numSelected = selectedSlips.length;

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0">
          <h2 className="text-3xl font-bold tracking-tight">Manage Slips</h2>
          <div className="flex w-full md:w-auto items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {numSelected > 0 && (
              <Button variant="destructive" onClick={handleDeleteSelected}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete ({numSelected})
              </Button>
            )}
          </div>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={numSelected > 0 && numSelected === filteredSlips.length && filteredSlips.length > 0}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>Slip ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                     <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                        </TableCell>
                    </TableRow>
                  ) : filteredSlips.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                         {selectedDate ? "No slips found for this date." : "No slips generated yet."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSlips.map((slip) => (
                      <TableRow
                        key={slip.id}
                        data-state={selectedSlips.includes(slip.id) && "selected"}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedSlips.includes(slip.id)}
                            onCheckedChange={(checked) => handleSelectSlip(slip.id, !!checked)}
                            aria-label={`Select slip ${slip.id}`}
                          />
                        </TableCell>
                        <TableCell className="font-mono">{slip.id.slice(0, 8)}...</TableCell>
                        <TableCell>{new Date(slip.date).toLocaleString()}</TableCell>
                        <TableCell>{slip.staffName}</TableCell>
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
