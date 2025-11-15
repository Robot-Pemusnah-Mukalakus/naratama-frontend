"use client";

import { useState, useEffect } from "react";
import { announcementsService } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  Calendar, 
  Clock, 
  BookOpen, 
  DoorOpen, 
  LogOut,
  AlertTriangle,
  Info,
  Timer
} from "lucide-react";
import { toast } from "sonner";

const priorityColors = {
  LOW: "secondary",
  MEDIUM: "default",
  HIGH: "destructive",
  URGENT: "destructive",
};

const typeLabels = {
  NEW_BOOKS: "New Books",
  EVENT: "Event",
  MAINTENANCE: "Maintenance",
  POLICY: "Policy",
  GENERAL: "General",
  BOOK_RETURN: "Book Return Deadline",
  ROOM_START: "Room Reservation Start",
  ROOM_END: "Room Reservation End",
};

// Icon mapping untuk setiap tipe announcement
const typeIcons = {
  BOOK_RETURN: BookOpen,
  ROOM_START: DoorOpen,
  ROOM_END: LogOut,
  NEW_BOOKS: BookOpen,
  EVENT: Calendar,
  MAINTENANCE: AlertTriangle,
  POLICY: Info,
  GENERAL: Bell,
};

// Helper function untuk format waktu relatif
const formatTimeRemaining = (deadline) => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diff = deadlineDate - now;
  
  if (diff < 0) return "Overdue";
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} remaining`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
  } else {
    return `${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
  }
};

