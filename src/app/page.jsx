"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { booksService, announcementsService } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Bell,
  DoorOpen,
  ArrowRight,
  Library,
  Users,
  Clock,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

export default function Home() {
  const [newBooks, setNewBooks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Embla Carousel for Features section with infinite loop and autoplay
  const [emblaRef] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 3500, stopOnInteraction: false })]
  );

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [booksResponse, announcementsResponse] = await Promise.all([
        booksService.getNewBooks(6),
        announcementsService.getAnnouncements({ limit: 3 }),
      ]);

      if (booksResponse.success) {
        setNewBooks(booksResponse.data || []);
      }
      if (announcementsResponse.success) {
        setAnnouncements(announcementsResponse.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch home data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section 
        className="relative py-20 bg-cover bg-center"
        style={{
          backgroundImage: "url('/library.jpg')",
        }}
      >
        {/* Blurry white overlay */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-6">
              <Library className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-5xl font-extrabold mb-6 tracking-tight text-white drop-shadow-2xl">
              Welcome to Naratama Library
            </h1>
            <p className="text-xl font-semibold text-white drop-shadow-2xl mb-8">
              Your gateway to knowledge. Browse thousands of books, book study
              rooms, and stay updated with our latest news.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/books">
                <Button size="lg" className="gap-2 transition-transform duration-300 hover:scale-110">
                  <BookOpen className="h-5 w-5" />
                  Browse Books
                </Button>
              </Link>
              <Link href="/rooms">
                <Button size="lg" variant="outline" className="gap-2 transition-transform duration-300 hover:scale-110">
                  <DoorOpen className="h-5 w-5" />
                  Book a Room
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-black overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {/* First set of slides */}
              <div className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-3 pr-3">
                <Card className="text-center h-full">
                  <CardHeader>
                    <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                      <BookOpen className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>Vast Collection</CardTitle>
                    <CardDescription>
                      Access thousands of books across multiple categories and
                      genres
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              <div className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-3 pr-3">
                <Card className="text-center h-full">
                  <CardHeader>
                    <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                      <DoorOpen className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>Study Rooms</CardTitle>
                    <CardDescription>
                      Book comfortable study rooms for individual or group sessions
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              <div className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-3 pr-3">
                <Card className="text-center h-full">
                  <CardHeader>
                    <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                      <Clock className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>Easy Borrowing</CardTitle>
                    <CardDescription>
                      Simple and fast book borrowing system with automated tracking
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              {/* Duplicate set for smooth infinite loop */}
              <div className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-3 pr-3">
                <Card className="text-center h-full">
                  <CardHeader>
                    <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                      <BookOpen className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>Vast Collection</CardTitle>
                    <CardDescription>
                      Access thousands of books across multiple categories and
                      genres
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              <div className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-3 pr-3">
                <Card className="text-center h-full">
                  <CardHeader>
                    <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                      <DoorOpen className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>Study Rooms</CardTitle>
                    <CardDescription>
                      Book comfortable study rooms for individual or group sessions
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              <div className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-3 pr-3">
                <Card className="text-center h-full">
                  <CardHeader>
                    <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                      <Clock className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>Easy Borrowing</CardTitle>
                    <CardDescription>
                      Simple and fast book borrowing system with automated tracking
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Books Section */}
      <section className="py-16 bg-zinc-50 dark:bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">New Arrivals</h2>
              <p className="text-muted-foreground">
                Check out our latest additions
              </p>
            </div>
            <Link href="/books">
              <Button variant="outline" className="gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
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
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newBooks.map((book) => (
                <Card key={book.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{book.title}</CardTitle>
                    <CardDescription>{book.author}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-2">
                      <Badge variant="secondary">{book.category}</Badge>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {book.description || "No description available"}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/books/${book.id}`} className="w-full">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Announcements Section */}
      <section className="py-16 bg-white dark:bg-black">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Latest Announcements</h2>
              <p className="text-muted-foreground">
                Stay updated with library news
              </p>
            </div>
            <Link href="/announcements">
              <Button variant="outline" className="gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : announcements.length > 0 ? (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <Card key={announcement.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="mb-2">
                          {announcement.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary">
                            {announcement.type.replace("_", " ")}
                          </Badge>
                          {announcement.priority === "HIGH" ||
                          announcement.priority === "URGENT" ? (
                            <Badge variant="destructive">
                              {announcement.priority}
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                      <Bell className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-2">
                      {announcement.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No announcements at this time
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join Naratama Library today and unlock a world of knowledge
          </p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary" className="gap-2">
              <Users className="h-5 w-5" />
              Create Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
