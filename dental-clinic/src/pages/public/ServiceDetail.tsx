import { useGetTreatment } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Clock, DollarSign, CalendarCheck } from "lucide-react";
import { getGetTreatmentQueryKey } from "@workspace/api-client-react";

export default function ServiceDetail({ id }: { id: string }) {
  const treatmentId = parseInt(id, 10);
  const { data: treatment, isLoading } = useGetTreatment(treatmentId, {
    query: {
      enabled: !isNaN(treatmentId),
      queryKey: getGetTreatmentQueryKey(treatmentId)
    }
  });

  if (isLoading) {
    return (
      <div className="container px-4 md:px-6 py-12">
        <Skeleton className="h-8 w-32 mb-8" />
        <Skeleton className="h-12 w-2/3 mb-4" />
        <Skeleton className="h-6 w-32 mb-8" />
        <div className="grid md:grid-cols-[2fr_1fr] gap-12">
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!treatment) {
    return (
      <div className="container px-4 md:px-6 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Treatment not found</h2>
        <Link href="/services">
          <Button variant="outline">Back to Services</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-20">
      <div className="bg-muted/30 py-12 border-b border-border/50">
        <div className="container px-4 md:px-6">
          <Link href="/services" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Services
          </Link>
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-none">{treatment.category}</Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">{treatment.name}</h1>
          </div>
        </div>
      </div>

      <div className="container px-4 md:px-6 mt-12">
        <div className="grid md:grid-cols-[1fr_350px] gap-12">
          <div>
            <div className="prose prose-lg max-w-none prose-p:text-muted-foreground mb-12">
              <h2 className="text-2xl font-bold text-foreground">About the Treatment</h2>
              <p>{treatment.description || "This is a comprehensive professional dental treatment designed to improve your oral health and smile aesthetics. Our experienced specialists ensure the highest standard of care using state-of-the-art equipment."}</p>
            </div>

            {treatment.faqs && treatment.faqs.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="w-full">
                  {treatment.faqs.map((faq, i) => (
                    <AccordionItem key={i} value={`item-${i}`}>
                      <AccordionTrigger className="text-left font-semibold">{faq.question}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-base">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </div>

          <div>
            <div className="bg-white border rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="text-xl font-bold mb-6">Treatment Details</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary mt-0.5">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Starting Price</p>
                    <p className="text-xl font-bold">${treatment.startingPrice.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary mt-0.5">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Est. Duration</p>
                    <p className="text-lg font-medium">{treatment.duration || 30} minutes</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <Link href={`/book?treatment=${treatment.id}`}>
                  <Button className="w-full h-12 text-base" data-testid={`button-book-${treatment.id}`}>
                    <CalendarCheck className="mr-2 h-5 w-5" />
                    Book Appointment
                  </Button>
                </Link>
                <p className="text-xs text-center text-muted-foreground mt-4">
                  No payment required to book.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
