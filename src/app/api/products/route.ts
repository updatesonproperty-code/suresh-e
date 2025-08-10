
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { type Product } from '@/lib/products';

// The path to the JSON file, assuming it's in a `data` directory at the root
const dataFilePath = path.join(process.cwd(), 'data', 'products.json');

// Helper function to read the data file
async function getProducts(): Promise<Product[]> {
  try {
    const fileData = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(fileData);
  } catch (error) {
    // If the file doesn't exist, return an empty array
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

// Helper function to write to the data file
async function saveProducts(products: Product[]): Promise<void> {
  const jsonData = JSON.stringify(products, null, 2);
  await fs.writeFile(dataFilePath, jsonData, 'utf-8');
}

// GET handler to fetch all products
export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to read products:', error);
    return NextResponse.json({ message: 'Failed to read product data.' }, { status: 500 });
  }
}

// POST handler to add or update products
export async function POST(request: Request) {
  try {
    const newProducts: Product[] = await request.json();
    if (!Array.isArray(newProducts) || newProducts.length === 0) {
      return NextResponse.json({ message: 'Invalid product data provided.' }, { status: 400 });
    }

    const existingProducts = await getProducts();
    let addedCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];

    newProducts.forEach(newProduct => {
      if (!newProduct.id || !newProduct.name) {
          errors.push(`Invalid product object received: ${JSON.stringify(newProduct)}`);
          return;
      }
      const existingIndex = existingProducts.findIndex(p => p.id === newProduct.id);
      
      if (existingIndex !== -1) {
        // Update existing product
        existingProducts[existingIndex] = { ...existingProducts[existingIndex], ...newProduct };
        updatedCount++;
      } else {
        // Add new product
        existingProducts.push(newProduct);
        addedCount++;
      }
    });

    await saveProducts(existingProducts);

    return NextResponse.json({ 
        message: 'Products processed successfully.',
        added: addedCount,
        updated: updatedCount,
        errors: errors
    });

  } catch (error) {
    console.error('Failed to save products:', error);
    return NextResponse.json({ message: 'Failed to save product data.' }, { status: 500 });
  }
}


// DELETE handler to remove products by their IDs
export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const idsToDelete: string[] = body.ids;

        if (!Array.isArray(idsToDelete) || idsToDelete.length === 0) {
            return NextResponse.json({ message: 'No product IDs provided for deletion.' }, { status: 400 });
        }

        const existingProducts = await getProducts();
        const updatedProducts = existingProducts.filter(p => !idsToDelete.includes(p.id));

        if (updatedProducts.length === existingProducts.length) {
             return NextResponse.json({ message: 'No matching products found to delete.' }, { status: 404 });
        }

        await saveProducts(updatedProducts);
        
        return NextResponse.json({ message: 'Products deleted successfully.' });

    } catch (error) {
        console.error('Failed to delete products:', error);
        return NextResponse.json({ message: 'Failed to delete product data.' }, { status: 500 });
    }
}
