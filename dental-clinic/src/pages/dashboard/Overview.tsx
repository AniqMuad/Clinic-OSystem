import { useGetDashboardStats, useGetTodayAppointments } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, DollarSign, CalendarCheck, AlertTriangle, ListTodo, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function DashboardOverview() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: schedule, isLoading: scheduleLoading } = useGetTodayAppointments();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_treatment": return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "no_show": return "bg-red-100 text-red-800 border-red-200";
      case "cancelled": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200"; // scheduled
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Good morning, {user?.name.split(" ")[0]}</h1>
          <p className="text-muted-foreground">Here's what's happening at the clinic today.</p>
        </div>
        <div className="flex gap-2">
          {["admin", "front_desk"].includes(user?.role || "") && (
            <Link href="/book">
              <Button>New Appointment</Button>
            </Link>
          )}
          {["admin", "front_desk"].includes(user?.role || "") && (
            <Link href="/patients">
              <Button variant="outline">Add Patient</Button>
            </Link>
          )}
        </div>
      </div>

      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients Today</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPatientsToday}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.completedTreatments} completed, {stats.pendingAppointments} pending
              </p>
            </CardContent>
          </Card>
          
          {(user?.role === "admin" || user?.role === "dentist") && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Revenue Today</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.revenueToday.toFixed(2)}</div>
              </CardContent>
            </Card>
          )}

          <Card className={stats.lowStockAlerts > 0 ? "border-amber-200 bg-amber-50/30" : ""}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Alerts</CardTitle>
              <AlertTriangle className={`h-4 w-4 ${stats.lowStockAlerts > 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.lowStockAlerts}</div>
              {stats.lowStockAlerts > 0 && (
                <Link href="/inventory" className="text-xs text-amber-600 font-medium hover:underline mt-1 inline-block">
                  View inventory
                </Link>
              )}
            </CardContent>
          </Card>

          <Card className={stats.overdueTasks > 0 ? "border-red-200 bg-red-50/30" : ""}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overdue Tasks</CardTitle>
              <ListTodo className={`h-4 w-4 ${stats.overdueTasks > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overdueTasks}</div>
              {stats.overdueTasks > 0 && (
                <Link href="/tasks" className="text-xs text-red-600 font-medium hover:underline mt-1 inline-block">
                  View tasks
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Today's Schedule</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Live view of clinic chairs</p>
            </div>
            <Link href="/appointments">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                Full Calendar <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {scheduleLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : schedule?.chairs?.length ? (
              <div className="space-y-6">
                {schedule.chairs.map((chair) => (
                  <div key={chair.chairNumber} className="border rounded-lg overflow-hidden">
                    <div className="bg-muted/50 px-4 py-2 border-b font-medium text-sm flex justify-between">
                      <span>Chair {chair.chairNumber}</span>
                      <span className="text-muted-foreground">{chair.appointments.length} appointments</span>
                    </div>
                    <div className="divide-y">
                      {chair.appointments.length > 0 ? (
                        chair.appointments.map((apt) => (
                          <div key={apt.id} className="p-3 hover:bg-muted/30 transition-colors flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="text-sm font-semibold w-24 shrink-0 text-center bg-slate-100 rounded px-2 py-1">
                                {apt.startTime}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{apt.patientName}</p>
                                <p className="text-xs text-muted-foreground">{apt.treatmentName} • Dr. {apt.dentistName}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className={`capitalize ${getStatusColor(apt.status)}`}>
                              {apt.status.replace("_", " ")}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No appointments scheduled for this chair today.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border rounded-lg bg-muted/10 border-dashed">
                <CalendarCheck className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="text-lg font-medium">No schedule data available</h3>
                <p className="text-sm text-muted-foreground">The schedule for today is empty.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {["admin", "front_desk"].includes(user?.role || "") && (
                <>
                  <Link href="/book" className="w-full">
                    <Button variant="outline" className="w-full h-auto py-3 flex flex-col gap-2 items-center justify-center">
                      <CalendarCheck className="h-5 w-5" />
                      <span className="text-xs">Book</span>
                    </Button>
                  </Link>
                  <Link href="/billing" className="w-full">
                    <Button variant="outline" className="w-full h-auto py-3 flex flex-col gap-2 items-center justify-center">
                      <DollarSign className="h-5 w-5" />
                      <span className="text-xs">Bill</span>
                    </Button>
                  </Link>
                </>
              )}
              {["admin", "assistant"].includes(user?.role || "") && (
                <>
                  <Link href="/tasks" className="w-full">
                    <Button variant="outline" className="w-full h-auto py-3 flex flex-col gap-2 items-center justify-center">
                      <ListTodo className="h-5 w-5" />
                      <span className="text-xs">Tasks</span>
                    </Button>
                  </Link>
                  <Link href="/inventory" className="w-full">
                    <Button variant="outline" className="w-full h-auto py-3 flex flex-col gap-2 items-center justify-center">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="text-xs">Stock</span>
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.appointmentsByStatus ? (
                <div className="space-y-3">
                  {Object.entries(stats.appointmentsByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(status).split(' ')[0]}`} />
                        <span className="text-sm capitalize">{status.replace("_", " ")}</span>
                      </div>
                      <span className="font-semibold text-sm">{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No appointment data</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
