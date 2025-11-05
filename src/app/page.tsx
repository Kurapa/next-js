// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sprout, Mail, Lock, Eye, EyeOff, ArrowRight, Leaf, Loader2, Smartphone } from "lucide-react";
import LogoLoading from "@/components/ui/LogoLoading";
import PhoneSignup from "@/components/auth/PhoneSignup";
import ForgotPassword from "@/components/auth/ForgotPassword";
import { useAuth } from "@/app/contexts/AuthContext";

type AuthView = "login" | "signup" | "phone" | "forgot";

export default function Home() {
  const router = useRouter();
  const { user, signUp, signIn, signInWithGoogle, signInWithGithub } = useAuth();
  
  const [showLoading, setShowLoading] = useState(true);
  const [view, setView] = useState<AuthView>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (view === "signup") {
        await signUp(formData.email, formData.password, formData.name);
      } else {
        await signIn(formData.email, formData.password);
      }
      // Redirect will happen automatically via useEffect
    } catch (error: any) {
      setError(error.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      setError(error.message || "Failed to sign in with Google.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGithubSignIn = async () => {
    setError("");
    setIsSubmitting(true);
    try {
      await signInWithGithub();
    } catch (error: any) {
      setError(error.message || "Failed to sign in with GitHub.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showLoading) {
    return <LogoLoading onComplete={() => setShowLoading(false)} />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "4s" }}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "6s", animationDelay: "1s" }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "8s", animationDelay: "2s" }}></div>
      </div>

      {/* Floating leaves animation */}
      <div className="absolute inset-0 pointer-events-none">
        <Leaf className="absolute top-1/4 left-1/4 text-emerald-300/30 w-8 h-8 animate-float" style={{ animationDelay: "0s" }} />
        <Leaf className="absolute top-3/4 right-1/4 text-green-300/30 w-6 h-6 animate-float" style={{ animationDelay: "2s" }} />
        <Leaf className="absolute bottom-1/4 left-3/4 text-teal-300/30 w-10 h-10 animate-float" style={{ animationDelay: "4s" }} />
      </div>

      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center relative z-10 animate-slide-up">
        {/* Left side - Brand & Info */}
        <div className="hidden lg:flex flex-col justify-center space-y-8 p-8">
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <Sprout className="w-12 h-12 text-emerald-600" strokeWidth={1.5} />
              </div>
              <h1 className="text-4xl font-bold text-emerald-900">AgroConnect</h1>
            </div>
            <p className="text-xl text-emerald-700 font-medium">
              Cultivating Tomorrow's Agriculture
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Join thousands of farmers and agribusinesses transforming the way we grow, connect, and thrive together.
            </p>
          </div>

          {/* Feature cards */}
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            {[
              { title: "Smart Farming", desc: "AI-powered crop management" },
              { title: "Market Connect", desc: "Direct access to buyers" },
              { title: "Expert Advice", desc: "24/7 agricultural support" },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-emerald-100 hover:border-emerald-300 transition-all hover:shadow-lg group"
              >
                <h3 className="font-semibold text-emerald-800 group-hover:text-emerald-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Auth Forms */}
        <div className="w-full max-w-md mx-auto animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20">
            {/* Mobile logo */}
            <div className="lg:hidden flex justify-center mb-6">
              <div className="bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl p-4 shadow-lg">
                <Sprout className="w-10 h-10 text-white" strokeWidth={1.5} />
              </div>
            </div>

            {/* Render different views */}
            {view === "phone" ? (
              <PhoneSignup
                onSuccess={() => router.push("/dashboard")}
                onBack={() => setView("signup")}
              />
            ) : view === "forgot" ? (
              <ForgotPassword onBack={() => setView("login")} />
            ) : (
              <>
                {/* Header */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {view === "signup" ? "Get Started" : "Welcome Back"}
                  </h2>
                  <p className="text-gray-600">
                    {view === "signup" ? "Create your account today" : "Enter your credentials to continue"}
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm animate-slide-up">
                    {error}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {view === "signup" && (
                    <div className="animate-slide-up">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white/50"
                        placeholder="John Doe"
                        required={view === "signup"}
                        disabled={isSubmitting}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white/50"
                        placeholder="you@example.com"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white/50"
                        placeholder="••••••••"
                        required
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isSubmitting}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {view === "login" && (
                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                        <span className="text-gray-600">Remember me</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setView("forgot")}
                        className="text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {view === "signup" ? "Creating account..." : "Signing in..."}
                      </>
                    ) : (
                      <>
                        {view === "signup" ? "Create Account" : "Sign In"}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                {/* Phone signup option */}
                {view === "signup" && (
                  <button
                    onClick={() => setView("phone")}
                    disabled={isSubmitting}
                    className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 border-2 border-emerald-200 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-all font-medium disabled:opacity-50"
                  >
                    <Smartphone className="w-5 h-5" />
                    Sign up with Phone Number
                  </button>
                )}

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                {/* Social login */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting}
                    className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </button>
                  <button
                    onClick={handleGithubSignIn}
                    disabled={isSubmitting}
                    className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                    </svg>
                    GitHub
                  </button>
                </div>

                {/* Toggle form */}
                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    {view === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setView(view === "login" ? "signup" : "login");
                        setError("");
                      }}
                      disabled={isSubmitting}
                      className="text-emerald-600 hover:text-emerald-700 font-semibold disabled:opacity-50"
                    >
                      {view === "login" ? "Sign up" : "Sign in"}
                    </button>
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Terms */}
          <p className="text-center text-sm text-gray-500 mt-6">
            By continuing, you agree to our{" "}
            <a href="#" className="text-emerald-600 hover:underline">Terms</a> and{" "}
            <a href="#" className="text-emerald-600 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}