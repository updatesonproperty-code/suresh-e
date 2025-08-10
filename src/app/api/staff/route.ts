
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { type Staff } from '@/app/admin/staff/page';

const dataFilePath = path.join(process.cwd(), 'data', 'staff.json');

async function getStaff(): Promise<Staff[]> {
  try {
    const fileData = await fs.readFile(dataFilePath, 'utf-8');
    // Ensure that if the file is empty, we return an array
    if (!fileData) {
      return [];
    }
    return JSON.parse(fileData);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function saveStaff(staff: Staff[]): Promise<void> {
  const jsonData = JSON.stringify(staff, null, 2);
  await fs.writeFile(dataFilePath, jsonData, 'utf-8');
}

// GET handler to fetch all staff (passwords are removed)
export async function GET() {
  try {
    const staff = await getStaff();
    // For security, don't return passwords in the GET all response
    const staffWithoutPasswords = staff.map(({ password, ...rest }) => rest);
    return NextResponse.json(staffWithoutPasswords);
  } catch (error) {
    console.error('Failed to read staff:', error);
    return NextResponse.json({ message: 'Failed to read staff data.' }, { status: 500 });
  }
}

// POST handler to add a new staff member
export async function POST(request: Request) {
  try {
    const newStaffMember: Omit<Staff, 'id'> = await request.json();
    if (!newStaffMember.email || !newStaffMember.name || !newStaffMember.password) {
      return NextResponse.json({ message: 'Invalid staff data provided.' }, { status: 400 });
    }

    const existingStaff = await getStaff();
    
    if (existingStaff.some(s => s.email === newStaffMember.email)) {
        return NextResponse.json({ message: 'A staff member with this email already exists.' }, { status: 409 });
    }

    const newId = existingStaff.length > 0 ? (Math.max(...existingStaff.map(s => parseInt(s.id, 10))) + 1).toString() : "1";

    const staffToAdd: Staff = {
        id: newId,
        ...newStaffMember
    };
    
    existingStaff.push(staffToAdd);
    await saveStaff(existingStaff);
    
    // Return the new staff member without the password
    const { password, ...rest } = staffToAdd;
    return NextResponse.json({ message: 'Staff member added successfully.', staff: rest }, { status: 201 });

  } catch (error) {
    console.error('Failed to save staff:', error);
    return NextResponse.json({ message: 'Failed to save staff data.' }, { status: 500 });
  }
}

// PUT handler to update a staff member
export async function PUT(request: Request) {
  try {
    const updatedStaffMember: Staff = await request.json();
    if (!updatedStaffMember.id) {
      return NextResponse.json({ message: 'Staff ID is required for an update.' }, { status: 400 });
    }

    const existingStaff = await getStaff();
    const staffIndex = existingStaff.findIndex(s => s.id === updatedStaffMember.id);

    if (staffIndex === -1) {
      return NextResponse.json({ message: 'Staff member not found.' }, { status: 404 });
    }

    // Preserve password if not provided in the update request
    if (!updatedStaffMember.password) {
      updatedStaffMember.password = existingStaff[staffIndex].password;
    }

    existingStaff[staffIndex] = { ...existingStaff[staffIndex], ...updatedStaffMember };
    await saveStaff(existingStaff);
    
    // Return the updated staff member without the password
    const { password, ...rest } = existingStaff[staffIndex];
    return NextResponse.json({ message: 'Staff member updated successfully.', staff: rest });

  } catch (error) {
    console.error('Failed to update staff:', error);
    return NextResponse.json({ message: 'Failed to update staff data.' }, { status: 500 });
  }
}

// DELETE handler to remove staff members
export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const idsToDelete: string[] = body.ids;

        if (!Array.isArray(idsToDelete) || idsToDelete.length === 0) {
            return NextResponse.json({ message: 'No staff IDs provided for deletion.' }, { status: 400 });
        }

        const existingStaff = await getStaff();
        const updatedStaff = existingStaff.filter(s => !idsToDelete.includes(s.id));

        if (updatedStaff.length === existingStaff.length) {
             return NextResponse.json({ message: 'No matching staff found to delete.' }, { status: 404 });
        }

        await saveStaff(updatedStaff);
        
        return NextResponse.json({ message: 'Staff deleted successfully.' });

    } catch (error) {
        console.error('Failed to delete staff:', error);
        return NextResponse.json({ message: 'Failed to delete staff data.' }, { status: 500 });
    }
}
