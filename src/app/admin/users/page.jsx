"use client";

import { useState, useEffect } from "react";
import { usersService } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, UserPlus, UserMinus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [membershipDialogOpen, setMembershipDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter === "members") {
        params.isMember = "true";
      } else if (filter === "active") {
        params.isActive = "true";
      }

      const response = await usersService.getUsers(params);
      if (response.success) {
        setUsers(response.data || []);
      }
    } catch (error) {
      toast.error("Failed to load users");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchUsers();
      return;
    }

    setLoading(true);
    try {
      const response = await usersService.getUserByEmail(searchTerm);
      if (response.success) {
        setUsers([response.data]);
      }
    } catch (error) {
      toast.error("User not found");
      console.error(error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMembership = async (userId) => {
    try {
      await usersService.updateMembership(userId, {});
      toast.success("Membership added successfully");
      fetchUsers();
      setMembershipDialogOpen(false);
    } catch (error) {
      toast.error(error.message || "Failed to add membership");
      console.error(error);
    }
  };

  const handleRemoveMembership = async (userId) => {
    if (!confirm("Are you sure you want to remove this membership?")) return;

    try {
      await usersService.deleteMembership(userId);
      toast.success("Membership removed successfully");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to remove membership");
      console.error(error);
    }
  };

  const handleDeactivateUser = async (userId) => {
    if (!confirm("Are you sure you want to deactivate this user?")) return;

    try {
      await usersService.deleteUser(userId);
      toast.success("User deactivated successfully");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to deactivate user");
      console.error(error);
    }
  };

  const getRoleBadge = (role) => {
    const variants = {
      ADMIN: "destructive",
      STAFF: "default",
      USER: "secondary",
    };
    return <Badge variant={variants[role] || "secondary"}>{role}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const filteredUsers = searchTerm
    ? users
    : users.filter((user) => {
        if (filter === "members") return user.isMember;
        if (filter === "active") return user.isActive;
        return true;
      });

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Users Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage library users and memberships
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-lg md:text-xl">Search Users</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full"
            />
            <Button onClick={handleSearch} className="w-full sm:w-auto">
              <Search className="h-4 w-4 mr-2" />
              <span>Search</span>
            </Button>
            {searchTerm && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  fetchUsers();
                }}
                className="w-full sm:w-auto"
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="w-full grid grid-cols-3 h-auto">
          <TabsTrigger
            value="all"
            onClick={() => {
              setFilter("all");
              setSearchTerm("");
            }}
            className="text-xs sm:text-sm"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="members"
            onClick={() => {
              setFilter("members");
              setSearchTerm("");
            }}
            className="text-xs sm:text-sm"
          >
            Members
          </TabsTrigger>
          <TabsTrigger
            value="active"
            onClick={() => {
              setFilter("active");
              setSearchTerm("");
            }}
            className="text-xs sm:text-sm"
          >
            Active
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl">All Users</CardTitle>
              <CardDescription className="text-sm">
                Total: {filteredUsers.length} users
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 md:p-6">
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phoneNumber || "N/A"}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          {user.isMember ? (
                            <Badge variant="default">Member</Badge>
                          ) : (
                            <Badge variant="outline">Non-member</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.isActive ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="destructive">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(user.lastLogin)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {!user.isMember && user.role === "USER" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddMembership(user.id)}
                              >
                                <UserPlus className="h-3 w-3 mr-1" />
                                Add Membership
                              </Button>
                            )}
                            {user.isMember && user.role === "USER" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemoveMembership(user.id)}
                              >
                                <UserMinus className="h-3 w-3 mr-1" />
                                Remove
                              </Button>
                            )}
                            {user.isActive && user.role === "USER" && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeactivateUser(user.id)}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Deactivate
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Library Members</CardTitle>
              <CardDescription>Users with active memberships</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Member Since</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phoneNumber || "N/A"}</TableCell>
                        <TableCell>
                          {formatDate(user.membership?.startDate)}
                        </TableCell>
                        <TableCell>
                          {formatDate(user.membership?.endDate)}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveMembership(user.id)}
                          >
                            <UserMinus className="h-3 w-3 mr-1" />
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Users</CardTitle>
              <CardDescription>Currently active accounts</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          {user.isMember ? (
                            <Badge variant="default">Yes</Badge>
                          ) : (
                            <Badge variant="outline">No</Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(user.lastLogin)}</TableCell>
                        <TableCell>
                          {user.role === "USER" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeactivateUser(user.id)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Deactivate
                            </Button>
                          )}
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
    </div>
  );
}