// Helper function untuk mendapatkan warna badge berdasarkan urgency
const getUrgencyColor = (deadline, type) => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const hoursRemaining = (deadlineDate - now) / (1000 * 60 * 60);
  
  if (type === 'BOOK_RETURN') {
    if (hoursRemaining <= 6) return 'destructive';
    if (hoursRemaining <= 12) return 'warning';
    return 'default';
  } else if (type === 'ROOM_START') {
    if (hoursRemaining <= 1) return 'destructive';
    if (hoursRemaining <= 3) return 'warning';
    return 'default';
  } else if (type === 'ROOM_END') {
    const minutesRemaining = (deadlineDate - now) / (1000 * 60);
    if (minutesRemaining <= 5) return 'destructive';
    if (minutesRemaining <= 10) return 'warning';
    return 'default';
  }
  return 'default';
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [userNotifications, setUserNotifications] = useState([]);

  useEffect(() => {
    fetchAnnouncements();
    fetchUserNotifications();
    
    // Set up interval untuk refresh notifications setiap 1 menit
    const interval = setInterval(() => {
      fetchUserNotifications();
    }, 60000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, activeTab]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await announcementsService.getAnnouncements({
        page,
        limit: 10,
        type: activeTab === 'all' ? undefined : activeTab,
      });
      if (response.success) {
        setAnnouncements(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (error) {
      toast.error("Failed to load announcements");
      console.error("Failed to fetch announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserNotifications = async () => {
    try {
      // Fetch user-specific notifications (book returns, room reservations)
      const response = await announcementsService.getUserNotifications();
      if (response.success) {
        setUserNotifications(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch user notifications:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Render notification card berdasarkan tipe
  const renderNotificationCard = (notification) => {
    const IconComponent = typeIcons[notification.type] || Bell;
    const urgencyColor = getUrgencyColor(notification.deadline || notification.startTime || notification.endTime, notification.type);
    
    return (
      <Card key={notification.id} className={urgencyColor === 'destructive' ? 'border-red-500' : ''}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${
                notification.type === 'BOOK_RETURN' ? 'bg-blue-100 text-blue-600' :
                notification.type === 'ROOM_START' ? 'bg-green-100 text-green-600' :
                'bg-orange-100 text-orange-600'
              }`}>
                <IconComponent className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg mb-1">
                  {notification.title}
                </CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={urgencyColor}>
                    <Timer className="h-3 w-3 mr-1" />
                    {formatTimeRemaining(notification.deadline || notification.startTime || notification.endTime)}
                  </Badge>
                  <Badge variant="outline">
                    {typeLabels[notification.type]}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-muted-foreground">
              {notification.content}
            </p>
            
            {/* Book Return Details */}
            {notification.type === 'BOOK_RETURN' && notification.bookDetails && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Book Title:</span>
                  <span>{notification.bookDetails.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Author:</span>
                  <span>{notification.bookDetails.author}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Return Date:</span>
                  <span className="text-red-600 font-medium">
                    {formatDate(notification.deadline)}
                  </span>
                </div>
              </div>
            )}
            
            {/* Room Reservation Details */}
            {(notification.type === 'ROOM_START' || notification.type === 'ROOM_END') && notification.roomDetails && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Room:</span>
                  <span>{notification.roomDetails.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Floor:</span>
                  <span>{notification.roomDetails.floor}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">
                    {notification.type === 'ROOM_START' ? 'Start Time:' : 'End Time:'}
                  </span>
                  <span className="font-medium text-blue-600">
                    {formatDate(notification.type === 'ROOM_START' ? notification.startTime : notification.endTime)}
                  </span>
                </div>
                {notification.type === 'ROOM_START' && (
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Duration:</span>
                    <span>{notification.roomDetails.duration} hours</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-2 mt-3">
              {notification.type === 'BOOK_RETURN' && (
                <Button size="sm" variant="outline">
                  <Clock className="h-4 w-4 mr-1" />
                  Extend Return Date
                </Button>
              )}
              {notification.type === 'ROOM_START' && (
                <Button size="sm" variant="outline">
                  <Calendar className="h-4 w-4 mr-1" />
                  View Reservation
                </Button>
              )}
              {notification.type === 'ROOM_END' && (
                <Button size="sm" variant="outline">
                  <Clock className="h-4 w-4 mr-1" />
                  Extend Time
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Announcements</h1>
        <p className="text-muted-foreground">
          Stay updated with library news, events, and your personal notifications
        </p>
      </div>

      {/* Urgent User Notifications */}
      {userNotifications.length > 0 && (
        <div className="mb-8">
          <Alert className="mb-6">
            <Bell className="h-4 w-4" />
            <AlertTitle>Your Personal Notifications</AlertTitle>
            <AlertDescription>
              You have {userNotifications.length} active notification{userNotifications.length > 1 ? 's' : ''} requiring your attention
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            {userNotifications.map((notification) => renderNotificationCard(notification))}
          </div>
        </div>
      )}

      {/* General Announcements with Tabs */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Library Announcements</h2>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 flex w-full"> {/* Tambahkan 'flex' dan 'w-full' */}
          <TabsTrigger value="all" className="flex-1">All</TabsTrigger> {/* Tambahkan 'flex-1' */}
          <TabsTrigger value="NEW_BOOKS" className="flex-1">New Books</TabsTrigger>
          <TabsTrigger value="EVENT" className="flex-1">Events</TabsTrigger>
          <TabsTrigger value="MAINTENANCE" className="flex-1">Maintenance</TabsTrigger>
          <TabsTrigger value="POLICY" className="flex-1">Policy</TabsTrigger>
        </TabsList>

          <TabsContent value={activeTab}>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
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
            ) : announcements.length === 0 ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No announcements available in this category. Check back later for updates!
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="space-y-4">
                  {announcements.map((announcement) => {
                    const IconComponent = typeIcons[announcement.type] || Bell;
                    
                    return (
                      <Card key={announcement.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                <IconComponent className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <CardTitle className="mb-2">
                                  {announcement.title}
                                </CardTitle>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant={priorityColors[announcement.priority]}>
                                    {announcement.priority}
                                  </Badge>
                                  <Badge variant="outline">
                                    {typeLabels[announcement.type] || announcement.type}
                                  </Badge>
                                  {announcement.targetAudience && (
                                    <Badge variant="secondary">
                                      {announcement.targetAudience.replace("_", " ")}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(announcement.createdAt)}</span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground whitespace-pre-wrap">
                            {announcement.content}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center gap-2">
                    <Button
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-2 px-4">
                      <span className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                      </span>
                    </div>
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}