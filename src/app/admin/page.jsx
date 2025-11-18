"use client";

import { useState, useEffect } from "react";
import {
  booksService,
  bookLoansService,
  roomsService,
  announcementsService,
  usersService,
} from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Users,
  DoorOpen,
  Megaphone,
  LibraryBig,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    totalLoans: 0,
    overdueLoans: 0,
    totalUsers: 0,
    totalMembers: 0,
    pendingBookings: 0,
    totalAnnouncements: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentLoans, setRecentLoans] = useState([]);
  const [overdueLoans, setOverdueLoans] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all stats in parallel
      const [
        allBooksResponse,
        availableBooksResponse,
        loansResponse,
        overdueResponse,
        usersResponse,
        membersResponse,
        bookingsResponse,
        announcementsResponse,
      ] = await Promise.all([
        booksService.getBooks({ limit: 1 }), // Just for total count
        booksService.getBooks({ limit: 1, available: "true" }), // Just for available count
        bookLoansService.getLoans({ limit: 5 }), // Get recent loans
        bookLoansService.getOverdueLoans(),
        usersService.getUsers({ limit: 1 }), // Just for total count
        usersService.getUsers({ limit: 1, isMember: "true" }), // Just for member count
        roomsService.getBookings({ limit: 1, status: "PENDING" }), // Just for count
        announcementsService.getAnnouncements({ limit: 1 }),
      ]);

      setStats({
        totalBooks: allBooksResponse.pagination?.total || 0,
        availableBooks: availableBooksResponse.pagination?.total || 0,
        totalLoans: loansResponse.pagination?.total || 0,
        overdueLoans: overdueResponse.data?.length || 0,
        totalUsers: usersResponse.pagination?.total || 0,
        totalMembers: membersResponse.pagination?.total || 0,
        pendingBookings: bookingsResponse.pagination?.total || 0,
        totalAnnouncements: announcementsResponse.pagination?.total || 0,
      });

      setRecentLoans(loansResponse.data || []);
      setOverdueLoans(overdueResponse.data?.slice(0, 5) || []);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, description, href }) => (
    <Link href={href}>
      <Card className="hover:bg-accent transition-colors cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <>
              <div className="text-2xl font-bold">{value}</div>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Link>
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of library management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Books"
          value={stats.totalBooks}
          icon={BookOpen}
          description={`${stats.availableBooks} available`}
          href="/admin/books"
        />
        <StatCard
          title="Active Loans"
          value={stats.totalLoans}
          icon={LibraryBig}
          description={`${stats.overdueLoans} overdue`}
          href="/admin/loans"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          description={`${stats.totalMembers} members`}
          href="/admin/users"
        />
        <StatCard
          title="Pending Bookings"
          value={stats.pendingBookings}
          icon={DoorOpen}
          description="Awaiting approval"
          href="/admin/rooms"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/books">
          <Button variant="outline" className="w-full h-full">
            <BookOpen className="h-4 w-4 mr-2" />
            Manage Books
          </Button>
        </Link>
        <Link href="/admin/loans">
          <Button variant="outline" className="w-full h-full">
            <LibraryBig className="h-4 w-4 mr-2" />
            Manage Loans
          </Button>
        </Link>
        <Link href="/admin/rooms">
          <Button variant="outline" className="w-full h-full">
            <DoorOpen className="h-4 w-4 mr-2" />
            Manage Rooms
          </Button>
        </Link>
        <Link href="/admin/announcements">
          <Button variant="outline" className="w-full h-full">
            <Megaphone className="h-4 w-4 mr-2" />
            Announcements
          </Button>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Loans */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Loans</CardTitle>
            <CardDescription>Latest book borrowings</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentLoans.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent loans
              </p>
            ) : (
              <div className="space-y-4">
                {recentLoans.map((loan) => (
                  <div
                    key={loan.id}
                    className="flex items-start justify-between border-b pb-2 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {loan.book?.title || "N/A"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {loan.user?.name || "N/A"}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Due: {formatDate(loan.dueDate)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overdue Loans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Overdue Loans
            </CardTitle>
            <CardDescription>Requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : overdueLoans.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No overdue loans
              </p>
            ) : (
              <div className="space-y-4">
                {overdueLoans.map((loan) => (
                  <div
                    key={loan.id}
                    className="flex items-start justify-between border-b pb-2 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {loan.book?.title || "N/A"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {loan.user?.name || "N/A"}
                      </p>
                    </div>
                    <div className="text-xs text-destructive font-medium">
                      {loan.daysOverdue} days overdue
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Stats */}
      <Card>
        <CardHeader>
          <CardTitle>System Statistics</CardTitle>
          <CardDescription>Overall library metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Books Overview
              </p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Total Books:</span>
                  <span className="font-medium">{stats.totalBooks}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Available:</span>
                  <span className="font-medium text-green-600">
                    {stats.availableBooks}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Loans Overview
              </p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Active Loans:</span>
                  <span className="font-medium">{stats.totalLoans}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Overdue:</span>
                  <span className="font-medium text-destructive">
                    {stats.overdueLoans}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Users Overview
              </p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Total Users:</span>
                  <span className="font-medium">{stats.totalUsers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Members:</span>
                  <span className="font-medium text-blue-600">
                    {stats.totalMembers}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
