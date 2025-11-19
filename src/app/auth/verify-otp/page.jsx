"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, CheckCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyOTP } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOTP] = useState(["", "", "", "", "", ""]);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Get email from URL params
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }

    // Auto-focus on first input
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }

    // Start initial countdown (60 seconds)
    setResendCountdown(60);
  }, [searchParams]);

  // Countdown timer effect
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOTP = [...otp];
    newOTP[index] = value;
    setOTP(newOTP);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Handle left arrow
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Handle right arrow
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (pastedData.length > 0) {
      const newOTP = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOTP[i] = pastedData[i];
      }
      setOTP(newOTP);
      setError("");

      // Focus the next empty input or the last one
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const otpString = otp.join("");

    if (!email || !otpString) {
      setError("Please provide both email and OTP");
      setLoading(false);
      return;
    }

    if (otpString.length !== 6 || !/^\d{6}$/.test(otpString)) {
      setError("OTP must be a 6-digit number");
      setLoading(false);
      return;
    }

    try {
      const result = await verifyOTP({ email, otp: otpString });

      if (result.success) {
        toast.success(result.message || "Email verified successfully!");
        router.push("/dashboard");
      } else {
        setError(result.message || "Invalid or expired OTP");
      }
    } catch (err) {
      setError("An error occurred during verification");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setResendLoading(true);
    setError("");

    try {
      const response = await authService.resendOTP(email);

      if (response.success) {
        toast.success("New OTP sent to your email!");
        // Clear existing OTP inputs
        setOTP(["", "", "", "", "", ""]);
        // Reset countdown to 60 seconds
        setResendCountdown(60);
        // Focus first input
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      } else {
        toast.error(response.message || "Failed to resend OTP");
      }
    } catch (err) {
      toast.error(err.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            We&apos;ve sent a 6-digit verification code to your email address
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                required
                disabled={loading || !!searchParams.get("email")}
                className={searchParams.get("email") ? "bg-muted" : ""}
              />
              {searchParams.get("email") && (
                <p className="text-xs text-muted-foreground">
                  Email from registration
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="otp-0" className="text-center block">
                Verification Code
              </Label>
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={loading}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 focus:border-primary transition-colors"
                    aria-label={`Digit ${index + 1}`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Check your email inbox for the verification code
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <div className="text-sm text-blue-900 dark:text-blue-100">
                  <p className="font-medium mb-1">Important:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
                    <li>Code expires in 10 minutes</li>
                    <li>Check spam folder if not received</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Resend OTP Section */}
            <div className="flex items-center justify-center gap-2">
              <p className="text-sm text-muted-foreground">
                Didn&apos;t receive the code?
              </p>
              {resendCountdown > 0 ? (
                <p className="text-sm font-medium text-muted-foreground">
                  Resend in {resendCountdown}s
                </p>
              ) : (
                <Button
                  type="button"
                  variant="link"
                  onClick={handleResendOTP}
                  disabled={resendLoading || !email}
                  className="p-0 h-auto font-semibold"
                >
                  {resendLoading ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Resend OTP"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 mt-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Verify Email"}
            </Button>

            <div className="flex items-center justify-between w-full text-sm">
              <Link
                href="/auth/register"
                className="text-muted-foreground hover:text-primary flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to register
              </Link>
              <Link href="/auth/login" className="text-primary hover:underline">
                Already verified? Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
