"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { authService, usersService } from "@/lib/api";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    } else if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading, user]);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await usersService.updateUser(user.id, {
        name: profileData.name,
        email: profileData.email,
      });
      toast.success("Profile updated successfully");
      setEditing(false);
      // Refresh user data
      window.location.reload();
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Password changed successfully");
      setChangingPassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error.message || "Failed to change password");
    }
  };

  if (authLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">Profile Settings</h1>
          <p className="text-stone-600 dark:text-stone-400 mt-1">Manage your library account</p>
        </div>

        {/* Profile Info Card */}
        <Card className="mb-6 border-l-4 border-l-slate-700 shadow-sm bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/20">
          <CardHeader className="bg-gradient-to-r from-slate-100/60 via-gray-100/40 to-zinc-100/30 dark:from-slate-900/60 dark:via-gray-900/40 dark:to-zinc-900/30">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 ring-2 ring-slate-300 ring-offset-2 dark:ring-slate-700">
                <AvatarFallback className="text-2xl bg-gradient-to-br from-slate-700 via-gray-800 to-zinc-800 text-white font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl text-slate-800 dark:text-slate-100">{user.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1.5 text-slate-600 dark:text-slate-400">
                  {user.email}
                </CardDescription>
                <Badge className="mt-2 bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
                  {user.role}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  disabled={!editing}
                  className={!editing ? "bg-muted" : ""}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  disabled={!editing}
                  className={!editing ? "bg-muted" : ""}
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={user.phoneNumber || "Not provided"}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Contact admin to update phone number
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {!editing ? (
                <Button onClick={() => setEditing(true)} className="bg-gradient-to-r from-slate-700 via-gray-800 to-zinc-800 hover:from-slate-800 hover:via-gray-900 hover:to-zinc-900 text-white shadow-sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button onClick={handleProfileUpdate} className="bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white shadow-sm">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
                    onClick={() => {
                      setEditing(false);
                      setProfileData({
                        name: user.name || "",
                        email: user.email || "",
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card className="border-l-4 border-l-stone-600 shadow-sm bg-gradient-to-br from-white to-stone-50/30 dark:from-stone-900 dark:to-stone-950/20">
          <CardHeader className="bg-gradient-to-r from-stone-50/50 to-neutral-50/30 dark:from-stone-950/30 dark:to-neutral-950/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-stone-600 to-stone-800 rounded-lg shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-stone-800 dark:text-stone-100">Security</CardTitle>
                <CardDescription className="text-stone-600 dark:text-stone-400">
                  Manage your password and security settings
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!changingPassword ? (
              <Button
                variant="outline"
                onClick={() => setChangingPassword(true)}
                className="border-stone-300 text-stone-700 hover:bg-stone-50 hover:text-stone-800 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-900"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Change Password
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    placeholder="Enter current password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button onClick={handlePasswordChange} className="bg-gradient-to-r from-stone-700 to-stone-800 hover:from-stone-800 hover:to-stone-900 text-white shadow-sm">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Update Password
                  </Button>
                  <Button
                    variant="outline"
                    className="border-stone-300 text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-900"
                    onClick={() => {
                      setChangingPassword(false);
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
