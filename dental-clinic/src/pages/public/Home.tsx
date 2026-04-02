import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, ShieldCheck, Clock, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full h-[600px] flex items-center bg-muted/30 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero.png" 
            alt="SmileCare Dental Clinic" 
            className="w-full h-full object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
        </div>
        
        <div className="container relative z-10 px-4 md:px-6">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary">
              Premium Private Dental Care
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
              Your perfect smile, <br/>
              <span className="text-primary">crafted with precision.</span>
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl leading-relaxed">
              Experience world-class dental care in a calm, clinical environment. We combine advanced technology with a gentle touch to give you the best possible results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/book">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base" data-testid="button-hero-book">
                  Book an Appointment <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 text-base" data-testid="button-hero-services">
                  Explore Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features / Trust Badges */}
      <section className="py-16 bg-white">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-muted/30">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Expert Specialists</h3>
              <p className="text-muted-foreground">Our team consists of highly qualified dental professionals with years of specialized experience.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-muted/30">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">No Waiting Time</h3>
              <p className="text-muted-foreground">We value your time. Our efficient clinic OS ensures you are seen exactly at your scheduled time.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-muted/30">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Advanced Tech</h3>
              <p className="text-muted-foreground">Equipped with the latest dental technology for precise diagnoses and painless treatments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Services Intro */}
      <section className="py-20 bg-muted/30 border-y border-border/50">
        <div className="container px-4 md:px-6">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Our Services</h2>
              <p className="text-muted-foreground text-lg">Comprehensive care for every dental need.</p>
            </div>
            <Link href="/services" className="hidden md:flex items-center text-primary font-medium hover:underline">
              View All Services <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {["General Dentistry", "Cosmetic Dentistry", "Orthodontics", "Implants"].map((category, i) => (
              <Link key={i} href="/services" className="group block h-full">
                <div className="bg-white p-6 rounded-xl border shadow-sm transition-all hover:shadow-md hover:border-primary/50 h-full flex flex-col">
                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{category}</h3>
                  <p className="text-sm text-muted-foreground flex-1">Professional treatments to maintain and enhance your oral health.</p>
                  <div className="mt-4 text-sm font-medium text-primary flex items-center">
                    Learn more <ArrowRight className="ml-1 h-3 w-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Patient Stories</h2>
            <p className="text-muted-foreground text-lg">Don't just take our word for it.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Sarah J.", text: "The most comfortable dental experience I've ever had. The clinic is beautiful and the staff is incredibly professional." },
              { name: "Michael T.", text: "I had my braces done here. The process was smooth, and the technology they use is top-notch. Highly recommend!" },
              { name: "Emily R.", text: "Finally found a dentist I don't dread visiting. The environment is so calming and clinical, yet welcoming." }
            ].map((testimonial, i) => (
              <div key={i} className="bg-muted/20 p-8 rounded-2xl relative">
                <div className="flex text-yellow-400 mb-4">
                  {[1,2,3,4,5].map(star => <Star key={star} className="h-5 w-5 fill-current" />)}
                </div>
                <p className="text-foreground/80 italic mb-6">"{testimonial.text}"</p>
                <p className="font-semibold">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
