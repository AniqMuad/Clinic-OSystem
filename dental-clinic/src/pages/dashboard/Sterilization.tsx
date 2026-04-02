import { useListSterilizationLogs, getListSterilizationLogsQueryKey } from "@workspace/api-client-react";
import { format } from "date-fns";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Droplets, CheckCircle2, RotateCcw, AlertTriangle } from "lucide-react";

export default function Sterilization() {
  const { data: logsResponse, isLoading } = useListSterilizationLogs({
    query: { queryKey: getListSterilizationLogsQueryKey() }
  });

  const logs = Array.isArray(logsResponse) ? logsResponse : (logsResponse as any)?.logs || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready": return "bg-green-100 text-green-800 border-green-200";
      case "in_cycle": return "bg-blue-100 text-blue-800 border-blue-200 animate-pulse";
      case "failed": return "bg-red-100 text-red-800 border-red-200";
      case "completed": return "bg-slate-100 text-slate-800 border-slate-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready": return <CheckCircle2 className="w-3 h-3 mr-1" />;
      case "in_cycle": return <RotateCcw className="w-3 h-3 mr-1" />;
      case "failed": return <AlertTriangle className="w-3 h-3 mr-1" />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sterilization Log</h1>
          <p className="text-muted-foreground">Track instrument cleaning and autoclave cycles.</p>
        </div>
        <Button data-testid="button-add-log">
          <Plus className="mr-2 h-4 w-4" /> Log Cycle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <div className="bg-white border rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-full text-blue-600"><RotateCcw className="w-6 h-6" /></div>
          <div><p className="text-sm text-muted-foreground">Running Cycles</p><p className="text-2xl font-bold">{logs.filter((l:any)=>l.status==='in_cycle').length}</p></div>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="bg-green-50 p-3 rounded-full text-green-600"><CheckCircle2 className="w-6 h-6" /></div>
          <div><p className="text-sm text-muted-foreground">Ready Instruments</p><p className="text-2xl font-bold">{logs.filter((l:any)=>l.status==='ready').length}</p></div>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-full text-primary"><Droplets className="w-6 h-6" /></div>
          <div><p className="text-sm text-muted-foreground">Total Today</p><p className="text-2xl font-bold">{logs.length}</p></div>
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Instrument Set</TableHead>
                <TableHead>Cycle #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-20 inline-block" /></TableCell>
                  </TableRow>
                ))
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No sterilization logs found.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log: any) => (
                  <TableRow key={log.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{log.instrumentName}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{log.cycleNumber || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`capitalize border-none ${getStatusColor(log.status)}`}>
                        <div className="flex items-center">
                          {getStatusIcon(log.status)}
                          {log.status.replace("_", " ")}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.startedAt ? format(new Date(log.startedAt), "HH:mm, MMM d") : "-"}
                    </TableCell>
                    <TableCell className="text-sm">{log.performedByName || "System"}</TableCell>
                    <TableCell className="text-right">
                      {log.status === 'in_cycle' && (
                        <Button size="sm" variant="outline" className="h-8 text-xs bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200">
                          Mark Ready
                        </Button>
                      )}
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
