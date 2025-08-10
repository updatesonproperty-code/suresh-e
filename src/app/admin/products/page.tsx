
"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Product } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Edit2, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EditProductDialog } from "@/components/admin/edit-product-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";


export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch product data.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);


  const handleRefresh = () => {
    fetchProducts();
  };

  const handleSaveProduct = async (updatedProduct: Product) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([updatedProduct]), // API expects an array
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update product');
      }
      
      toast({
        title: "Product Updated",
        description: `"${updatedProduct.name}" has been updated successfully.`,
      });
      fetchProducts(); // Refresh the list
      setEditingProduct(null);

    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: error.message,
        });
    }
  };
  
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = (checked: boolean | string) => {
    if (checked) {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts((prev) => [...prev, productId]);
    } else {
      setSelectedProducts((prev) => prev.filter((id) => id !== productId));
    }
  };

  const handleDeleteSelected = async () => {
    try {
      const response = await fetch('/api/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedProducts }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete products');
      }
      
      toast({
        title: "Products Deleted",
        description: `${selectedProducts.length} product(s) have been deleted successfully.`,
      });

      fetchProducts(); // Refresh the list
      setSelectedProducts([]);

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete products.",
      });
    }
  };

  const numSelected = selectedProducts.length;

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Manage Products</h2>
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="sr-only">Sync Products</span>
            </Button>
          </div>
          <div className="flex w-full md:w-auto items-center gap-2">
            {numSelected > 0 && (
                <Button variant="destructive" onClick={handleDeleteSelected}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete ({numSelected})
                </Button>
            )}
            <div className="relative w-full md:w-auto md:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                placeholder="Search by name or code..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
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
                        checked={numSelected > 0 && numSelected === filteredProducts.length && filteredProducts.length > 0}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead className="w-2/5">Product Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Hidden Cost</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                     <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                        </TableCell>
                    </TableRow>
                  ) : filteredProducts.length === 0 ? (
                     <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                            No products found.
                        </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                        <TableRow 
                        key={product.id} 
                        data-state={selectedProducts.includes(product.id) ? "selected" : ""}
                        >
                        <TableCell>
                            <Checkbox
                                checked={selectedProducts.includes(product.id)}
                                onCheckedChange={(checked) => handleSelectProduct(product.id, !!checked)}
                                aria-label={`Select ${product.name}`}
                            />
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.id}</TableCell>
                        <TableCell>₹{product.price.toFixed(2)}</TableCell>
                        <TableCell>₹{product.hiddenCost.toFixed(2)}</TableCell>
                        <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => setEditingProduct(product)}>
                            <Edit2 className="h-4 w-4" />
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
       {editingProduct && (
        <EditProductDialog
          product={editingProduct}
          isOpen={!!editingProduct}
          onOpenChange={() => setEditingProduct(null)}
          onSave={handleSaveProduct}
        />
      )}
    </>
  );
}
