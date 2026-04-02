import { useListPromotions } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { format } from "date-fns";
import { Tag, CalendarIcon } from "lucide-react";

export default function Promotions() {
  const { data: promotions, isLoading } = useListPromotions({ activeOnly: true });

  const activePromotions = promotions?.filter(p => {
    if (!p.isActive) return false;
    const until = new Date(p.validUntil);
    return until >= new Date();
  }) || [];

  return (
    <div className="flex flex-col w-full pb-20">
      <div className="bg-primary/5 py-16 border-b border-primary/10">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
              <Tag className="w-4 h-4" /> Special Offers
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Current Promotions</h1>
            <p className="text-xl text-muted-foreground">
              Take advantage of our limited-time offers to get the smile you deserve.
            </p>
          </div>
        </div>
      </div>

      <div className="container px-4 md:px-6 mt-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map(i => (
              <Card key={i} className="border-none shadow-md overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <Skeleton className="h-48 md:h-auto md:w-1/3 rounded-none" />
                  <CardContent className="p-6 md:w-2/3 space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-10 w-32 mt-4" />
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        ) : activePromotions.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed">
            <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-semibold mb-2">No active promotions</h2>
            <p className="text-muted-foreground mb-6">Check back later for new offers and discounts.</p>
            <Link href="/services">
              <Button>Explore Services</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activePromotions.map((promo) => (
              <Card key={promo.id} className="overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row h-full">
                  <div className="bg-primary/10 md:w-2/5 p-6 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-border/50">
                    <div className="text-4xl font-black text-primary mb-2">
                      {promo.discountType === "percentage" ? `${promo.discountValue}%` : `$${promo.discountValue}`}
                    </div>
                    <div className="text-sm font-bold text-primary/80 uppercase tracking-wider">OFF</div>
                  </div>
                  <CardContent className="p-6 md:w-3/5 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold mb-3">{promo.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {promo.description || "Special discount on selected treatments."}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground mb-6 font-medium bg-muted/50 w-fit px-3 py-1.5 rounded-md">
                      <CalendarIcon className="w-3.5 h-3.5 mr-2" />
                      Valid until {format(new Date(promo.validUntil), "MMM d, yyyy")}
                    </div>
                    <div className="mt-auto">
                      <Link href={`/book?promo=${promo.id}`}>
                        <Button className="w-full sm:w-auto" data-testid={`button-claim-promo-${promo.id}`}>
                          Claim Offer
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
