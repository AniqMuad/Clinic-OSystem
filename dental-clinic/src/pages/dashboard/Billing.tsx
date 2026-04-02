import { useState } from "react";
import { useListBills, getListBillsQueryKey } from "@workspace/api-client-react";
import { format } from "date-fns";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Receipt, DollarSign, FileText } from "lucide-react";

export default function Billing() {
  const [search, setSearch] = useState("");
  const { data: billsResponse, isLoading } = useListBills({
    query: { queryKey: getListBillsQueryKey() }
  });

  const bills = Array.isArray(billsResponse) ? billsResponse : (billsResponse as any)?.bills || [];
  
  const filteredBills = bills.filter((b: any) => 
    (b.patientName || "").toLowerCase().includes(search.toLowerCase()) || 
    (b.receiptNumber || "").toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800 border-green-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Invoices</h1>
          <p className="text-muted-foreground">Manage payments, invoices, and receipts.</p>
        </div>
        <Button data-testid="button-create-bill">
          <Plus className="mr-2 h-4 w-4" /> Create Bill
        </Button>
      </div>

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search patient or receipt..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
             <Button variant="outline" size="sm" className="hidden sm:flex">
               <FileText className="mr-2 h-4 w-4" /> Export Report
             </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Invoice ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-24 inline-block" /></TableCell>
                  </TableRow>
                ))
              ) : filteredBills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No bills found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBills.map((bill: any) => (
                  <TableRow key={bill.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-sm">
                      {bill.receiptNumber || `INV-${bill.id.toString().padStart(5, '0')}`}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(bill.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {bill.patientName || "Unknown Patient"}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      ${bill.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`capitalize ${getStatusColor(bill.status)}`}>
                        {bill.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {bill.status === 'pending' && (
                          <Button size="sm" className="h-8 px-3 bg-primary/10 text-primary hover:bg-primary/20 border-none">
                            <DollarSign className="h-3 w-3 mr-1" /> Pay
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-8 px-2" title="View Receipt">
                          <Receipt className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
