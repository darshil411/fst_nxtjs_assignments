// app/page.tsx
// Landing page — redirects authenticated users to dashboard

import Link from "next/link";
import { ArrowRight, Shield, Zap, BarChart3, Lock } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Navigation */}
      <nav className="border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-2xl bg-primary flex items-center justify-center shadow-sm shadow-primary/20">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-foreground font-bold text-xl tracking-tight">TxnManager</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground text-sm font-semibold transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm shadow-primary/20 transition-all hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero - Split Layout */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:py-32 flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-secondary/60 border border-secondary rounded-full px-4 py-1.5 mb-8 shadow-sm">
            <Shield className="h-4 w-4 text-secondary-foreground/80" />
            <span className="text-secondary-foreground text-sm font-medium tracking-wide">Enterprise-Grade Security</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground tracking-tight mb-8 leading-[1.1]">
            Multi-Tenant <br className="hidden lg:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff9a9e] to-[#fecfef]">
              Transaction
            </span>{" "}
            Management
          </h1>

          <p className="text-muted-foreground text-xl lg:text-2xl max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed font-light">
            A production-quality system demonstrating Prisma ORM, PostgreSQL, Better Auth, 
            role-based access control, and protected APIs with a soft touch.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 rounded-2xl shadow-lg shadow-primary/25 transition-all hover:-translate-y-1"
            >
              Create Account
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full sm:w-auto gap-2 bg-card hover:bg-muted border border-border text-foreground font-semibold px-8 py-4 rounded-2xl shadow-sm transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
        
        {/* Decorative Visual Element for Right Column */}
        <div className="flex-1 w-full max-w-md lg:max-w-none relative">
          <div className="aspect-square rounded-[3rem] bg-gradient-to-tr from-secondary to-muted opacity-80 rotate-6 shadow-2xl shadow-secondary/50 absolute inset-0 -z-10"></div>
          <div className="aspect-square rounded-[3rem] bg-card border border-border p-8 shadow-xl flex flex-col gap-6 relative">
             <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex flex-col gap-1">
                  <div className="w-24 h-4 bg-muted rounded-full"></div>
                  <div className="w-32 h-6 bg-secondary rounded-full mt-2"></div>
                </div>
                <div className="w-12 h-12 bg-success-muted rounded-2xl flex items-center justify-center">
                  <Zap className="h-6 w-6 text-success" />
                </div>
             </div>
             <div className="flex-1 flex flex-col gap-4">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="w-full bg-muted/50 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-secondary/80"></div>
                       <div className="flex flex-col gap-2">
                         <div className="w-20 h-3 bg-muted-foreground/30 rounded-full"></div>
                         <div className="w-16 h-2 bg-muted-foreground/20 rounded-full"></div>
                       </div>
                    </div>
                    <div className="w-16 h-4 bg-primary/40 rounded-full"></div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </section>

      {/* Features - Bento Grid */}
      <section className="mx-auto max-w-7xl px-6 pb-32 pt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-card border border-border/80 rounded-[2rem] p-8 shadow-lg shadow-muted/50 hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col"
            >
              <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center mb-6 shadow-inner">
                <feature.icon className="h-7 w-7 text-secondary-foreground" />
              </div>
              <h3 className="text-foreground text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed flex-grow">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12">
        <p className="text-center text-muted-foreground text-sm font-medium">
          TxnManager — Academic Assignment Demonstration &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: Shield,
    title: "Role-Based Access Control",
    description: "ADMIN and MEMBER roles with server-side enforcement at every layer.",
  },
  {
    icon: Lock,
    title: "Better Auth Sessions",
    description: "Secure session management with cookie-based authentication and Prisma adapter.",
  },
  {
    icon: Zap,
    title: "Protected APIs & Actions",
    description: "Route handlers and Server Actions independently validate auth and roles.",
  },
  {
    icon: BarChart3,
    title: "Audit Logging & Email",
    description: "Every mutation creates an audit trail and sends a Resend transactional email.",
  },
];
