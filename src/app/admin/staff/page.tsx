
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
import { Edit2, Trash2, UserPlus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddStaffDialog } from "@/components/admin/add-staff-dialog";
import { EditStaffDialog } from "@/components/admin/edit-staff-dialog";
import { Card, CardContent } from "@/components/ui/card";


export type Staff = {
  id: string;
  name: string;
  email: string;
  password?: string;
};

export default function StaffPage() {
    const { toast } = useToast();
    const [staff, setStaff] = useState<Staff[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

    const fetchStaff = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/staff');
            if (!response.ok) throw new Error('Failed to fetch staff');
            const data = await response.json();
            setStaff(data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch staff.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedStaff(staff.map((s) => s.id));
        } else {
            setSelectedStaff([]);
        }
    };

    const handleSelectStaff = (staffId: string, checked: boolean) => {
        if (checked) {
            setSelectedStaff((prev) => [...prev, staffId]);
        } else {
            setSelectedStaff((prev) => prev.filter((id) => id !== staffId));
        }
    };

    const handleDeleteSelected = async () => {
       try {
            const response = await fetch('/api/staff', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedStaff }),
            });
            if (!response.ok) throw new Error('Failed to delete staff');
            toast({
                title: "Staff Deleted",
                description: `${selectedStaff.length} staff member(s) have been deleted.`,
            });
            fetchStaff();
            setSelectedStaff([]);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete staff.' });
        }
    };
    
    const handleAddStaff = async (newStaff: Omit<Staff, 'id'>) => {
      try {
            const response = await fetch('/api/staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newStaff),
            });
            if (!response.ok) throw new Error('Failed to add staff');
            toast({ title: "Staff Added", description: `A new staff member has been added successfully.` });
            fetchStaff();
            setIsAddDialogOpen(false);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not add staff member.' });
        }
    }
    
    const handleEditStaff = async (updatedStaff: Staff) => {
       try {
            const response = await fetch('/api/staff', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedStaff),
            });
            if (!response.ok) throw new Error('Failed to update staff');
            toast({ title: "Staff Updated", description: "Staff member details have been updated." });
            fetchStaff();
            setEditingStaff(null);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update staff member.' });
        }
    }

    const numSelected = selectedStaff.length;

    return (
      <>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Manage Staff</h2>
                <div className="flex items-center gap-2">
                    {numSelected > 0 && (
                        <Button variant="destructive" onClick={handleDeleteSelected}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete ({numSelected})
                        </Button>
                    )}
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Staff
                    </Button>
                </div>
            </div>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10">
                                    <Checkbox
                                        checked={numSelected > 0 && staff.length > 0 && numSelected === staff.length}
                                        onCheckedChange={handleSelectAll}
                                        aria-label="Select all"
                                    />
                                </TableHead>
                                <TableHead>ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
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
                            ) : staff.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No staff members found. Add one to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                staff.map((s) => (
                                    <TableRow 
                                        key={s.id}
                                        data-state={selectedStaff.includes(s.id) ? "selected" : ""}
                                    >
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedStaff.includes(s.id)}
                                                onCheckedChange={(checked) => handleSelectStaff(s.id, !!checked)}
                                                aria-label={`Select ${s.name}`}
                                            />
                                        </TableCell>
                                        <TableCell>{s.id}</TableCell>
                                        <TableCell>{s.name}</TableCell>
                                        <TableCell>{s.email}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" onClick={() => setEditingStaff(s)}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        <AddStaffDialog 
            isOpen={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onAddStaff={handleAddStaff}
        />
        {editingStaff && (
            <EditStaffDialog
                isOpen={!!editingStaff}
                onOpenChange={() => setEditingStaff(null)}
                onSave={handleEditStaff}
                staff={editingStaff}
            />
        )}
      </>
    );
}
