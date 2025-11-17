"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { usersService, paymentService } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Crown,
  Star,
  Calendar,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Script from "next/script";

export default function MembershipPage() {
  const router = useRouter();
  const { user, isAuthenticated, isStaff, loading: authLoading } = useAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snapLoaded, setSnapLoaded] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      fetchUserDetails();
      return;
    }

    if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, user]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const response = await usersService.getCurrentUser();
      if (response.success && response.user) {
        setUserDetails(response.user);
      }
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      toast.error("Failed to load membership information");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const membershipTiers = [
    {
      name: "Basic Member",
      price: "Free",
      icon: Star,
      color: "text-gray-500",
      bgColor: "bg-gray-50",
      benefits: [
        "Borrow up to 3 books at a time",
        "14-day loan period",
        "Access to basic catalog",
        "Email notifications",
      ],
    },
    {
      name: "Premium Member",
      price: "Rp 100,000/year",
      icon: Crown,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      popular: true,
      benefits: [
        "Borrow up to 7 books at a time",
        "30-day loan period",
        "Access to premium catalog",
        "Priority room booking",
        "No late fees for first week",
        "Early access to new arrivals",
        "Digital resource access",
      ],
    },
    // {
    //   name: "VIP Member",
    //   price: "Rp 250,000/year",
    //   icon: Sparkles,
    //   color: "text-purple-600",
    //   bgColor: "bg-purple-50",
    //   benefits: [
    //     "Unlimited book borrowing",
    //     "60-day loan period",
    //     "Access to exclusive collections",
    //     "Personal book recommendations",
    //     "Private study room access",
    //     "No late fees",
    //     "Event invitations",
    //     "All Premium benefits",
    //   ],
    // },
  ];

  const getMembershipStatus = () => {
    if (!userDetails?.membership) return null;

    const { membershipType, startDate, expiryDate } = userDetails.membership;
    const isActive = new Date(expiryDate) > new Date();

    return {
      type: membershipType || "BASIC",
      startDate,
      expiryDate,
      isActive,
    };
  };

  const handleJoinMembership = async (membershipType = "PREMIUM") => {
    if (!isAuthenticated) {
      toast.error("Please login to join membership");
      router.push("/auth/login");
      return;
    }

    if (!snapLoaded || !window.snap) {
      toast.error("Payment system is loading. Please try again in a moment.");
      return;
    }

    try {
      setLoading(true);
      // Backend will get user from session/auth
      const response = await paymentService.createMembershipPayment({
        membershipType,
      });

      if (response.success && response.token) {
        // Redirect to payment gateway with the token
        window.snap.pay(response.token, {
          onSuccess: function (result) {
            console.log("Payment success:", result);
            toast.success("Payment successful! Membership activated.");
            fetchUserDetails();
          },
          onPending: function (result) {
            console.log("Payment pending:", result);
            toast.info("Payment is pending. Please complete the payment.");
          },
          onError: function (result) {
            console.error("Payment error:", result);
            toast.error("Payment failed. Please try again.");
          },
          onClose: function () {
            console.log("Payment popup closed");
            toast.info("Payment cancelled.");
          },
        });
      } else {
        toast.error(response.message || "Failed to initialize payment");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.message || "Failed to process payment");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-64 mb-4" />
        <Skeleton className="h-6 w-96 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const membershipStatus = getMembershipStatus();
  const hasMembership = membershipStatus && membershipStatus.isActive;

  return (
    <>
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.MIDTRANS_CLIENT_KEY || ""}
        strategy="afterInteractive"
        onLoad={() => {
          console.log("Midtrans Snap loaded");
          setSnapLoaded(true);
        }}
        onError={(e) => {
          console.error("Failed to load Midtrans Snap", e);
          toast.error("Failed to load payment system");
        }}
      />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Library Membership</h1>
          <p className="text-muted-foreground text-lg">
            {hasMembership
              ? "Manage your membership benefits"
              : "Unlock exclusive benefits with our membership plans"}
          </p>
        </div>

        {/* Current Membership Status (for authenticated users with membership) */}
        {isAuthenticated && hasMembership && (
          <Card className="mb-8 border-2 border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    Active Membership
                  </CardTitle>
                  <CardDescription>
                    You are currently enrolled in our membership program
                  </CardDescription>
                </div>
                <Badge variant="default" className="text-lg px-4 py-2">
                  {membershipStatus.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">
                      {formatDate(membershipStatus.startDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Expiry Date</p>
                    <p className="font-medium">
                      {formatDate(membershipStatus.expiryDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium text-green-600">Active</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
              >
                View Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => handleJoinMembership("PREMIUM")}
                disabled={loading}
              >
                {loading ? "Processing..." : "Upgrade Plan"}
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Membership Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {membershipTiers.map((tier, index) => {
            const Icon = tier.icon;
            const isCurrentTier =
              hasMembership &&
              membershipStatus.type.toUpperCase() ===
                tier.name.split(" ")[0].toUpperCase();

            return (
              <Card
                key={index}
                className={`relative ${
                  tier.popular ? "border-2 border-primary shadow-lg" : ""
                } ${isCurrentTier ? "ring-2 ring-green-500" : ""}`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="px-4 py-1">Most Popular</Badge>
                  </div>
                )}
                {isCurrentTier && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge
                      variant="secondary"
                      className="px-4 py-1 bg-green-500 text-white"
                    >
                      Current Plan
                    </Badge>
                  </div>
                )}

                <CardHeader className={`${tier.bgColor} rounded-t-lg`}>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`h-8 w-8 ${tier.color}`} />
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{tier.price}</p>
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  <ul className="space-y-3">
                    {tier.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                        <span className="text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={tier.popular ? "default" : "outline"}
                    onClick={() =>
                      handleJoinMembership(
                        tier.name.split(" ")[0].toUpperCase()
                      )
                    }
                    disabled={isCurrentTier || loading}
                  >
                    {isCurrentTier
                      ? "Current Plan"
                      : loading
                      ? "Processing..."
                      : isAuthenticated
                      ? "Select Plan"
                      : "Get Started"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Why Join Section */}
        <Card className="bg-linear-to-br from-blue-50 to-purple-50 border-none">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Why Join Our Membership?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 shadow-md">
                  <CheckCircle2 className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Exclusive Access</h3>
                <p className="text-sm text-muted-foreground">
                  Access to premium books and resources
                </p>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 shadow-md">
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Flexible Borrowing</h3>
                <p className="text-sm text-muted-foreground">
                  Longer loan periods and more books
                </p>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 shadow-md">
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="font-semibold mb-2">Priority Service</h3>
                <p className="text-sm text-muted-foreground">
                  Skip the line with priority bookings
                </p>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 shadow-md">
                  <Sparkles className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Special Events</h3>
                <p className="text-sm text-muted-foreground">
                  Invitations to exclusive library events
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action for non-authenticated users */}
        {!isAuthenticated && (
          <div className="mt-8 text-center">
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="pt-6 pb-6">
                <h3 className="text-2xl font-bold mb-2">
                  Ready to Get Started?
                </h3>
                <p className="mb-4">
                  Create an account today and unlock the world of knowledge
                </p>
                <div className="flex gap-4 justify-center">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => router.push("/auth/register")}
                  >
                    Sign Up Now
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => router.push("/auth/login")}
                    className="bg-transparent border-white text-white hover:bg-white hover:text-primary"
                  >
                    Login
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
