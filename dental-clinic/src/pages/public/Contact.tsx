import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name is required." }),
  phone: z.string().min(5, { message: "Phone number is required." }),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal("")),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

export default function Contact() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof contactFormSchema>) {
    console.log(values);
    toast({
      title: "Message Sent",
      description: "We've received your message and will get back to you shortly.",
    });
    form.reset();
  }

  return (
    <div className="flex flex-col w-full pb-20">
      <div className="bg-muted/30 py-16">
        <div className="container px-4 md:px-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Contact Us</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Have a question or need to schedule an appointment? We're here to help.
          </p>
        </div>
      </div>

      <div className="container px-4 md:px-6 mt-12">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          
          <div>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Our Location</h3>
                  <p className="text-muted-foreground">123 Clinic Ave, Medical District<br/>Kuala Lumpur, 50000</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Phone & WhatsApp</h3>
                  <p className="text-muted-foreground mb-2">+60 12 345 6789</p>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" asChild>
                      <a href="tel:+60123456789">Call Us</a>
                    </Button>
                    <Button variant="default" size="sm" className="bg-[#25D366] hover:bg-[#1ebd5a] text-white border-none" asChild>
                      <a href="https://wa.me/60123456789" target="_blank" rel="noopener noreferrer">WhatsApp</a>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Email</h3>
                  <p className="text-muted-foreground">hello@smilecare.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Opening Hours</h3>
                  <table className="w-full text-sm text-muted-foreground">
                    <tbody>
                      <tr><td className="py-1">Monday - Friday</td><td className="font-medium text-foreground text-right">9:00 AM - 6:00 PM</td></tr>
                      <tr><td className="py-1">Saturday</td><td className="font-medium text-foreground text-right">9:00 AM - 2:00 PM</td></tr>
                      <tr><td className="py-1">Sunday & Public Holidays</td><td className="font-medium text-foreground text-right">Closed</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="mt-10 rounded-2xl overflow-hidden border h-64 bg-muted flex items-center justify-center">
              {/* Map Placeholder */}
              <div className="text-center p-6">
                <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="font-medium text-muted-foreground">Interactive Map</p>
                <p className="text-xs text-muted-foreground mt-1">123 Clinic Ave, Medical District</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border shadow-sm h-fit">
            <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+60 12 345 6789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="How can we help you?" 
                          className="min-h-[120px] resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full h-12 text-base" data-testid="button-submit-contact">
                  Send Message
                </Button>
              </form>
            </Form>
          </div>

        </div>
      </div>
    </div>
  );
}
