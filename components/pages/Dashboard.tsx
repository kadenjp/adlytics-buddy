'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import {
  Phone,
  Users,
  DollarSign,
  Calendar,
  Plus,
  BarChart3,
  Target,
  Clock
} from "lucide-react";

const Dashboard = () => {
  const { user, signOut, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated (only after loading is complete)
  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const _handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Mock data - would come from API
  const userData = {
    name: user?.user_metadata?.owner_name || "User",
    businessName: user?.user_metadata?.business_name || "Your Business",
    subscription: {
      status: "active",
      nextBilling: "2024-02-15"
    }
  };

  const metrics = {
    calls: 42,
    visits: 156,
    costPerLead: 23.50,
    budgetUsed: 340,
    budgetTotal: 500
  };

  const campaigns = [
    {
      id: 1,
      name: "Local Restaurant Dining",
      status: "draft",
      keywords: 12,
      budget: 0,
      progress: 80
    },
    {
      id: 2,
      name: "Takeout & Delivery",
      status: "draft",
      keywords: 8,
      budget: 0,
      progress: 60
    }
  ];

  const nextSteps = [
    {
      title: "Complete campaign setup",
      description: "Finish configuring your first campaign",
      completed: false
    },
    {
      title: "Set advertising budget",
      description: "Choose your monthly advertising spend",
      completed: false
    },
    {
      title: "Launch campaigns",
      description: "Go live with your Google Ads",
      completed: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {userData.name} 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Here's what's happening with {userData.businessName}
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month's Calls</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.calls}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-success">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Website Visits</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.visits}</div>
              <p className="text-xs text-muted-foreground">
                +8% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-warning">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cost Per Lead</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.costPerLead}</div>
              <p className="text-xs text-muted-foreground">
                -15% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-accent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Used</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round((metrics.budgetUsed / metrics.budgetTotal) * 100)}%</div>
              <Progress value={(metrics.budgetUsed / metrics.budgetTotal) * 100} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                ${metrics.budgetUsed} of ${metrics.budgetTotal}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Campaigns Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Your Campaigns</span>
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Campaign
                </Button>
              </div>
              <CardDescription>
                Manage your Google Ads campaigns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{campaign.name}</h4>
                    <Badge variant="secondary" className="bg-warning/10 text-warning">
                      {campaign.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Setup Progress</span>
                      <span>{campaign.progress}%</span>
                    </div>
                    <Progress value={campaign.progress} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{campaign.keywords} keywords</span>
                    <span>Budget: {campaign.budget ? `$${campaign.budget}` : 'Not set'}</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Continue Setup
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Next Steps</span>
              </CardTitle>
              <CardDescription>
                Complete these steps to launch your campaigns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {nextSteps.map((step, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium ${step.completed
                    ? 'bg-success border-success text-white'
                    : 'border-muted-foreground text-muted-foreground'
                    }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
              <Button variant="cta" className="w-full mt-4">
                Configure Budget & Launch
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Status */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Subscription Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Platform Access - $150/month</p>
                <p className="text-sm text-muted-foreground">
                  Next billing: {userData.subscription.nextBilling}
                </p>
              </div>
              <Badge variant="outline" className="bg-success/10 text-success border-success">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;