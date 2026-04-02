import { useGetPatient, useUpdatePatient, getGetPatientQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Plus, FileText, Calendar, CreditCard, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function PatientDetail({ id }: { id: string }) {
  const patientId = parseInt(id, 10);
  const { data: patient, isLoading } = useGetPatient(patientId, {
    query: {
      enabled: !isNaN(patientId),
      queryKey: getGetPatientQueryKey(patientId)
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-32 w-full" />
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-64 md:col-span-1" />
          <Skeleton className="h-64 md:col-span-2" />
        </div>
      </div>
    );
  }

  if (!patient) {
    return <div className="text-center py-20">Patient not found</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 border-green-200";
      case "inactive": return "bg-gray-100 text-gray-800 border-gray-200";
      case "new": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/patients">
          <Button variant="ghost" size="icon" className="shrink-0"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{patient.name}</h1>
            <Badge variant="outline" className={`capitalize ${getStatusColor(patient.status)}`}>{patient.status}</Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Edit Profile</Button>
            <Link href={`/book?patient=${patient.id}`}><Button>Book Appt</Button></Link>
          </div>
        </div>
      </div>

      {(patient.allergies || patient.medicalHistory) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 text-red-900">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1">Medical Alerts</h3>
            {patient.allergies && <p className="text-sm"><span className="font-medium">Allergies:</span> {patient.allergies}</p>}
            {patient.medicalHistory && <p className="text-sm mt-1"><span className="font-medium">History:</span> {patient.medicalHistory}</p>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 h-fit">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-lg">Personal Info</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-sm">
            <div className="grid grid-cols-[100px_1fr] gap-1">
              <span className="text-muted-foreground">Patient ID</span>
              <span className="font-medium">PT-{patient.id.toString().padStart(4, '0')}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-1">
              <span className="text-muted-foreground">IC / ID</span>
              <span className="font-medium">{patient.icNumber || "-"}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-1">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium">{patient.phone}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-1">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{patient.email || "-"}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-1">
              <span className="text-muted-foreground">DOB</span>
              <span className="font-medium">{patient.dateOfBirth ? format(new Date(patient.dateOfBirth), "MMM d, yyyy") : "-"}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-1">
              <span className="text-muted-foreground">Gender</span>
              <span className="font-medium capitalize">{patient.gender || "-"}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-1 pt-2 border-t">
              <span className="text-muted-foreground">Address</span>
              <span className="font-medium leading-relaxed">{patient.address || "-"}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-1 pt-2 border-t">
              <span className="text-muted-foreground">Registered</span>
              <span className="font-medium">{format(new Date(patient.createdAt), "MMM d, yyyy")}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 h-fit">
          <Tabs defaultValue="treatments" className="w-full">
            <div className="border-b px-6">
              <TabsList className="bg-transparent h-12 p-0 gap-6">
                <TabsTrigger value="treatments" className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-0 py-3">
                  <FileText className="w-4 h-4 mr-2" /> Treatment Logs
                </TabsTrigger>
                <TabsTrigger value="appointments" className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-0 py-3">
                  <Calendar className="w-4 h-4 mr-2" /> Appointments
                </TabsTrigger>
                <TabsTrigger value="billing" className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-0 py-3">
                  <CreditCard className="w-4 h-4 mr-2" /> Billing
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="treatments" className="p-0 m-0">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold">Treatment History</h3>
                  <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add Log</Button>
                </div>
                
                {patient.treatmentLogs && patient.treatmentLogs.length > 0 ? (
                  <div className="space-y-6">
                    {patient.treatmentLogs.map((log) => (
                      <div key={log.id} className="border rounded-lg p-4 bg-muted/20">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-primary">{log.treatmentName}</h4>
                            <p className="text-xs text-muted-foreground">{format(new Date(log.date), "MMM d, yyyy")} • Dr. {log.dentistName}</p>
                          </div>
                          <Badge variant="outline" className="capitalize bg-white">{log.status.replace("_", " ")}</Badge>
                        </div>
                        <p className="text-sm bg-white p-3 border rounded-md">{log.notes || "No clinical notes provided."}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border border-dashed rounded-lg text-muted-foreground">
                    No treatment logs found for this patient.
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="appointments" className="p-0 m-0">
              <div className="p-6">
                {patient.appointments && patient.appointments.length > 0 ? (
                  <div className="space-y-4">
                    {patient.appointments.map((apt) => (
                      <div key={apt.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                        <div className="flex items-start gap-4">
                          <div className="bg-primary/10 text-primary rounded-lg p-2 text-center min-w-[60px]">
                            <div className="text-xs font-bold uppercase">{format(new Date(apt.date), "MMM")}</div>
                            <div className="text-lg font-black leading-none">{format(new Date(apt.date), "dd")}</div>
                          </div>
                          <div>
                            <p className="font-medium">{apt.treatmentName || "General Checkup"}</p>
                            <p className="text-sm text-muted-foreground">{apt.startTime} • Dr. {apt.dentistName}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="capitalize">{apt.status.replace("_", " ")}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border border-dashed rounded-lg text-muted-foreground">
                    No appointments found.
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="billing" className="p-0 m-0">
              <div className="p-6">
                 {patient.bills && patient.bills.length > 0 ? (
                  <div className="space-y-4">
                    {patient.bills.map((bill) => (
                      <div key={bill.id} className="flex items-center justify-between border rounded-lg p-4 hover:bg-muted/30">
                        <div>
                          <p className="font-medium text-sm text-muted-foreground">INV-{bill.id.toString().padStart(5, '0')}</p>
                          <p className="font-semibold">${bill.total.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground mt-1">{format(new Date(bill.createdAt), "MMM d, yyyy")}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant="outline" className={`capitalize ${bill.status === 'paid' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}>
                            {bill.status}
                          </Badge>
                          {bill.status === 'pending' && <Button size="sm" variant="outline" className="h-7 text-xs">Pay Now</Button>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border border-dashed rounded-lg text-muted-foreground">
                    No billing history found.
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
