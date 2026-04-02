import { useListStaff } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  const { data: staff, isLoading } = useListStaff();

  const dentists = staff?.filter(s => s.role === "dentist") || [];

  return (
    <div className="flex flex-col w-full pb-20">
      <div className="bg-muted/30 py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">About SmileCare</h1>
            <p className="text-xl text-muted-foreground">
              Redefining the dental experience with modern technology, expert care, and a patient-first approach.
            </p>
          </div>
        </div>
      </div>

      <div className="container px-4 md:px-6 mt-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img 
              src="/images/team.png" 
              alt="Our Team" 
              className="rounded-2xl shadow-lg w-full object-cover aspect-[4/3]"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Our Story</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              SmileCare Dental was founded on a simple principle: going to the dentist shouldn't be a stressful experience. We've built a clinic that prioritizes your comfort, time, and oral health.
            </p>
            <p className="text-muted-foreground leading-relaxed text-lg">
              By leveraging advanced clinical operating systems and state-of-the-art dental technology, we ensure every treatment is precise, every appointment is on time, and every patient leaves with a confident smile.
            </p>
          </div>
        </div>

        <div className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Meet Our Specialists</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our team of highly qualified dental professionals is dedicated to providing you with the best possible care.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <Card key={i} className="overflow-hidden border-none shadow-md">
                  <Skeleton className="h-64 w-full rounded-none" />
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {dentists.map((dentist) => (
                <Card key={dentist.id} className="overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-64 w-full bg-muted/50 flex items-center justify-center relative">
                    {dentist.avatarUrl ? (
                      <img src={dentist.avatarUrl} alt={dentist.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-6xl font-bold text-primary/20">{dentist.name.charAt(0)}</div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-1">{dentist.name}</h3>
                    <p className="text-primary font-medium text-sm mb-4">{dentist.qualification || "Dental Surgeon"}</p>
                    <p className="text-muted-foreground text-sm line-clamp-4">
                      {dentist.bio || "A dedicated dental professional committed to providing exceptional care and ensuring patient comfort during every visit."}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
