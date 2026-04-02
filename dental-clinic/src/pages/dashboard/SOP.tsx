import { useState } from "react";
import { useListSOPs, getListSOPsQueryKey } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, BookOpen, CheckCircle } from "lucide-react";

export default function SOP() {
  const [search, setSearch] = useState("");
  const { data: sopsResponse, isLoading } = useListSOPs({
    query: { queryKey: getListSOPsQueryKey() }
  });

  const sops = Array.isArray(sopsResponse) ? sopsResponse : (sopsResponse as any)?.sops || [];

  const filteredSOPs = sops.filter((sop: any) => 
    sop.title.toLowerCase().includes(search.toLowerCase()) || 
    sop.category.toLowerCase().includes(search.toLowerCase())
  );

  // Group by category
  const grouped = filteredSOPs.reduce((acc: any, sop: any) => {
    if (!acc[sop.category]) acc[sop.category] = [];
    acc[sop.category].push(sop);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clinical SOPs</h1>
          <p className="text-muted-foreground">Standard Operating Procedures and clinical guidelines.</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search procedures, categories..." 
          className="pl-10 h-10 bg-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Card><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
          <Card><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-20 bg-white border border-dashed rounded-xl">
          <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No SOPs found</h3>
          <p className="text-muted-foreground">Try a different search term.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, items]: [string, any]) => (
            <div key={category} className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2 border-b pb-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary">{items.length}</Badge>
                {category}
              </h2>
              
              <Accordion type="multiple" className="space-y-3">
                {items.map((sop: any) => (
                  <AccordionItem key={sop.id} value={`sop-${sop.id}`} className="bg-white border rounded-lg px-2 shadow-sm">
                    <AccordionTrigger className="hover:no-underline px-4 py-4 text-left">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-base">{sop.title}</span>
                        {sop.tags && (
                          <div className="flex gap-1.5 mt-1">
                            {sop.tags.map((tag: string) => (
                              <span key={tag} className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-0">
                      <div className="border-t pt-4 text-sm text-foreground/90">
                        <p className="mb-6 whitespace-pre-wrap">{sop.content}</p>
                        
                        {sop.steps && sop.steps.length > 0 && (
                          <div className="space-y-3 bg-muted/20 p-4 rounded-lg border">
                            <h4 className="font-semibold text-foreground mb-3 flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-primary" /> Step-by-Step Procedure</h4>
                            <div className="space-y-3 pl-1">
                              {sop.steps.map((step: string, idx: number) => (
                                <div key={idx} className="flex gap-3">
                                  <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                    {idx + 1}
                                  </div>
                                  <p className="pt-0.5">{step}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
