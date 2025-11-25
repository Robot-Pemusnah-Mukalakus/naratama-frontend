"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { booksService, bookLoansService, paymentService } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Script from "next/script";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Globe,
  FileText,
  Hash,
  Loader2,
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
  const [borrowDialogOpen, setBorrowDialogOpen] = useState(false);
  const [borrowing, setBorrowing] = useState(false);
  const [snapLoaded, setSnapLoaded] = useState(false);

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

  const handleBorrowRequest = async () => {
    if (!snapLoaded || !window.snap) {
      toast.error("Payment system is loading. Please try again in a moment.");
      return;
    }

    setBorrowing(true);

    try {
      const response = await bookLoansService.createLoan({
        userId: user.id,
        bookId: params.id,
      });

      const paymentToken = response?.data?.paymentToken;
      const loanId = response?.data?.loan?.id;

      // Payment flow - similar to room booking
      if (response.success && paymentToken) {
        setBorrowDialogOpen(false);

        const paymentResult = await new Promise((resolve, reject) => {
          window.snap.pay(paymentToken, {
            onSuccess: function (result) {
              resolve({ status: "success", result });
            },
            onPending: function (result) {
              resolve({ status: "pending", result });
            },
            onError: function (result) {
              reject({ status: "error", result });
            },
            onClose: function () {
              resolve({ status: "closed" });
            },
          });
        });

        if (paymentResult.status === "success") {
          const res = await paymentService.finishBookPayment(
            loanId,
            paymentResult.result.order_id
          );

          if (res.success) {
            toast.success("Payment successful! Book loan confirmed.");
            fetchBook();
          } else {
            toast.error(res.message || "Failed to confirm loan after payment");
          }
        } else if (paymentResult.status === "pending") {
          toast.info("Payment is pending. Please complete the payment.");
        } else if (paymentResult.status === "closed") {
          toast.info("Payment cancelled.");
        }
      } else if (response.success) {
        // No payment required - membership benefit
        toast.success("Book loan approved! (Active membership benefit)");
        setBorrowDialogOpen(false);
        fetchBook();
      }
    } catch (error) {
      toast.error(error.message || "Failed to submit borrow request");
      console.error("Failed to borrow book:", error);
    } finally {
      setBorrowing(false);
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
                        className={`shrink-0 ${
                          book.availableQuantity > 0
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-red-600 hover:bg-red-700 text-white"
                        }`}
                      >
                        {book.availableQuantity > 0
                          ? "Available"
                          : "Not Available"}
                      </Badge>
                    </div>
                    <p className="text-lg text-muted-foreground mb-3">
                      by{" "}
                      {Array.isArray(book.author)
                        ? book.author.join(", ")
                        : book.author}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-950 dark:text-blue-300">
                        <BookOpen className="h-3 w-3 mr-1" />
                        {Array.isArray(book.category)
                          ? book.category.join(", ")
                          : book.category}
                      </Badge>
                      {book.genre && (
                        <Badge className="text-xs bg-gradient-to-r from-slate-100 via-gray-50 to-zinc-100 text-slate-700 hover:from-slate-200 hover:via-gray-100 hover:to-zinc-200 dark:from-slate-800 dark:via-gray-900 dark:to-zinc-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
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
                    <h3 className="text-sm font-semibold mb-2">
                      About this book
                    </h3>
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
                        <p className="text-xs text-muted-foreground">
                          Published
                        </p>
                        <p className="text-sm font-medium">
                          {book.publishYear}
                        </p>
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
                        <p className="text-xs text-muted-foreground">
                          Publisher
                        </p>
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
                          <p className="text-xs text-muted-foreground">
                            Language
                          </p>
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
                          <p className="text-xs text-muted-foreground">
                            Location
                          </p>
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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p
                          className={`text-xl font-bold ${
                            book.availableQuantity > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {book.availableQuantity}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Available
                        </p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-xl font-bold">
                          {book.quantity - book.availableQuantity}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Borrowed
                        </p>
                      </div>
                      {book.location && (
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <p className="text-sm font-medium">
                            {Array.isArray(book.location)
                              ? book.location.join(", ")
                              : book.location}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Location
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Button at the bottom */}
                    {isAuthenticated ? (
                      <Button
                        className="w-full"
                        disabled={book.availableQuantity === 0 || borrowing}
                        onClick={() => setBorrowDialogOpen(true)}
                      >
                        {borrowing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing Payment...
                          </>
                        ) : book.availableQuantity > 0 ? (
                          "Request to Borrow"
                        ) : (
                          "Currently Unavailable"
                        )}
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

        {/* Borrow Confirmation Dialog */}
        <Dialog open={borrowDialogOpen} onOpenChange={setBorrowDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request to Borrow Book</DialogTitle>
              <DialogDescription>
                Are you sure you want to borrow &quot;{book?.title}&quot;?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Book:</strong> {book?.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Author:</strong>{" "}
                  {Array.isArray(book?.author)
                    ? book?.author.join(", ")
                    : book?.author}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>ISBN:</strong> {book?.isbn}
                </p>
              </div>
              <Separator />
              <p className="text-sm text-muted-foreground">
                {isAuthenticated && user?.membership
                  ? "Your loan will be auto-approved as an active member."
                  : "Payment may be required. The library staff will process your request."}
              </p>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setBorrowDialogOpen(false)}
                disabled={borrowing}
              >
                Cancel
              </Button>
              <Button onClick={handleBorrowRequest} disabled={borrowing}>
                {borrowing ? "Processing..." : "Confirm Request"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
