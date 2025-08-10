
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { type Staff } from '@/app/admin/staff/page';

const dataFilePath = path.join(process.cwd(), 'data', 'staff.json');

async function getStaff(): Promise<Staff[]> {
  try {
    const fileData = await fs.readFile(dataFilePath, 'utf-8');
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

// POST handler for staff login
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
    }

    const staffList = await getStaff();

    const foundStaff = staffList.find(
      (staff) => staff.email === email && staff.password === password
    );

    if (foundStaff) {
      // Don't send the password back to the client
      const { password, ...user } = foundStaff;
      return NextResponse.json({ message: 'Login successful', user });
    } else {
      return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
