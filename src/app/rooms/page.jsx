"use client";

import { useState, useEffect } from "react";
import { roomsService } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
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
import { DoorOpen, Users, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function RoomsPage() {
  const { user, isAuthenticated } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    bookingDate: "",
    startTime: "",
    endTime: "",
    purpose: "",
    specialRequests: "",
  });

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
    setSelectedRoom(room);
    setBookingDialogOpen(true);
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    try {
      // Convert date and time to ISO format
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
        bookingDate: bookingDate,
        startTime: startTime,
        endTime: endTime,
        purpose: bookingForm.purpose,
        specialRequests: bookingForm.specialRequests || undefined,
      };

      const response = await roomsService.createBooking(bookingData);
      if (response.success) {
        toast.success("Room booking request submitted successfully!");
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
      toast.error(error.message || "Failed to create booking");
      console.error("Failed to create booking:", error);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Study Rooms</h1>
        <p className="text-muted-foreground">
          Book a room for your study sessions or meetings
        </p>
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
      ) : rooms.length === 0 ? (
        <div className="text-center py-12">
          <DoorOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No rooms available</h3>
          <p className="text-muted-foreground">Please check back later</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Card key={room.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{room.name}</CardTitle>
                    <CardDescription>
                      {getRoomTypeLabel(room.type)}
                    </CardDescription>
                  </div>
                  {room.isAvailable && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Available
                    </Badge>
                  )}
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
              Fill in the details for your room booking
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitBooking} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bookingDate">Date</Label>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={bookingForm.endTime}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, endTime: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Input
                id="purpose"
                placeholder="e.g., Group study, Meeting"
                value={bookingForm.purpose}
                onChange={(e) =>
                  setBookingForm({ ...bookingForm, purpose: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialRequests">
                Special Requests (Optional)
              </Label>
              <Textarea
                id="specialRequests"
                placeholder="Any special requirements..."
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
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Submit Booking
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
