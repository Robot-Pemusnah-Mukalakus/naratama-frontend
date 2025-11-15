"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { booksService } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, BookOpen } from "lucide-react";
import { toast } from "sonner";

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedCategory, availableOnly]);

  const fetchCategories = async () => {
    try {
      const response = await booksService.getCategories();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
      };

      if (selectedCategory !== "all") {
        params.category = selectedCategory;
      }

      if (availableOnly) {
        params.available = "true";
      }

      const response = await booksService.getBooks(params);
      if (response.success) {
        setBooks(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (error) {
      toast.error("Failed to load books");
      console.error("Failed to fetch books:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) {
      fetchBooks();
      return;
    }

    setLoading(true);
    try {
      const response = await booksService.searchBooks({
        search: search,
        page,
        limit: 12,
        available: availableOnly ? "true" : undefined,
      });
      if (response.success) {
        setBooks(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (error) {
      toast.error("Failed to search books");
      console.error("Failed to search books:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Book Catalog</h1>
          <p className="text-muted-foreground">
            Browse and search our collection of books
          </p>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, author, or ISBN..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3 items-center">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant={availableOnly ? "default" : "outline"}
                  onClick={() => setAvailableOnly(!availableOnly)}
                >
                  {availableOnly ? "Showing Available" : "Show Available Only"}
                </Button>

                {(search || selectedCategory !== "all" || availableOnly) && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSearch("");
                      setSelectedCategory("all");
                      setAvailableOnly(false);
                      setPage(1);
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-64 w-full" />
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
      ) : books.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No books found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search query
          </p>
        </div>
      ) : (
        <>
          {/* Books Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {books.map((book) => (
              <Card 
                key={book.id} 
                className="group flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                {/* Book Cover - Transparent background in card */}
                <div className="relative w-full aspect-[1/1] flex items-center justify-center p-0.5">
                  {book.coverImage ? (
                    <div className="relative w-11/12 h-11/12">
                      <Image
                        src={book.coverImage}
                        alt={`Cover of ${book.title}`}
                        fill
                        className="object-contain drop-shadow-2xl group-hover:scale-105 transition-all duration-500 ease-out"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                  ) : (
                    <div className="w-11/12 h-11/12 flex items-center justify-center">
                      <BookOpen className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                <CardHeader className="pb-0.5 pt-1.5 px-3">
                  <CardTitle className="line-clamp-2 text-sm group-hover:text-primary transition-colors">
                    {book.title}
                  </CardTitle>
                  <CardDescription className="text-xs">{book.author}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1 pb-0.5 px-3">
                  <div className="space-y-1.5">
                    <Badge variant="default" className="text-xs font-semibold bg-primary text-primary-foreground">
                      {book.category}
                    </Badge>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {book.description || "No description available"}
                    </p>
                    <div className="text-xs font-semibold flex items-center gap-1.5">
                      <div className={`h-1.5 w-1.5 rounded-full ${book.availableQuantity > 0 ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                      <span
                        className={
                          book.availableQuantity > 0
                            ? "text-green-600"
                            : "text-muted-foreground"
                        }
                      >
                        {book.availableQuantity > 0
                          ? `${book.availableQuantity} Available`
                          : "Not available"}
                      </span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-0 pb-1.5 px-3">
                  <Link href={`/books/${book.id}`} className="w-full">
                    <Button className="w-full h-8 text-xs group-hover:shadow-lg transition-all" variant="outline">
                      View Details
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
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
    </div>
  );
}
