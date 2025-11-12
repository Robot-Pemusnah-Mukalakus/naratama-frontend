"use client";

import { useState, useEffect } from "react";
import { bookLoansService, booksService, usersService } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Plus, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export default function AdminLoansPage() {
  const [loans, setLoans] = useState([]);
  const [overdueLoans, setOverdueLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [formData, setFormData] = useState({
    userId: "",
    bookId: "",
    userEmail: "",
    bookIsbn: "",
    dueDate: "",
  });
  const [returnDate, setReturnDate] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  useEffect(() => {
    fetchLoans();
    fetchOverdueLoans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 20,
      };
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response = await bookLoansService.getLoans(params);
      if (response.success) {
        setLoans(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (error) {
      toast.error("Failed to load loans");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOverdueLoans = async () => {
    try {
      const response = await bookLoansService.getOverdueLoans();
      if (response.success) {
        setOverdueLoans(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load overdue loans:", error);
    }
  };

  const handleCreateLoan = async (e) => {
    e.preventDefault();

    try {
      // Get user by email
      const userResponse = await usersService.getUserByEmail(
        formData.userEmail
      );
      if (!userResponse.success) {
        toast.error("User not found");
        return;
      }

      // Search for book by ISBN
      const bookResponse = await booksService.searchBooks({
        q: formData.bookIsbn,
      });
      if (!bookResponse.success || bookResponse.data.length === 0) {
        toast.error("Book not found");
        return;
      }

      const book = bookResponse.data[0];
      const user = userResponse.data;

      const loanData = {
        userId: user.id,
        bookId: book.id,
        dueDate: new Date(formData.dueDate).toISOString(),
      };

      await bookLoansService.createLoan(loanData);
      toast.success("Loan created successfully");
      setDialogOpen(false);
      setFormData({
        userId: "",
        bookId: "",
        userEmail: "",
        bookIsbn: "",
        dueDate: "",
      });
      fetchLoans();
      fetchOverdueLoans();
    } catch (error) {
      toast.error(error.message || "Failed to create loan");
      console.error(error);
    }
  };

  const handleReturnBook = async (e) => {
    e.preventDefault();

    try {
      await bookLoansService.returnLoan(selectedLoan.id, {
        returnDate: new Date(returnDate).toISOString(),
      });
      toast.success("Book returned successfully");
      setReturnDialogOpen(false);
      setReturnDate("");
      fetchLoans();
      fetchOverdueLoans();
    } catch (error) {
      toast.error(error.message || "Failed to return book");
      console.error(error);
    }
  };

  const handleExtendLoan = async (e) => {
    e.preventDefault();

    try {
      await bookLoansService.extendLoan(selectedLoan.id, {
        newDueDate: new Date(newDueDate).toISOString(),
      });
      toast.success("Loan extended successfully");
      setExtendDialogOpen(false);
      setNewDueDate("");
      fetchLoans();
    } catch (error) {
      toast.error(error.message || "Failed to extend loan");
      console.error(error);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      ACTIVE: "default",
      RETURNED: "secondary",
      OVERDUE: "destructive",
      LOST: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Book Loans Management</h1>
          <p className="text-muted-foreground">
            Manage book borrowing and returns
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Loan
        </Button>
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
            All Loans
          </TabsTrigger>
          <TabsTrigger
            value="overdue"
            onClick={() => {
              setStatusFilter("OVERDUE");
              setPage(1);
            }}
          >
            Overdue ({overdueLoans.length})
          </TabsTrigger>
          <TabsTrigger
            value="active"
            onClick={() => {
              setStatusFilter("ACTIVE");
              setPage(1);
            }}
          >
            Active
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Loans</CardTitle>
              <CardDescription>Complete list of all book loans</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Book</TableHead>
                        <TableHead>Loan Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Return Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Fine</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loans.map((loan) => (
                        <TableRow key={loan.id}>
                          <TableCell>
                            {loan.user?.name || "N/A"}
                            <br />
                            <span className="text-xs text-muted-foreground">
                              {loan.user?.email || "N/A"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {loan.book?.title || "N/A"}
                            <br />
                            <span className="text-xs text-muted-foreground">
                              {loan.book?.author || "N/A"}
                            </span>
                          </TableCell>
                          <TableCell>{formatDate(loan.loanDate)}</TableCell>
                          <TableCell>{formatDate(loan.dueDate)}</TableCell>
                          <TableCell>{formatDate(loan.returnDate)}</TableCell>
                          <TableCell>{getStatusBadge(loan.status)}</TableCell>
                          <TableCell>
                            {loan.fineAmount > 0 ? `$${loan.fineAmount}` : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {loan.status === "ACTIVE" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedLoan(loan);
                                      setReturnDate(
                                        new Date().toISOString().split("T")[0]
                                      );
                                      setReturnDialogOpen(true);
                                    }}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Return
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedLoan(loan);
                                      setNewDueDate("");
                                      setExtendDialogOpen(true);
                                    }}
                                  >
                                    <Clock className="h-3 w-3 mr-1" />
                                    Extend
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {totalPages > 1 && (
                    <div className="mt-4 flex justify-center gap-2">
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

        <TabsContent value="overdue">
          <Card>
            <CardHeader>
              <CardTitle>Overdue Loans</CardTitle>
              <CardDescription>
                Books that are past their due date
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Book</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Days Overdue</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdueLoans.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell>
                        {loan.user?.name || "N/A"}
                        <br />
                        <span className="text-xs text-muted-foreground">
                          {loan.user?.email || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {loan.book?.title || "N/A"}
                        <br />
                        <span className="text-xs text-muted-foreground">
                          {loan.book?.author || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="text-destructive">
                        {formatDate(loan.dueDate)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">
                          {loan.daysOverdue} days
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedLoan(loan);
                            setReturnDate(
                              new Date().toISOString().split("T")[0]
                            );
                            setReturnDialogOpen(true);
                          }}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Return
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Loans</CardTitle>
              <CardDescription>Currently borrowed books</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Book</TableHead>
                      <TableHead>Loan Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loans.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell>
                          {loan.user?.name || "N/A"}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {loan.user?.email || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {loan.book?.title || "N/A"}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {loan.book?.author || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(loan.loanDate)}</TableCell>
                        <TableCell>{formatDate(loan.dueDate)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedLoan(loan);
                                setReturnDate(
                                  new Date().toISOString().split("T")[0]
                                );
                                setReturnDialogOpen(true);
                              }}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Return
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedLoan(loan);
                                setNewDueDate("");
                                setExtendDialogOpen(true);
                              }}
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              Extend
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
      </Tabs>

      {/* Create Loan Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Loan</DialogTitle>
            <DialogDescription>
              Issue a book to a library member
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateLoan} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userEmail">User Email *</Label>
              <Input
                id="userEmail"
                type="email"
                value={formData.userEmail}
                onChange={(e) =>
                  setFormData({ ...formData, userEmail: e.target.value })
                }
                placeholder="user@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bookIsbn">Book ISBN *</Label>
              <Input
                id="bookIsbn"
                value={formData.bookIsbn}
                onChange={(e) =>
                  setFormData({ ...formData, bookIsbn: e.target.value })
                }
                placeholder="978-0-123456-78-9"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Loan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Return Book Dialog */}
      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Book</DialogTitle>
            <DialogDescription>
              Process book return for {selectedLoan?.book?.title}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReturnBook} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="returnDate">Return Date *</Label>
              <Input
                id="returnDate"
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setReturnDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Process Return</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Extend Loan Dialog */}
      <Dialog open={extendDialogOpen} onOpenChange={setExtendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Loan</DialogTitle>
            <DialogDescription>
              Extend due date for {selectedLoan?.book?.title}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleExtendLoan} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newDueDate">New Due Date *</Label>
              <Input
                id="newDueDate"
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setExtendDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Extend Loan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
