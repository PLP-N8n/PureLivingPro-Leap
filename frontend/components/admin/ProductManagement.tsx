import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import backend from "~backend/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Upload,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";
import { LoadingSpinner } from "../LoadingSpinner";
import { useToast } from "@/components/ui/use-toast";
// Placeholder for ProductEditor component
// import { ProductEditor } from "./ProductEditor";

export function ProductManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin", "affiliate-products"],
    queryFn: () => backend.affiliate.listAffiliateProducts({ limit: 50 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => backend.affiliate.deleteProduct({ id }),
    onSuccess: () => {
      toast({ title: "Product deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["admin", "affiliate-products"] });
    },
    onError: (error) => {
      toast({ title: "Failed to delete product", variant: "destructive" });
      console.error(error);
    },
  });

  const handleNewProduct = () => {
    setSelectedProduct(null);
    setIsEditorOpen(true);
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setIsEditorOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
        <p className="text-gray-600">Manage all your affiliate products and links.</p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input placeholder="Search products..." className="w-64" />
          <Button variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={handleNewProduct}>
            <Plus className="h-4 w-4 mr-2" />
            New Product
          </Button>
        </div>
      </div>

      {/* Product List Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Program</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <LoadingSpinner />
                </TableCell>
              </TableRow>
            ) : (
              products?.products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell>${product.price?.toFixed(2)}</TableCell>
                  <TableCell>{product.program?.name}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => deleteMutation.mutate(product.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Placeholder for ProductEditor Dialog */}
      {/* <ProductEditor 
        isOpen={isEditorOpen} 
        onClose={() => setIsEditorOpen(false)} 
        product={selectedProduct} 
      /> */}
    </div>
  );
}
