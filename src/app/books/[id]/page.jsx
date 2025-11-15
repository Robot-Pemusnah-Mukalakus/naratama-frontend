"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { booksService } from "@/lib/api";
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
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Globe,
  FileText,
  Hash,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchBook();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchBook = async () => {
    setLoading(true);
    try {
      const response = await booksService.getBook(params.id);
      if (response.success) {
        setBook(response.data);
      }
    } catch (error) {
      toast.error("Failed to load book details");
      console.error("Failed to fetch book:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-8" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-6 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Book not found</h2>
        <Button onClick={() => router.push("/books")} className="mt-4">
          Back to Books
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => router.push("/books")}
        className="mb-6 hover:bg-accent"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Books
      </Button>

      <div className="space-y-6">
        {/* Main Card: Cover + All Details */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Book Cover - Left (Smaller) */}
              <div className="md:col-span-2">
                {book.coverImage ? (
                  <div className="relative w-full aspect-[3/4] overflow-hidden rounded-lg shadow-md">
                    <Image
                      src={book.coverImage}
                      alt={`Cover of ${book.title}`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 200px"
                      priority
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[3/4] flex items-center justify-center bg-muted rounded-lg">
                    <BookOpen className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Title, Description, Book Details & Availability - Right */}
              <div className="md:col-span-10 space-y-4">
                {/* Title & Author */}
                <div>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
                      {book.title}
                    </h1>
                    <Badge
                      variant={book.availableQuantity > 0 ? "default" : "secondary"}
                      className="shrink-0"
                    >
                      {book.availableQuantity > 0 ? "Available" : "Not Available"}
                    </Badge>
                  </div>
                  <p className="text-lg text-muted-foreground mb-3">
                    by {Array.isArray(book.author)
                      ? book.author.join(", ")
                      : book.author}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      <BookOpen className="h-3 w-3 mr-1" />
                      {Array.isArray(book.category)
                        ? book.category.join(", ")
                        : book.category}
                    </Badge>
                    {book.genre && (
                      <Badge variant="outline" className="text-xs">
                        {Array.isArray(book.genre)
                          ? book.genre.join(", ")
                          : book.genre}
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                {/* About this book */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">About this book</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {book.description ||
                      "No description available for this book."}
                  </p>
                </div>

                <Separator />

                {/* Book Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <Hash className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">ISBN</p>
                      <p className="text-sm font-medium">{book.isbn}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Published</p>
                      <p className="text-sm font-medium">{book.publishYear}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Pages</p>
                      <p className="text-sm font-medium">{book.pages}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Publisher</p>
                      <p className="text-sm font-medium">
                        {Array.isArray(book.publisher)
                          ? book.publisher.join(", ")
                          : book.publisher}
                      </p>
                    </div>
                  </div>
                  {book.language && (
                    <div className="flex items-start gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Language</p>
                        <p className="text-sm font-medium">
                          {Array.isArray(book.language)
                            ? book.language.join(", ")
                            : book.language}
                        </p>
                      </div>
                    </div>
                  )}
                  {book.location && (
                    <div className="flex items-start gap-3">
                      <BookOpen className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p className="text-sm font-medium">
                          {Array.isArray(book.location)
                            ? book.location.join(", ")
                            : book.location}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Availability Section */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">Availability</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-xl font-bold">{book.quantity}</p>
                      <p className="text-xs text-muted-foreground">Total Copies</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className={`text-xl font-bold ${
                        book.availableQuantity > 0 ? "text-green-600" : "text-red-600"
                      }`}>
                        {book.availableQuantity}
                      </p>
                      <p className="text-xs text-muted-foreground">Available</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-xl font-bold">{book.quantity - book.availableQuantity}</p>
                      <p className="text-xs text-muted-foreground">Borrowed</p>
                    </div>
                    {book.location && (
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-sm font-medium">
                          {Array.isArray(book.location)
                            ? book.location.join(", ")
                            : book.location}
                        </p>
                        <p className="text-xs text-muted-foreground">Location</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Button at the bottom */}
                  {isAuthenticated ? (
                    <Button
                      className="w-full"
                      disabled={book.availableQuantity === 0}
                    >
                      {book.availableQuantity > 0
                        ? "Request to Borrow"
                        : "Currently Unavailable"}
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground text-center">
                        Please login to borrow this book
                      </p>
                      <Link href="/auth/login">
                        <Button className="w-full">Login</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
