import { useState } from "react";
import { useListInventory, getListInventoryQueryKey } from "@workspace/api-client-react";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, AlertTriangle, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";

export default function Inventory() {
  const [search, setSearch] = useState("");
  const { data: inventoryResponse, isLoading } = useListInventory({
    query: { queryKey: getListInventoryQueryKey() }
  });

  const inventory = Array.isArray(inventoryResponse) ? inventoryResponse : (inventoryResponse as any)?.items || [];
  
  const filteredInventory = inventory.filter((item: any) => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = inventory.filter((i: any) => i.isLowStock || i.currentStock <= i.minStockLevel).length;

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Manage clinic supplies and materials.</p>
        </div>
        <Button data-testid="button-add-item">
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>

      {lowStockCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3 text-amber-900">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <div className="flex-1">
            <h3 className="font-semibold">Low Stock Alert</h3>
            <p className="text-sm">You have {lowStockCount} items running low. Please reorder soon.</p>
          </div>
          <Button variant="outline" className="border-amber-200 text-amber-800 hover:bg-amber-100">
            View Items
          </Button>
        </div>
      )}

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search items..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Stock Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Restocked</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-20 inline-block" /></TableCell>
                  </TableRow>
                ))
              ) : filteredInventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No items found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredInventory.map((item: any) => {
                  const isLow = item.isLowStock || item.currentStock <= item.minStockLevel;
                  return (
                    <TableRow key={item.id} className={isLow ? "bg-amber-50/20" : "hover:bg-muted/30"}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/10">
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-semibold">{item.currentStock} <span className="text-xs text-muted-foreground font-normal">{item.unit}</span></div>
                        <div className="text-xs text-muted-foreground">Min: {item.minStockLevel}</div>
                      </TableCell>
                      <TableCell>
                        {isLow ? (
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Low Stock</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Healthy</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.lastRestocked ? format(new Date(item.lastRestocked), "MMM d, yyyy") : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="h-8">
                          <ArrowUpDown className="h-3 w-3 mr-1" /> Adjust
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
