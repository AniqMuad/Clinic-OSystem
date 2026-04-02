import { useState } from "react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { Calendar as CalendarIcon, CheckCircle2, ChevronLeft, ChevronRight, User, Stethoscope, Clock, ShieldCheck } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  useListStaff, 
  useListTreatments, 
  useGetAvailableSlots, 
  useCreateBooking 
} from "@workspace/api-client-react";
import { getGetAvailableSlotsQueryKey } from "@workspace/api-client-react";

export default function Book() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [selectedDentist, setSelectedDentist] = useState<number | null>(null);
  const [selectedTreatment, setSelectedTreatment] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  // Patient details state
  const [patientDetails, setPatientDetails] = useState({
    name: "",
    phone: "",
    email: "",
    notes: ""
  });

  const { data: staff } = useListStaff();
  const dentists = staff?.filter(s => s.role === "dentist" && s.isActive) || [];

  const { data: treatments } = useListTreatments();
  const activeTreatments = treatments?.filter(t => t.isActive) || [];

  const formattedDate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
  const { data: slots = [], isLoading: isLoadingSlots } = useGetAvailableSlots(
    { dentistId: selectedDentist!, date: formattedDate },
    { query: { enabled: !!selectedDentist && !!formattedDate, queryKey: getGetAvailableSlotsQueryKey({ dentistId: selectedDentist!, date: formattedDate }) } }
  );

  const createBooking = useCreateBooking();

  const handleNext = () => {
    if (step === 1 && !selectedDentist) return toast({ title: "Select a dentist", variant: "destructive" });
    if (step === 2 && !selectedTreatment) return toast({ title: "Select a treatment", variant: "destructive" });
    if (step === 3 && (!selectedDate || !selectedTime)) return toast({ title: "Select date and time", variant: "destructive" });
    
    if (step === 4) {
      if (!patientDetails.name || !patientDetails.phone) {
        return toast({ title: "Please fill in required fields", variant: "destructive" });
      }
      submitBooking();
      return;
    }
    
    setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => Math.max(1, s - 1));

  const submitBooking = () => {
    createBooking.mutate({
      data: {
        name: patientDetails.name,
        phone: patientDetails.phone,
        email: patientDetails.email || undefined,
        dentistId: selectedDentist!,
        treatmentId: selectedTreatment!,
        date: formattedDate,
        startTime: selectedTime!,
        notes: patientDetails.notes || undefined
      }
    }, {
      onSuccess: () => {
        setStep(5); // Success screen
        window.scrollTo(0,0);
      },
      onError: () => {
        toast({ title: "Failed to book appointment", description: "Please try again later.", variant: "destructive" });
      }
    });
  };

  const currentDentist = dentists.find(d => d.id === selectedDentist);
  const currentTreatment = activeTreatments.find(t => t.id === selectedTreatment);

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-4rem)] bg-muted/20">
      <div className="container px-4 md:px-6 py-12 max-w-4xl mx-auto flex-1 flex flex-col">
        
        {step < 5 && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-6">Book an Appointment</h1>
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border -z-10 rounded-full"></div>
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 rounded-full transition-all duration-300"
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              ></div>
              
              {[
                { num: 1, label: "Dentist", icon: <User className="w-4 h-4" /> },
                { num: 2, label: "Service", icon: <Stethoscope className="w-4 h-4" /> },
                { num: 3, label: "Time", icon: <Clock className="w-4 h-4" /> },
                { num: 4, label: "Details", icon: <ShieldCheck className="w-4 h-4" /> }
              ].map((s) => (
                <div key={s.num} className="flex flex-col items-center gap-2 bg-muted/20 px-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2
                    ${step > s.num ? 'bg-primary text-white border-primary' : 
                      step === s.num ? 'bg-primary text-white border-primary shadow-md' : 'bg-background text-muted-foreground border-border'}`}
                  >
                    {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.icon}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${step >= s.num ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden flex-1">
          {step === 1 && (
            <div className="p-6 md:p-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-bold mb-6">Select a Dentist</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {dentists.map((dentist) => (
                  <Card 
                    key={dentist.id} 
                    className={`cursor-pointer transition-all border-2 ${selectedDentist === dentist.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                    onClick={() => setSelectedDentist(dentist.id)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg overflow-hidden shrink-0">
                        {dentist.avatarUrl ? <img src={dentist.avatarUrl} alt={dentist.name} className="w-full h-full object-cover"/> : dentist.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold">{dentist.name}</h3>
                        <p className="text-xs text-muted-foreground">{dentist.qualification || "Dental Surgeon"}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="p-6 md:p-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-bold mb-6">Select a Service</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {activeTreatments.map((treatment) => (
                  <Card 
                    key={treatment.id} 
                    className={`cursor-pointer transition-all border-2 ${selectedTreatment === treatment.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                    onClick={() => setSelectedTreatment(treatment.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold">{treatment.name}</h3>
                        <span className="text-sm font-semibold text-primary">${treatment.startingPrice}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{treatment.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="p-6 md:p-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-bold mb-6">Select Date & Time</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <Label className="mb-3 block text-base">Select Date</Label>
                  <div className="border rounded-xl p-2 bg-white flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        setSelectedTime(null);
                      }}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0,0,0,0);
                        return date < today || date.getDay() === 0; // Disable past and Sundays
                      }}
                      className="rounded-md"
                    />
                  </div>
                </div>
                <div>
                  <Label className="mb-3 block text-base">Select Time</Label>
                  {!selectedDate ? (
                    <div className="h-[300px] border border-dashed rounded-xl flex items-center justify-center text-muted-foreground text-sm bg-muted/10">
                      Please select a date first
                    </div>
                  ) : isLoadingSlots ? (
                    <div className="h-[300px] border rounded-xl flex items-center justify-center text-muted-foreground text-sm">
                      Loading available slots...
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="h-[300px] border border-dashed rounded-xl flex items-center justify-center text-muted-foreground text-sm bg-muted/10">
                      No slots available for this date.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {slots.map((slot) => (
                        <Button
                          key={slot.time}
                          variant={selectedTime === slot.time ? "default" : "outline"}
                          className={`justify-center font-medium ${!slot.available && 'opacity-50 cursor-not-allowed'}`}
                          disabled={!slot.available}
                          onClick={() => setSelectedTime(slot.time)}
                        >
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="p-6 md:p-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-bold mb-6">Your Details</h2>
              <div className="grid md:grid-cols-[1fr_300px] gap-8">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                    <Input 
                      id="name" 
                      value={patientDetails.name} 
                      onChange={e => setPatientDetails({...patientDetails, name: e.target.value})} 
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
                    <Input 
                      id="phone" 
                      value={patientDetails.phone} 
                      onChange={e => setPatientDetails({...patientDetails, phone: e.target.value})} 
                      placeholder="+60 12 345 6789"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address (Optional)</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={patientDetails.email} 
                      onChange={e => setPatientDetails({...patientDetails, email: e.target.value})} 
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea 
                      id="notes" 
                      value={patientDetails.notes} 
                      onChange={e => setPatientDetails({...patientDetails, notes: e.target.value})} 
                      placeholder="Any specific concerns?"
                      className="resize-none"
                    />
                  </div>
                </div>

                <div className="bg-muted/30 rounded-xl p-6 h-fit border">
                  <h3 className="font-bold mb-4">Summary</h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <span className="text-muted-foreground block text-xs">Dentist</span>
                      <span className="font-medium">{currentDentist?.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">Treatment</span>
                      <span className="font-medium">{currentTreatment?.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">Date & Time</span>
                      <span className="font-medium">{formattedDate} at {selectedTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="p-12 text-center flex flex-col items-center animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Booking Confirmed!</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8 text-lg">
                Your appointment with {currentDentist?.name} has been successfully scheduled for {formattedDate} at {selectedTime}.
              </p>
              <div className="bg-muted/30 border rounded-xl p-6 w-full max-w-sm mb-8 text-left">
                <p className="text-sm text-muted-foreground mb-1">Confirmation Number</p>
                <p className="font-mono text-xl font-bold tracking-widest text-primary">SC-{Math.floor(Math.random()*10000).toString().padStart(4, '0')}</p>
              </div>
              <Button onClick={() => setLocation("/")} size="lg">Return to Home</Button>
            </div>
          )}

          {step < 5 && (
            <div className="p-6 border-t bg-muted/10 flex justify-between items-center">
              {step > 1 ? (
                <Button variant="outline" onClick={handleBack}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              ) : <div></div>}
              
              <Button onClick={handleNext} disabled={createBooking.isPending} data-testid="button-book-next">
                {createBooking.isPending ? "Confirming..." : step === 4 ? "Confirm Booking" : "Next Step"}
                {step < 4 && <ChevronRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
