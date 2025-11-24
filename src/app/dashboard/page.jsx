"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { bookLoansService, roomsService } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BookOpen, DoorOpen, User, Calendar, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [loans, setLoans] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    } else if (isAuthenticated && user) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading, user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [loansResponse, bookingsResponse] = await Promise.all([
        bookLoansService.getLoans({ userId: user.id }),
        roomsService.getBookings({ userId: user.id }),
      ]);

      if (loansResponse.success) {
        setLoans(loansResponse.data || []);
      }
      if (bookingsResponse.success) {
        setBookings(bookingsResponse.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getLoanStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "RETURNED":
        return "secondary";
      case "OVERDUE":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getBookingStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "default";
      case "CONFIRMED":
        return "default";
      case "CANCELLED":
        return "destructive";
      case "COMPLETED":
        return "secondary";
      default:
        return "secondary";
    }
  };

  if (authLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">Welcome back, {user.name}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium">Profile</CardTitle>
            <User className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="flex items-center gap-3 md:gap-4">
              <Avatar className="h-10 w-10 md:h-12 md:w-12">
                <AvatarFallback className="text-sm md:text-base">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm md:text-base truncate">{user.name}</p>
                <p className="text-xs md:text-sm text-muted-foreground truncate">{user.email}</p>
                <Badge variant="outline" className="mt-1 text-xs">
                  {user.role}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium">Active Loans</CardTitle>
            <BookOpen className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="text-2xl md:text-3xl font-bold">
              {loans.filter((l) => l.status === "ACTIVE").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Books currently borrowed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium">Room Bookings</CardTitle>
            <DoorOpen className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="text-2xl md:text-3xl font-bold">
              {
                bookings.filter(
                  (b) => b.status === "CONFIRMED" || b.status === "PENDING"
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Upcoming bookings
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="loans" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="loans" className="text-sm md:text-base">My Loans</TabsTrigger>
          <TabsTrigger value="bookings" className="text-sm md:text-base">My Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="loans" className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : loans.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No active loans</h3>
                <p className="text-muted-foreground mb-4">
                  Browse our catalog to borrow books
                </p>
                <Link href="/books">
                  <Button>Browse Books</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            loans.map((loan) => (
              <Card key={loan.id}>
                <CardHeader className="p-4 md:p-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base md:text-lg truncate">
                        {loan.book?.title || "Unknown Book"}
                      </CardTitle>
                      <CardDescription className="text-xs md:text-sm truncate">{loan.book?.author}</CardDescription>
                    </div>
                    <Badge variant={getLoanStatusColor(loan.status)} className="text-xs shrink-0">
                      {loan.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                    <div>
                      <p className="text-muted-foreground">Loan Date</p>
                      <p className="font-medium">{formatDate(loan.loanDate)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Due Date</p>
                      <p className="font-medium">{formatDate(loan.dueDate)}</p>
                    </div>
                    {loan.returnDate && (
                      <div>
                        <p className="text-muted-foreground">Returned</p>
                        <p className="font-medium">
                          {formatDate(loan.returnDate)}
                        </p>
                      </div>
                    )}
                    {loan.fine && loan.fine > 0 && (
                      <div>
                        <p className="text-muted-foreground">Fine</p>
                        <p className="font-medium text-red-600">
                          Rp {loan.fine.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                  {loan.status === "OVERDUE" && (
                    <div className="mt-4 flex items-center gap-2 text-destructive text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>
                        This book is overdue. Please return it as soon as
                        possible.
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <DoorOpen className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No room bookings</h3>
                <p className="text-muted-foreground mb-4">
                  Book a study room for your sessions
                </p>
                <Link href="/rooms">
                  <Button>Browse Rooms</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader className="p-4 md:p-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base md:text-lg truncate">{booking.room?.name || "Room"}</CardTitle>
                      <CardDescription className="text-xs md:text-sm truncate">{booking.purpose}</CardDescription>
                    </div>
                    <Badge variant={getBookingStatusColor(booking.status)} className="text-xs shrink-0">
                      {booking.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-medium">
                        {formatDate(booking.bookingDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Time</p>
                      <p className="font-medium">
                        {booking.startTime} - {booking.endTime}
                      </p>
                    </div>
                  </div>
                  {booking.specialRequests && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">
                        Special Requests
                      </p>
                      <p className="text-sm">{booking.specialRequests}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
