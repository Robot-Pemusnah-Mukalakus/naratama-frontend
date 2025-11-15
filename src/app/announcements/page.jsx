"use client";

import { useState, useEffect } from "react";
import { announcementsService } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Calendar, BookOpen, ClipboardList, Wrench, Sparkles } from "lucide-react";
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
};

const typeIcons = {
  NEW_BOOKS: BookOpen,
  EVENT: Sparkles,
  MAINTENANCE: Wrench,
  POLICY: ClipboardList,
  GENERAL: Bell,
};

const filterOptions = [
  { value: "ALL", label: "All" },
  { value: "EVENT", label: "Event" },
  { value: "NEW_BOOKS", label: "New Books" },
  { value: "POLICY", label: "Policy" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "GENERAL", label: "General" },
];

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetchAnnouncements();
  }, [page]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await announcementsService.getAnnouncements({
        page,
        limit: 10,
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

  const filteredAnnouncements =
    filter === "ALL"
      ? announcements
      : announcements.filter((a) => a.type === filter);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Announcements</h1>
        <p className="text-muted-foreground">
          Stay updated with library news and events
        </p>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={setFilter} className="mb-6">
        <TabsList className="w-full py-1 flex overflow-x-auto no-scrollbar gap-2 p-1 rounded-xl bg-secondary/30 border border-primary">
          {filterOptions.map((opt) => {
            const Icon =
              opt.value !== "ALL" ? typeIcons[opt.value] : Bell;
            return (
              <TabsTrigger
                key={opt.value}
                value={opt.value}
                className="flex items-center gap-2 px-4 py-3 rounded-xl"
              >
                <Icon className="h-4 w-4" />
                {opt.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Loading Skeleton */}
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
      ) : filteredAnnouncements.length === 0 ? (
        <Alert>
          <Bell className="h-4 w-4" />
          <AlertDescription>
            No announcements found for this filter.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="space-y-4">
            {filteredAnnouncements.map((announcement) => {
              const TypeIcon = typeIcons[announcement.type] || Bell;

              return (
                <div
                  key={announcement.id}
                  className="transform transition duration-200 ease-out hover:-translate-y-1"
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="mb-2 flex items-center gap-2">
                            <TypeIcon className="h-5 w-5 text-primary" />
                            {announcement.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={priorityColors[announcement.priority]}>
                              {announcement.priority}
                            </Badge>
                            {announcement.type !== "ALL" && (
                            <Badge variant="outline">
                            {typeLabels[announcement.type] || announcement.type}
                            </Badge>
                          )}  
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
                </div>
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
    </div>
  );
}
