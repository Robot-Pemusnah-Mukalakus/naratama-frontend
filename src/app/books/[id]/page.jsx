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
  const { isAuthenticated } = useAuth();
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
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Books
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-3xl mb-2">{book.title}</CardTitle>
                  <CardDescription className="text-lg">
                    {Array.isArray(book.author)
                      ? book.author.join(", ")
                      : book.author}
                  </CardDescription>
                </div>
                <Badge
                  variant={book.availableQuantity > 0 ? "default" : "secondary"}
                >
                  {book.availableQuantity > 0 ? "Available" : "Not Available"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {book.coverImage && (
                <div className="w-full aspect-3/4 max-w-sm mx-auto relative overflow-hidden rounded-lg border bg-muted">
                  <Image
                    src={book.coverImage}
                    alt={`Cover of ${book.title}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              )}
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">
                  {book.description ||
                    "No description available for this book."}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">ISBN:</span>
                    <span className="text-sm text-muted-foreground">
                      {book.isbn}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Category:</span>
                    <Badge variant="secondary">
                      {Array.isArray(book.category)
                        ? book.category.join(", ")
                        : book.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Published:</span>
                    <span className="text-sm text-muted-foreground">
                      {book.publishYear}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Publisher:</span>
                    <span className="text-sm text-muted-foreground">
                      {Array.isArray(book.publisher)
                        ? book.publisher.join(", ")
                        : book.publisher}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Pages:</span>
                    <span className="text-sm text-muted-foreground">
                      {book.pages}
                    </span>
                  </div>
                  {book.language && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Language:</span>
                      <span className="text-sm text-muted-foreground">
                        {Array.isArray(book.language)
                          ? book.language.join(", ")
                          : book.language}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {book.genre && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Genre</h3>
                    <Badge variant="outline">
                      {Array.isArray(book.genre)
                        ? book.genre.join(", ")
                        : book.genre}
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Total Copies:</span>
                  <span className="text-sm">{book.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Available:</span>
                  <span
                    className={`text-sm font-semibold ${
                      book.availableQuantity > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {book.availableQuantity}
                  </span>
                </div>
                {book.location && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Location:</span>
                    <span className="text-sm">
                      {Array.isArray(book.location)
                        ? book.location.join(", ")
                        : book.location}
                    </span>
                  </div>
                )}
              </div>

              <Separator />

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
                    Login to borrow this book
                  </p>
                  <Link href="/auth/login" className="block">
                    <Button className="w-full">Login</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
