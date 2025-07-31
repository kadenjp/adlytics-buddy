'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Target, Zap, TrendingUp, DollarSign, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const LandingPage = () => {
  const router = useRouter();
  const features = [
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Quick Setup",
      description: "Create professional Google Ads campaigns in just 15 minutes with our guided builder."
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "AI-Powered Targeting",
      description: "Smart keyword suggestions and audience targeting based on your business type and goals."
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Business-Focused Metrics",
      description: "Track calls, leads, and revenue without confusing advertising jargon."
    },
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: "Low Upfront Costs",
      description: "Get your first 3 Months for just $149 + Advertising Fees. No long-term contracts required."
    }
  ];

  const benefits = [
    "Professional Google Ads campaigns without the complexity",
    "AI-powered keyword research and optimization",
    "Real-time performance tracking and insights",
    "Mobile-responsive campaign management",
    "Expert support when you need it",
    "No long-term contracts"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">AdsCampaign</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button variant="cta">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-accent/20 to-primary/5">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  🚀 No Advertising Budget Required to Start
                </Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Professional <span className="bg-gradient-hero bg-clip-text text-transparent">Google Ads</span> Without the Complexity
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Create and manage high-converting Google Ads campaigns in just 15 minutes.
                  Start with our $150/month platform fee and configure your advertising budget when you're ready.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="hero"
                  size="lg"
                  className="text-lg px-8 py-6 h-auto"
                  onClick={() => router.push('/signup')}
                >
                  Start Building Campaigns
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 h-auto">
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>No setup fees</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Cancel anytime</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Expert support</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <Image
                  src="/hero-image.jpg"
                  alt="Google Ads Campaign Builder Dashboard"
                  width={600}
                  height={400}
                  className="rounded-xl shadow-elegant hover:shadow-glow transition-all duration-500 transform hover:scale-105"
                  priority
                />
              </div>
              <div className="absolute inset-0 bg-gradient-primary opacity-20 rounded-xl blur-3xl transform scale-110"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-card">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform makes Google Ads accessible for small businesses without sacrificing performance or results.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4 text-white">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground">
              Start building campaigns today. Set your advertising budget when you're ready to launch.
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <Card className="border-2 border-primary shadow-elegant relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-primary"></div>
              <CardHeader className="text-center space-y-4 pt-8">
                <div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Most Popular
                  </Badge>
                </div>
                <CardTitle className="text-2xl">Platform Access</CardTitle>
                <div className="space-y-2">
                  <div className="text-4xl font-bold">$150<span className="text-xl text-muted-foreground">/month</span></div>
                  <CardDescription className="text-base">
                    Platform subscription only - no advertising budget required
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
                <Button
                  variant="cta"
                  size="lg"
                  className="w-full text-lg py-6 h-auto"
                  onClick={() => router.push('/signup')}
                >
                  Start Your Trial
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  7-day free trial • No credit card required
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center space-y-8 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Grow Your Business?
            </h2>
            <p className="text-xl opacity-90 leading-relaxed">
              Join thousands of small businesses already using our platform to create successful Google Ads campaigns
              without the complexity and confusion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="secondary"
                size="lg"
                className="text-lg px-8 py-6 h-auto"
                onClick={() => router.push('/signup')}
              >
                Get Started Now
              </Button>
              <Button variant="secondary" size="lg" className="text-lg px-8 py-6 h-auto">
                Schedule Demo
              </Button>
              <iframe src="https://docs.google.com/forms/d/e/1FAIpQLScUWtki3mw2r53ZZggQ911vHt8Vuk0v7kiLJEfL7P1B31kObg/viewform?embedded=true" width="640" height="856" frameBorder="0" marginheight="0" marginwidth="0">Loading…</iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">AdsCampaign</span>
              </div>
              <p className="text-muted-foreground">
                Making Google Ads accessible for small businesses everywhere.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Product</h4>
              <div className="space-y-2 text-muted-foreground">
                <div>Campaign Builder</div>
                <div>Performance Reports</div>
                <div>Keyword Research</div>
                <div>Budget Management</div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Support</h4>
              <div className="space-y-2 text-muted-foreground">
                <div>Help Center</div>
                <div>Contact Us</div>
                <div>Getting Started</div>
                <div>API Documentation</div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Company</h4>
              <div className="space-y-2 text-muted-foreground">
                <div>About Us</div>
                <div>Privacy Policy</div>
                <div>Terms of Service</div>
                <div>Contact</div>
              </div>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 AdsCampaign. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;