import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const categories = ["All", "Whitening", "Braces", "Implants", "Crowns"];

const galleryImages = [
  { id: 1, category: "Whitening", title: "Professional Teeth Whitening", desc: "1 hour session" },
  { id: 2, category: "Braces", title: "Clear Aligners", desc: "14 months progress" },
  { id: 3, category: "Implants", title: "Single Tooth Implant", desc: "Front incisor replacement" },
  { id: 4, category: "Crowns", title: "Porcelain Crown", desc: "Molar restoration" },
  { id: 5, category: "Whitening", title: "Laser Whitening", desc: "45 min session" },
  { id: 6, category: "Braces", title: "Traditional Braces", desc: "24 months progress" },
];

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredImages = activeFilter === "All" 
    ? galleryImages 
    : galleryImages.filter(img => img.category === activeFilter);

  return (
    <div className="flex flex-col w-full pb-20">
      <div className="bg-muted/30 py-16">
        <div className="container px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Smile Gallery</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real results from our actual patients. See the difference professional dental care can make.
          </p>
        </div>
      </div>

      <div className="container px-4 md:px-6 mt-12">
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map(category => (
            <Badge 
              key={category}
              variant={activeFilter === category ? "default" : "outline"}
              className={`cursor-pointer px-4 py-2 text-sm ${activeFilter === category ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              onClick={() => setActiveFilter(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredImages.map((img) => (
            <div key={img.id} className="group rounded-xl overflow-hidden border shadow-sm bg-white">
              <div className="relative aspect-[4/3] bg-muted w-full overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <div className="flex h-full w-full">
                    <div className="w-1/2 bg-slate-200 flex items-center justify-center border-r border-white/50">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Before</span>
                    </div>
                    <div className="w-1/2 bg-slate-100 flex items-center justify-center">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">After</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{img.title}</h3>
                  <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">{img.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{img.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
