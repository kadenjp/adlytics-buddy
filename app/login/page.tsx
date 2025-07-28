'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import { Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const { signIn, isAuthenticated, loading: authLoading } = useAuth();

    // Redirect to dashboard after auth state confirms user is signed in
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            router.push('/dashboard');
        }
    }, [authLoading, isAuthenticated, router]);

    // Show loading state while checking authentication
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/5 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render login form if already authenticated
    if (!authLoading && isAuthenticated) {
        return null;
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const { error } = await signIn(email, password);

            if (error) {
                setError(error.message);
                setLoading(false);
                return;
            }

            // Successfully logged in, redirect to dashboard
            router.push("/dashboard");
        } catch {
            setError("An unexpected error occurred. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/5">
            <Navigation />

            <div className="container mx-auto px-4 py-16">
                <div className="max-w-md mx-auto">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Zap className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold">Welcome Back</h1>
                        <p className="text-muted-foreground mt-2">
                            Sign in to your AdsCampaign account
                        </p>
                    </div>

                    <Card className="shadow-elegant">
                        <CardHeader>
                            <CardTitle>Sign In</CardTitle>
                            <CardDescription>
                                Enter your credentials to access your dashboard
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleLogin} className="space-y-4">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={loading}
                                    variant="cta"
                                    size="lg"
                                >
                                    {loading ? "Signing In..." : "Sign In"}
                                </Button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-muted-foreground">
                                    Don't have an account?{" "}
                                    <Link href="/signup" className="text-primary hover:underline">
                                        Get started here
                                    </Link>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
