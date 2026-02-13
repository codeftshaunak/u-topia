export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
const logoLight = "/u-topia-logo-light.png";
import {
  Eye,
  EyeOff,
  Mail,
  User,
  Phone,
  Lock,
  ArrowRight,
  Loader2,
  ArrowLeft,
  X,
} from "lucide-react";

type AuthMode = "signin" | "signup" | "forgot";

interface SavedAccount {
  email: string;
  password: string;
}

const REMEMBERED_CREDENTIALS_KEY = "utopia_remembered_accounts";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [referralError, setReferralError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
  const [showSavedAccounts, setShowSavedAccounts] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
  });

  // Track if user is actively submitting the form - prevents redirect on token refresh
  const isSubmittingRef = useRef(false);
  const emailInputRef = useRef<HTMLDivElement>(null);

  // Load saved accounts on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBERED_CREDENTIALS_KEY);
      if (saved) {
        const accounts: SavedAccount[] = JSON.parse(saved);
        setSavedAccounts(accounts);
      }
    } catch (e) {
      console.error("Failed to load saved accounts:", e);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emailInputRef.current &&
        !emailInputRef.current.contains(event.target as Node)
      ) {
        setShowSavedAccounts(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check for forgot mode from URL params
  useEffect(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam === "forgot") {
      setMode("forgot");
    }
  }, [searchParams]);

  // Auth state is managed by AuthContext, redirect after successful sign in
  const { user } = useAuth();
  useEffect(() => {
    if (user && isSubmittingRef.current) {
      isSubmittingRef.current = false;
      navigate("/explore");
    }
  }, [user, navigate]);

  // Check for referral code in URL
  const referralCode = searchParams.get("ref");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = (): boolean => {
    if (mode === "forgot") {
      if (!formData.email || !formData.email.includes("@")) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        return false;
      }
      return true;
    }

    if (!formData.email || !formData.email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.password || formData.password.length < 6) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return false;
    }

    if (mode === "signup" && !formData.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your full name.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleForgotPassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email.trim().toLowerCase() }),
      });

      // Always show generic success message for security (don't reveal if email exists)
      toast({
        title: "Check Your Email",
        description:
          "If an account exists for this email, we've sent a password reset link.",
      });

      // Go back to sign in
      setMode("signin");
    } catch (err) {
      console.error("Forgot password error:", err);
      toast({
        title: "Something Went Wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "forgot") {
      await handleForgotPassword();
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);
    isSubmittingRef.current = true;

    try {
      if (mode === "signup") {
        // Sign up using the custom auth context
        await signUp(
          formData.email.trim().toLowerCase(),
          formData.password,
          formData.name.trim(),
          formData.mobile.trim(),
        );

        // If there's a referral code, mark it as used
        if (referralCode) {
          try {
            const response = await fetch("/api/referrals/use-code", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                code: referralCode,
                email: formData.email.trim().toLowerCase(),
              }),
            });

            const refData = await response.json();

            if (!response.ok || !refData.success) {
              // Check for specific error messages
              if (refData.error?.includes("cannot refer yourself")) {
                setReferralError("You cannot use your own referral code.");
              } else if (
                refData.error?.includes("Invalid or expired") ||
                refData.error?.includes("already")
              ) {
                setReferralError(
                  "This referral code has already been used or is invalid.",
                );
              } else if (refData.error?.includes("already been referred")) {
                setReferralError(
                  "This email has already been referred by another user.",
                );
              } else {
                setReferralError(
                  refData.error || "Failed to process referral code.",
                );
              }
            }
          } catch (refError) {
            console.error("Error processing referral:", refError);
            setReferralError("Failed to process referral code.");
          }
        }

        toast({
          title: "Welcome to U-topia!",
          description: "Your account has been created successfully.",
        });
      } else {
        // Sign in using the custom auth context
        await signIn(formData.email.trim().toLowerCase(), formData.password);

        // Save or update remembered accounts based on checkbox
        if (rememberMe) {
          const email = formData.email.trim().toLowerCase();
          const password = formData.password;

          const existingIndex = savedAccounts.findIndex(
            (acc) => acc.email === email,
          );
          let updatedAccounts: SavedAccount[];

          if (existingIndex >= 0) {
            updatedAccounts = [...savedAccounts];
            updatedAccounts[existingIndex] = { email, password };
          } else {
            updatedAccounts = [...savedAccounts, { email, password }];
          }

          localStorage.setItem(
            REMEMBERED_CREDENTIALS_KEY,
            JSON.stringify(updatedAccounts),
          );
          setSavedAccounts(updatedAccounts);
        }

        toast({
          title: "Welcome Back!",
          description: "You have signed in successfully.",
        });
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      const errorMessage = err.message || "Please try again later.";
      toast({
        title: "Authentication Failed",
        description: errorMessage,
        variant: "destructive",
      });
      isSubmittingRef.current = false;
    } finally {
      setIsLoading(false);
    }
  };

  const isSignUp = mode === "signup";
  const isForgot = mode === "forgot";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0d1526] to-[#0a0f1a] flex flex-col">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[800px] h-[800px] -top-[400px] -right-[200px] rounded-full blur-[150px] opacity-20 bg-gradient-to-br from-primary/60 to-cyan-500/40" />
        <div className="absolute w-[600px] h-[600px] -bottom-[300px] -left-[200px] rounded-full blur-[150px] opacity-15 bg-gradient-to-tr from-cyan-500/50 to-primary/30" />
      </div>

      {/* Grid pattern */}
      <div
        className="fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Header */}
      <header className="relative z-10 p-6">
        <Link to="/" className="inline-block">
          <img src={logoLight} alt="U-topia" className="h-8 md:h-10" />
        </Link>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Referral badge */}
          {referralCode && isSignUp && (
            <div
              className={`mb-6 p-3 rounded-xl text-center ${
                referralError
                  ? "bg-red-500/10 border border-red-500/30"
                  : "bg-primary/10 border border-primary/20"
              }`}
            >
              {referralError ? (
                <p className="text-sm text-red-400">❌ {referralError}</p>
              ) : (
                <p className="text-sm text-primary">
                  🎉 You were referred! Your referral code:{" "}
                  <strong>{referralCode}</strong>
                </p>
              )}
            </div>
          )}

          {/* Card */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
            {/* Forgot Password View */}
            {isForgot ? (
              <>
                {/* Back button */}
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </button>

                {/* Title */}
                <div className="text-center mb-8">
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Forgot Password?
                  </h1>
                  <p className="text-gray-400 text-sm">
                    Enter your email and we'll send you a reset link
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-gray-300 text-sm font-medium"
                    >
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className="pl-12 py-6 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl focus:border-primary/50 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-6 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white font-semibold rounded-xl shadow-lg shadow-primary/30 transition-all group disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Send Reset Link
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
              </>
            ) : (
              <>
                {/* Toggle */}
                <div className="flex items-center justify-center gap-2 mb-8">
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    disabled={isLoading}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                      isSignUp
                        ? "bg-gradient-to-r from-primary to-orange-500 text-white shadow-lg shadow-primary/30"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Sign Up
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    disabled={isLoading}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                      !isSignUp
                        ? "bg-gradient-to-r from-primary to-orange-500 text-white shadow-lg shadow-primary/30"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Sign In
                  </button>
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {isSignUp ? "Create Your Account" : "Welcome Back"}
                  </h1>
                  <p className="text-gray-400 text-sm">
                    {isSignUp
                      ? "Join the U-topia Affiliate Program"
                      : "Sign in to access your dashboard"}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {isSignUp && (
                    <>
                      {/* Name */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="name"
                          className="text-gray-300 text-sm font-medium"
                        >
                          Full Name
                        </Label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            className="pl-12 py-6 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl focus:border-primary/50 focus:ring-primary/20"
                          />
                        </div>
                      </div>

                      {/* Mobile/Telegram */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="mobile"
                          className="text-gray-300 text-sm font-medium"
                        >
                          Mobile / Telegram
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <Input
                            id="mobile"
                            name="mobile"
                            type="text"
                            placeholder="+1 234 567 8900 or @username"
                            value={formData.mobile}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            className="pl-12 py-6 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl focus:border-primary/50 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Email */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-gray-300 text-sm font-medium"
                    >
                      Email Address
                    </Label>
                    <div className="relative" ref={emailInputRef}>
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 z-10" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        onFocus={() =>
                          !isSignUp &&
                          savedAccounts.length > 0 &&
                          setShowSavedAccounts(true)
                        }
                        disabled={isLoading}
                        autoComplete="off"
                        className="pl-12 py-6 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl focus:border-primary/50 focus:ring-primary/20"
                      />

                      {/* Saved accounts dropdown */}
                      {showSavedAccounts &&
                        savedAccounts.length > 0 &&
                        !isSignUp && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1f2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                            <div className="px-3 py-2 border-b border-white/10">
                              <p className="text-xs text-gray-400">
                                Saved accounts
                              </p>
                            </div>
                            {savedAccounts.map((account, index) => (
                              <div
                                key={account.email}
                                className="flex items-center justify-between px-3 py-3 hover:bg-white/5 cursor-pointer transition-colors group"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      email: account.email,
                                      password: account.password,
                                    }));
                                    setShowSavedAccounts(false);
                                    setRememberMe(true);
                                  }}
                                  className="flex items-center gap-3 flex-1 text-left"
                                >
                                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                    <User className="w-4 h-4 text-primary" />
                                  </div>
                                  <span className="text-sm text-white">
                                    {account.email}
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const updatedAccounts =
                                      savedAccounts.filter(
                                        (_, i) => i !== index,
                                      );
                                    localStorage.setItem(
                                      REMEMBERED_CREDENTIALS_KEY,
                                      JSON.stringify(updatedAccounts),
                                    );
                                    setSavedAccounts(updatedAccounts);
                                    if (updatedAccounts.length === 0) {
                                      setShowSavedAccounts(false);
                                    }
                                  }}
                                  className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
                                  title="Remove saved account"
                                >
                                  <X className="w-4 h-4 text-gray-400 hover:text-red-400" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-gray-300 text-sm font-medium"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className="pl-12 pr-12 py-6 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl focus:border-primary/50 focus:ring-primary/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password - Sign In only */}
                  {!isSignUp && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="remember"
                          checked={rememberMe}
                          onCheckedChange={(checked) =>
                            setRememberMe(checked === true)
                          }
                          className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label
                          htmlFor="remember"
                          className="text-sm text-gray-400 cursor-pointer hover:text-gray-300 transition-colors"
                        >
                          Remember me
                        </Label>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMode("forgot")}
                        className="text-sm text-primary hover:text-primary/80 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-6 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white font-semibold rounded-xl shadow-lg shadow-primary/30 transition-all group disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {isSignUp ? "Create Account" : "Sign In"}
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>

                {/* Terms - Sign Up only */}
                {isSignUp && (
                  <p className="mt-6 text-center text-xs text-gray-500">
                    By creating an account, you agree to our{" "}
                    <a
                      href="https://docsend.com/view/pehz2xqa23xw3pyc"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="https://docsend.com/view/3wjptrvw2c35gj8p"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Privacy Policy
                    </a>
                  </p>
                )}
              </>
            )}
          </div>

          {/* Back to home */}
          <div className="mt-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Auth;
