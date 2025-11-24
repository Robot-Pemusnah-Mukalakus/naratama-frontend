"use client";

import { useState, useEffect } from "react";
import { roomsService } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export default function AdminRoomsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 20,
      };
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response = await roomsService.getBookings(params);
      if (response.success) {
        setBookings(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (error) {
      toast.error("Failed to load bookings");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await roomsService.updateBookingStatus(bookingId, {
        status: newStatus,
      });
      toast.success(`Booking ${newStatus.toLowerCase()} successfully`);
      fetchBookings();
    } catch (error) {
      toast.error("Failed to update booking status");
      console.error(error);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await roomsService.deleteBooking(bookingId);
      toast.success("Booking cancelled successfully");
      fetchBookings();
    } catch (error) {
      toast.error("Failed to cancel booking");
      console.error(error);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: "default",
      CONFIRMED: "default",
      CANCELLED: "destructive",
      COMPLETED: "secondary",
    };
    const colors = {
      PENDING: "bg-yellow-500",
      CONFIRMED: "bg-green-500",
      CANCELLED: "bg-red-500",
      COMPLETED: "bg-gray-500",
    };
    return (
      <Badge variant={variants[status] || "default"} className={colors[status]}>
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Room Bookings Management</h1>
          <p className="text-muted-foreground">
            Manage study room reservations
          </p>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger
            value="all"
            onClick={() => {
              setStatusFilter("all");
              setPage(1);
            }}
          >
            All Bookings
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            onClick={() => {
              setStatusFilter("PENDING");
              setPage(1);
            }}
          >
            Pending
          </TabsTrigger>
          <TabsTrigger
            value="confirmed"
            onClick={() => {
              setStatusFilter("CONFIRMED");
              setPage(1);
            }}
          >
            Confirmed
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            onClick={() => {
              setStatusFilter("COMPLETED");
              setPage(1);
            }}
          >
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
              <CardDescription>Complete list of room bookings</CardDescription>
            </CardHeader>
            <CardContent className="p-0 md:p-6">
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Purpose</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            {booking.user?.name || "N/A"}
                            <br />
                            <span className="text-xs text-muted-foreground">
                              {booking.user?.email || "N/A"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {booking.room?.name || "N/A"}
                            <br />
                            <span className="text-xs text-muted-foreground">
                              {booking.room?.type || "N/A"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {formatDate(booking.bookingDate)}
                          </TableCell>
                          <TableCell>
                            {formatTime(booking.startTime)} -{" "}
                            {formatTime(booking.endTime)}
                          </TableCell>
                          <TableCell>{booking.purpose || "N/A"}</TableCell>
                          <TableCell>
                            {getStatusBadge(booking.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                              {booking.status === "PENDING" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleUpdateStatus(
                                        booking.id,
                                        "CONFIRMED"
                                      )
                                    }
                                    className="w-full sm:w-auto text-xs"
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    <span className="hidden sm:inline">Approve</span>
                                    <span className="sm:hidden">✓</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleUpdateStatus(
                                        booking.id,
                                        "CANCELLED"
                                      )
                                    }
                                    className="w-full sm:w-auto text-xs"
                                  >
                                    <XCircle className="h-3 w-3 mr-1" />
                                    <span className="hidden sm:inline">Reject</span>
                                    <span className="sm:hidden">✗</span>
                                  </Button>
                                </>
                              )}
                              {booking.status === "CONFIRMED" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleUpdateStatus(
                                        booking.id,
                                        "COMPLETED"
                                      )
                                    }
                                    className="w-full sm:w-auto text-xs"
                                  >
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span className="hidden sm:inline">Complete</span>
                                    <span className="sm:hidden">✓</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      handleCancelBooking(booking.id)
                                    }
                                    className="w-full sm:w-auto text-xs"
                                  >
                                    <XCircle className="h-3 w-3 mr-1" />
                                    <span className="hidden sm:inline">Cancel</span>
                                    <span className="sm:hidden">✗</span>
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-4 flex flex-wrap justify-center gap-2 px-4 md:px-0">
                      <Button
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                      >
                        Previous
                      </Button>
                      <span className="flex items-center px-4 text-sm">
                        Page {page} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Bookings</CardTitle>
              <CardDescription>Bookings awaiting approval</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          {booking.user?.name || "N/A"}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {booking.user?.email || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {booking.room?.name || "N/A"}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {booking.room?.type || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(booking.bookingDate)}</TableCell>
                        <TableCell>
                          {formatTime(booking.startTime)} -{" "}
                          {formatTime(booking.endTime)}
                        </TableCell>
                        <TableCell>{booking.purpose || "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleUpdateStatus(booking.id, "CONFIRMED")
                              }
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleUpdateStatus(booking.id, "CANCELLED")
                              }
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="confirmed">
          <Card>
            <CardHeader>
              <CardTitle>Confirmed Bookings</CardTitle>
              <CardDescription>Approved reservations</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          {booking.user?.name || "N/A"}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {booking.user?.email || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {booking.room?.name || "N/A"}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {booking.room?.type || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(booking.bookingDate)}</TableCell>
                        <TableCell>
                          {formatTime(booking.startTime)} -{" "}
                          {formatTime(booking.endTime)}
                        </TableCell>
                        <TableCell>{booking.purpose || "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleUpdateStatus(booking.id, "COMPLETED")
                              }
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              Complete
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Bookings</CardTitle>
              <CardDescription>Past reservations</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Purpose</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          {booking.user?.name || "N/A"}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {booking.user?.email || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {booking.room?.name || "N/A"}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {booking.room?.type || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(booking.bookingDate)}</TableCell>
                        <TableCell>
                          {formatTime(booking.startTime)} -{" "}
                          {formatTime(booking.endTime)}
                        </TableCell>
                        <TableCell>{booking.purpose || "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
