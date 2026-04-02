import { useListTreatments } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

export default function Services() {
  const { data: treatments, isLoading } = useListTreatments();

  const activeTreatments = treatments?.filter(t => t.isActive) || [];

  return (
    <div className="flex flex-col w-full pb-20">
      <div className="bg-muted/30 py-16 border-b border-border/50">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Our Services</h1>
            <p className="text-xl text-muted-foreground">
              Comprehensive, high-quality dental care tailored to your needs.
            </p>
          </div>
        </div>
      </div>

      <div className="container px-4 md:px-6 mt-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="border border-border">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTreatments.map((treatment) => (
              <Link key={treatment.id} href={`/services/${treatment.id}`}>
                <Card className="h-full border border-border shadow-sm hover:shadow-md hover:border-primary/40 transition-all group cursor-pointer">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{treatment.name}</h3>
                      <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                        {treatment.category}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm flex-1 mb-6 line-clamp-3">
                      {treatment.description || "Professional dental treatment provided by our expert team."}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Starting from</span>
                        <span className="font-semibold text-lg">${treatment.startingPrice.toFixed(2)}</span>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
