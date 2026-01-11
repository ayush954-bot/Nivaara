import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Landmark,
  CheckCircle2,
} from "lucide-react";

interface CounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

function AnimatedCounter({ end, duration = 2000, suffix = "", prefix = "" }: CounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration]);

  return (
    <span className="text-4xl md:text-5xl font-bold text-primary">
      {prefix}{count}{suffix}
    </span>
  );
}

export default function TrustIndicators() {
  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-secondary/20">
      <div className="container">
        {/* Trust Counters - Only Accurate Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-12">
          <div className="text-center p-6 bg-card rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <AnimatedCounter end={20} suffix="+" />
            <div className="text-lg font-semibold text-foreground mt-2">
              Builder Partners
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Top developers across India
            </p>
          </div>

          <div className="text-center p-6 bg-card rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Landmark className="h-8 w-8 text-primary" />
            </div>
            <AnimatedCounter end={18} suffix="+" />
            <div className="text-lg font-semibold text-foreground mt-2">
              Bank Tie-ups
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Leading financial institutions
            </p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-4">
          <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
            100% Verified Properties
          </Badge>
          <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
            Transparent Pricing
          </Badge>
          <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
            Legal Documentation Support
          </Badge>
          <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
            24/7 Customer Support
          </Badge>
        </div>
      </div>
    </section>
  );
}
