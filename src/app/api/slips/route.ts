
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { type Slip } from '@/lib/slips';

const dataFilePath = path.join(process.cwd(), 'data', 'slips.json');

async function getSlips(): Promise<Slip[]> {
  try {
    const fileData = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(fileData);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function saveSlips(slips: Slip[]): Promise<void> {
  const jsonData = JSON.stringify(slips, null, 2);
  await fs.writeFile(dataFilePath, jsonData, 'utf-8');
}

// GET handler to fetch all slips
export async function GET() {
  try {
    const slips = await getSlips();
    return NextResponse.json(slips);
  } catch (error) {
    console.error('Failed to read slips:', error);
    return NextResponse.json({ message: 'Failed to read slip data.' }, { status: 500 });
  }
}

// POST handler to add a new slip
export async function POST(request: Request) {
  try {
    const newSlip: Slip = await request.json();
    if (!newSlip.id || !newSlip.date) {
      return NextResponse.json({ message: 'Invalid slip data provided.' }, { status: 400 });
    }

    const existingSlips = await getSlips();
    existingSlips.unshift(newSlip); // Add to the beginning of the array
    await saveSlips(existingSlips);

    return NextResponse.json({ message: 'Slip added successfully.', slip: newSlip });

  } catch (error) {
    console.error('Failed to save slip:', error);
    return NextResponse.json({ message: 'Failed to save slip data.' }, { status: 500 });
  }
}

// PUT handler to update a slip
export async function PUT(request: Request) {
  try {
    const updatedSlip: Slip = await request.json();
    if (!updatedSlip.id) {
      return NextResponse.json({ message: 'Invalid slip data provided.' }, { status: 400 });
    }

    const existingSlips = await getSlips();
    const slipIndex = existingSlips.findIndex(s => s.id === updatedSlip.id);

    if (slipIndex === -1) {
      return NextResponse.json({ message: 'Slip not found.' }, { status: 404 });
    }

    existingSlips[slipIndex] = updatedSlip;
    await saveSlips(existingSlips);

    return NextResponse.json({ message: 'Slip updated successfully.', slip: updatedSlip });

  } catch (error) {
    console.error('Failed to update slip:', error);
    return NextResponse.json({ message: 'Failed to update slip data.' }, { status: 500 });
  }
}

// DELETE handler to remove slips by their IDs
export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const idsToDelete: string[] = body.ids;

        if (!Array.isArray(idsToDelete) || idsToDelete.length === 0) {
            return NextResponse.json({ message: 'No slip IDs provided for deletion.' }, { status: 400 });
        }

        const existingSlips = await getSlips();
        const updatedSlips = existingSlips.filter(p => !idsToDelete.includes(p.id));

        if (updatedSlips.length === existingSlips.length) {
             return NextResponse.json({ message: 'No matching slips found to delete.' }, { status: 404 });
        }

        await saveSlips(updatedSlips);
        
        return NextResponse.json({ message: 'Slips deleted successfully.' });

    } catch (error) {
        console.error('Failed to delete slips:', error);
        return NextResponse.json({ message: 'Failed to delete slip data.' }, { status: 500 });
    }
}
