"use client";

import { useState, useEffect } from "react";
import { roomsService } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Script } from "next/script";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DoorOpen, Users, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function RoomsPage() {
  const { user, isAuthenticated } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    bookingDate: "",
    startTime: "",
    endTime: "",
    purpose: "",
    specialRequests: "",
  });

  // -- FILTER STATES --
  const [capacity, setCapacity] = useState(""); // "", "5", "10", "20", ">30"
  const [availability, setAvailability] = useState(""); // "", "available", "not_available"
  const [snapLoaded, setSnapLoaded] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await roomsService.getRooms({ available: "true" });
      if (response.success) {
        setRooms(response.data || []);
      }
    } catch (error) {
      toast.error("Failed to load rooms");
      console.error("Failed to fetch rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookRoom = (room) => {
    if (!isAuthenticated) {
      toast.error("Please login to book a room");
      return;
    }

    if (!snapLoaded) {
      toast.error("Payment system is still loading. Please try again later.");
      return;
    }
    setSelectedRoom(room);
    setBookingDialogOpen(true);
  };

  // Validasi form booking
  const validateBookingForm = () => {
    const { bookingDate, startTime, endTime } = bookingForm;

    // 1. Check if all required fields are filled
    if (!bookingDate || !startTime || !endTime) {
      toast.error("Mohon lengkapi semua field yang wajib diisi");
      return false;
    }

    // 2. Check if booking date is weekday (Monday-Friday)
    const selectedDate = new Date(bookingDate);
    const dayOfWeek = selectedDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      toast.error("Booking hanya tersedia di hari kerja (Senin-Jumat)");
      return false;
    }

    // 3. Check if booking date is in the future (or today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      toast.error("Tanggal booking tidak boleh di masa lalu");
      return false;
    }

    // 4. Parse times
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    // 5. Check operating hours (08:00 - 20:00)
    if (startHour < 8 || startHour >= 20) {
      toast.error("Waktu mulai harus antara jam 08:00 - 19:59");
      return false;
    }
    if (endHour < 8 || endHour > 20) {
      toast.error("Waktu selesai harus antara jam 08:00 - 20:00");
      return false;
    }

    // 6. Check if start time is before end time
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    if (startMinutes >= endMinutes) {
      toast.error("Waktu mulai harus sebelum waktu selesai");
      return false;
    }

    // 7. Check minimum duration (1 hour = 60 minutes)
    const durationMinutes = endMinutes - startMinutes;
    if (durationMinutes < 60) {
      toast.error("Durasi booking minimal 1 jam");
      return false;
    }

    // 8. If booking is today, check if start time is in the future
    if (selectedDate.getTime() === today.getTime()) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      if (startMinutes <= currentMinutes) {
        toast.error("Waktu mulai harus di masa depan");
        return false;
      }
    }

    return true;
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setPaymentRequired(false);
    setPaymentDetails(null);

    // Validasi form dulu
    if (!validateBookingForm()) {
      return;
    }

    try {
      const bookingDate = new Date(
        bookingForm.bookingDate + "T00:00:00"
      ).toISOString();
      const startTime = new Date(
        bookingForm.bookingDate + "T" + bookingForm.startTime + ":00"
      ).toISOString();
      const endTime = new Date(
        bookingForm.bookingDate + "T" + bookingForm.endTime + ":00"
      ).toISOString();

      const bookingData = {
        userId: user.id,
        roomId: selectedRoom.id,
        bookingDate,
        startTime,
        endTime,
        purpose: bookingForm.purpose,
        specialRequests: bookingForm.specialRequests || undefined,
      };

      const response = await roomsService.createBooking(bookingData);
      if (response.success) {
        // Payment ALAMAK BANYAKNYE PEKERJAAN AWAK
        window.snap.pay(response.token, {
          onSuccess: async function (result) {
            // Notify backend to finalize booking after payment
            const res = await roomsService.finishRoomPayment(
              user.id,
              result.order_id
            );

            if (res.success) {
              toast.success("Payment successful! Membership activated.");
              fetchUserDetails();
            } else {
              toast.error(
                res.message || "Failed to activate membership after payment"
              );
            }
          },
          onPending: function (result) {
            toast.info("Payment is pending. Please complete the payment.");
          },
          onError: function (result) {
            console.error("Payment error:", result);
            toast.error("Payment failed. Please try again.");
          },
          onClose: function () {
            toast.info("Payment cancelled.");
          },
        });
        setBookingDialogOpen(false);
        setBookingForm({
          bookingDate: "",
          startTime: "",
          endTime: "",
          purpose: "",
          specialRequests: "",
        });
      }
    } catch (error) {
      // Handle 402 Payment Required for non-members
      if (error.status === 402 || error.response?.status === 402) {
        const errorData = error.response?.data || error;
        setPaymentRequired(true);
        setPaymentDetails(errorData.paymentDetails);
        toast.warning("Payment required to complete booking");
      } else {
        toast.error(error.message || "Failed to create booking");
        console.error("Failed to create booking:", error);
        setBookingDialogOpen(false);
      }
    }
  };

  const getRoomTypeLabel = (type) => {
    switch (type) {
      case "SMALL_DISCUSSION":
        return "Small Discussion Room";
      case "LARGE_MEETING":
        return "Large Meeting Room";
      default:
        return type;
    }
  };

  // --- Filtering logic ---
  const filteredRooms = rooms.filter((room) => {
    // Capacity filter: interpret as "minimum capacity required"
    if (capacity) {
      if (capacity === ">30") {
        if (!(room.capacity > 30)) return false;
      } else {
        const min = parseInt(capacity, 10);
        if (Number.isFinite(min) && room.capacity < min) return false;
      }
    }

    // Availability filter
    if (availability) {
      if (availability === "available" && !room.isAvailable) return false;
      if (availability === "not_available" && room.isAvailable) return false;
    }

    return true;
  });

  return (
    <>
          <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.MIDTRANS_CLIENT_KEY || ""}
        strategy="afterInteractive"
        onLoad={() => {
          setSnapLoaded(true);
        }}
        onError={(e) => {
          console.error("Failed to load Midtrans Snap", e);
          toast.error("Failed to load payment system");
        }}
      />
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Study Rooms</h1>
        <p className="text-muted-foreground">
          Book a room for your study sessions or meetings
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8 items-end">
        {/* Capacity Filter */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Capacity (min)</label>
          <select
            aria-label="Filter by capacity"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="border rounded-xl px-4 py-2 bg-white"
          >
            <option value="">All Capacities</option>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value=">30">&gt; 30</option>
          </select>
        </div>

        {/* Availability Filter */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 flex items-center gap-2">
            Availability
            {availability === "available" && (
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            )}
            {availability === "not_available" && (
              <XCircle className="h-4 w-4 text-rose-600" />
            )}
          </label>

          <select
            aria-label="Filter by availability"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="border rounded-xl px-4 py-2 bg-white"
          >
            <option value="">All</option>
            <option value="available">Available</option>
            <option value="not_available">Not Available</option>
          </select>
        </div>

        {/* Reset Filters button */}
        <div className="flex items-center">
          <Button
            variant="outline"
            className="transition-colors duration-200 hover:bg-black hover:text-white"
            onClick={() => {
              setCapacity("");
              setAvailability("");
            }}
          >
            Reset Filters
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-center py-12">
          <DoorOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No rooms available</h3>
          <p className="text-muted-foreground">Please check back later</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <Card
              key={room.id}
              className="transition-transform duration-300 hover:scale-[1.03]"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{room.name}</CardTitle>
                    <CardDescription>
                      {getRoomTypeLabel(room.type)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* availability badge with icon */}
                    {room.isAvailable ? (
                      <Badge
                        variant="default"
                        className="gap-1 flex items-center"
                      >
                        <CheckCircle className="h-3 w-3 text-emerald-600" />
                        Available
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="gap-1 flex items-center"
                      >
                        <XCircle className="h-3 w-3 text-rose-600" />
                        Not Available
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {room.description ||
                    "A comfortable space for your study needs."}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Capacity: {room.capacity} people</span>
                  </div>
                  {room.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <DoorOpen className="h-4 w-4 text-muted-foreground" />
                      <span>{room.location}</span>
                    </div>
                  )}
                </div>

                {room.facilities && room.facilities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {room.facilities.map((facility, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {facility}
                      </Badge>
                    ))}
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={() => handleBookRoom(room)}
                  disabled={!room.isAvailable}
                >
                  {room.isAvailable ? "Book Room" : "Not Available"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Book {selectedRoom?.name}</DialogTitle>
            <DialogDescription>
              {paymentRequired
                ? "Payment required to complete your booking"
                : "Fill in the details for your room booking"}
            </DialogDescription>
          </DialogHeader>

          {paymentRequired && paymentDetails ? (
            <div className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                  Payment Required
                </h4>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                  {paymentDetails.description}
                </p>
                <div className="space-y-2">
                  {paymentDetails.commitmentFee && (
                    <div className="flex justify-between text-sm">
                      <span className="text-yellow-700 dark:text-yellow-300">
                        Commitment Fee:
                      </span>
                      <span className="font-medium text-yellow-900 dark:text-yellow-100">
                        Rp{" "}
                        {paymentDetails.commitmentFee?.toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}
                  {paymentDetails.bookingFee && (
                    <div className="flex justify-between text-sm">
                      <span className="text-yellow-700 dark:text-yellow-300">
                        Booking Fee:
                      </span>
                      <span className="font-medium text-yellow-900 dark:text-yellow-100">
                        Rp {paymentDetails.bookingFee?.toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm pt-2 border-t border-yellow-300 dark:border-yellow-700">
                    <span className="font-semibold text-yellow-900 dark:text-yellow-100">
                      Total:
                    </span>
                    <span className="font-bold text-yellow-900 dark:text-yellow-100">
                      Rp {paymentDetails.amount?.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                💡 <strong>Tip:</strong> Get an active membership to skip
                commitment fees and enjoy auto-confirmed room bookings!
              </p>
              <p className="text-sm text-muted-foreground">
                Please contact the library staff to complete the payment
                process.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setBookingDialogOpen(false);
                    setPaymentRequired(false);
                    setPaymentDetails(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitBooking} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bookingDate">Tanggal Booking *</Label>
                <Input
                  id="bookingDate"
                  type="date"
                  value={bookingForm.bookingDate}
                  onChange={(e) =>
                    setBookingForm({
                      ...bookingForm,
                      bookingDate: e.target.value,
                    })
                  }
                  required
                  min={new Date().toISOString().split("T")[0]}
                />
                <p className="text-xs text-muted-foreground">
                  ℹ️ Hanya hari kerja (Senin-Jumat)
                </p>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Waktu Mulai *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={bookingForm.startTime}
                      onChange={(e) =>
                        setBookingForm({
                          ...bookingForm,
                          startTime: e.target.value,
                        })
                      }
                      required
                      min="08:00"
                      max="19:59"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">Waktu Selesai *</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={bookingForm.endTime}
                      onChange={(e) =>
                        setBookingForm({
                          ...bookingForm,
                          endTime: e.target.value,
                        })
                      }
                      required
                      min="08:00"
                      max="20:00"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  ⏰ Jam operasional: 08:00 - 20:00 | Minimal 1 jam
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Tujuan Booking *</Label>
                <Input
                  id="purpose"
                  placeholder="Contoh: Diskusi kelompok, Rapat, Belajar"
                  value={bookingForm.purpose}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, purpose: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialRequests">
                  Permintaan Khusus (Opsional)
                </Label>
                <Textarea
                  id="specialRequests"
                  placeholder="Contoh: Butuh proyektor, Perlu AC, dll..."
                  value={bookingForm.specialRequests}
                  onChange={(e) =>
                    setBookingForm({
                      ...bookingForm,
                      specialRequests: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setBookingDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" className="flex-1">
                  Konfirmasi Booking
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}
