import { useState } from "react";
import { useListAppointments, useUpdateAppointmentStatus, getListAppointmentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, CheckCircle2, PlayCircle, XCircle } from "lucide-react";

export default function Appointments() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const formattedDate = format(currentDate, "yyyy-MM-dd");
  
  const { data: appointmentsResponse, isLoading } = useListAppointments(
    { date: viewMode === "day" ? formattedDate : undefined },
    { query: { queryKey: getListAppointmentsQueryKey({ date: viewMode === "day" ? formattedDate : undefined }) } }
  );

  // Api returns wrapped object for lists, or array? Checking standard Orval list pattern:
  // Usually returns { data: [], total: x } or just [] depending on spec. 
  // Assuming it returns an array directly based on rules "Generated hooks return T directly"
  const appointments = Array.isArray(appointmentsResponse) ? appointmentsResponse : 
                      (appointmentsResponse as any)?.appointments || [];

  const updateStatus = useUpdateAppointmentStatus();

  const handleStatusChange = (id: number, newStatus: any) => {
    updateStatus.mutate({ id, data: { status: newStatus } }, {
      onSuccess: () => {
        toast({ title: "Status updated" });
        queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_treatment": return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "no_show": return "bg-red-100 text-red-800 border-red-200";
      case "cancelled": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"];

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-[calc(100vh-6rem)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">Manage schedule and patient flow.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border rounded-md p-1 mr-4 shadow-sm">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(addDays(currentDate, -1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="px-4 font-medium text-sm min-w-[140px] text-center flex items-center justify-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              {format(currentDate, "MMM d, yyyy")}
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(addDays(currentDate, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 ml-2" onClick={() => setCurrentDate(new Date())}>Today</Button>
          </div>
          <Button data-testid="button-new-apt">New Appt</Button>
        </div>
      </div>

      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden shadow-sm">
        <div className="overflow-y-auto flex-1 p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : (
            <div className="min-w-[800px]">
              {timeSlots.map((time) => {
                const slotApts = appointments.filter((a: any) => a.startTime === time && isSameDay(new Date(a.date), currentDate));
                
                return (
                  <div key={time} className="flex border-b last:border-b-0 min-h-[80px] group">
                    <div className="w-24 shrink-0 border-r bg-muted/20 p-3 text-right flex flex-col justify-start">
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{time}</span>
                    </div>
                    <div className="flex-1 p-2 flex flex-wrap gap-2 items-start relative">
                      {/* Grid lines */}
                      <div className="absolute left-0 top-1/2 w-full h-[1px] bg-border/30 -z-10 pointer-events-none" />
                      
                      {slotApts.length === 0 ? (
                        <div className="w-full h-full opacity-0 group-hover:opacity-100 flex items-center p-2 transition-opacity">
                          <span className="text-xs text-muted-foreground">+ Add to {time}</span>
                        </div>
                      ) : (
                        slotApts.map((apt: any) => (
                          <div key={apt.id} className={`flex-1 min-w-[250px] max-w-sm rounded-lg border p-3 shadow-sm transition-all hover:shadow-md bg-white border-l-4 ${apt.status === 'scheduled' ? 'border-l-slate-400' : apt.status === 'waiting' ? 'border-l-yellow-400' : apt.status === 'in_treatment' ? 'border-l-blue-400' : apt.status === 'completed' ? 'border-l-green-400' : 'border-l-red-400'}`}>
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-semibold text-sm line-clamp-1">{apt.patientName}</div>
                              <Select 
                                value={apt.status} 
                                onValueChange={(val) => handleStatusChange(apt.id, val)}
                              >
                                <SelectTrigger className={`h-6 text-xs border-none px-2 py-0 w-auto ${getStatusColor(apt.status)}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="scheduled">Scheduled</SelectItem>
                                  <SelectItem value="waiting">Waiting</SelectItem>
                                  <SelectItem value="in_treatment">In Treatment</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="no_show">No Show</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="text-xs text-muted-foreground space-y-1 mb-3">
                              <div className="flex items-center gap-1.5"><Clock className="w-3 h-3"/> {apt.startTime} - {apt.endTime || "TBD"}</div>
                              <div className="flex items-center gap-1.5"><User className="w-3 h-3"/> Dr. {apt.dentistName} {apt.chairNumber && `• Chair ${apt.chairNumber}`}</div>
                              <div className="truncate text-primary/80 font-medium">{apt.treatmentName}</div>
                            </div>
                            <div className="flex gap-1 mt-auto pt-2 border-t border-border/50">
                              {apt.status === 'scheduled' && (
                                <Button size="sm" variant="ghost" className="h-6 text-xs px-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 w-full" onClick={() => handleStatusChange(apt.id, 'waiting')}>
                                  Arrived
                                </Button>
                              )}
                              {apt.status === 'waiting' && (
                                <Button size="sm" variant="ghost" className="h-6 text-xs px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 w-full" onClick={() => handleStatusChange(apt.id, 'in_treatment')}>
                                  <PlayCircle className="w-3 h-3 mr-1" /> Start
                                </Button>
                              )}
                              {apt.status === 'in_treatment' && (
                                <Button size="sm" variant="ghost" className="h-6 text-xs px-2 text-green-600 hover:text-green-700 hover:bg-green-50 w-full" onClick={() => handleStatusChange(apt.id, 'completed')}>
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> Complete
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
