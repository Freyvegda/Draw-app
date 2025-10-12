"use client";

import { Button } from "@/components/button";
import { ArrowRight, Users, Zap, Sparkles } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Index = () => {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-orange-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-6 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Create Together,
                <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  In Real Time
                </span>
              </h1>
              <p className="text-xl text-muted-foreground font-semibold leading-relaxed">
                A multiplayer canvas where ideas come to life. Draw, design, and collaborate with your team in real-time. No limits, just creativity.
              </p>
              <div className="flex flex-col sm:flex-row w-full  ">
                <Button variant="hero" size="lg" onClick={() => router.push('/signin')} className="w-full sm: w-auto px-8 font-bold text-lg">
                  Start Creating
                  <ArrowRight className="ml-2" />
                </Button>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
                <Image
                  src="/image.png"
                  alt="Collaboration Illustration"
                  className="w-full h-auto rounded-3xl shadow-[var(--shadow-soft)]"
                  width={600}
                  height={400}
                  priority
                />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Built for Creative Teams
            </h2>
            <p className="text-xl font-semibold text-muted-foreground max-w-2xl mx-auto">
              Everything you need to brainstorm, design, and create together.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card rounded-2xl p-8 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-glow)] transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6">
                <Users className="text-primary-foreground" size={28} />
              </div>
              <h3 className="text-3xl font-semibold mb-3">Real-Time Sync</h3>
              <p className="text-muted-foreground leading-relaxed font-semibold">
                See every stroke, every change, instantly. Watch your team&#39;s creativity unfold in real-time.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card rounded-2xl p-8 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-glow)] transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6">
                <Zap className="text-primary-foreground" size={28} />
              </div>
              <h3 className="text-3xl font-semibold mb-3">Lightning Fast</h3>
              <p className="text-muted-foreground leading-relaxed font-semibold">
                Built for speed. No lag, no delays. Just smooth, responsive collaboration that keeps up with your ideas.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card rounded-2xl p-8 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-glow)] transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6">
                <Sparkles className="text-primary-foreground" size={28} />
              </div>
              <h3 className="text-3xl font-semibold mb-3">Build/Join rooms </h3>
              <p className="text-muted-foreground leading-relaxed font-semibold">
                Join the rooms that matter to you. Create public rooms to collaborate with your team or the world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-br from-primary to-accent rounded-3xl p-12 lg:p-16 text-center shadow-[var(--shadow-glow)]">
            <h2 className="text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
              Ready to Create Magic?
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Join thousands of creative teams already collaborating on our canvas.
            </p>
            <Button
              size="lg"
              variant="outline"
              className="bg-background text-primary hover:bg-background/90 border-2 border-background"
              onClick={()=> router.push('/signin')}
            >
              Get Started Free
              <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
