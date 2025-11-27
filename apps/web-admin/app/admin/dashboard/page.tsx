'use client'


// src/app/(dashboard)/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Separator } from "@workspace/ui/components/separator";
import { Button } from "@workspace/ui/components/button";
import {
  Users,
  Newspaper,
  Briefcase,
  Package,
  FileText,
  UserPlus,
  PackagePlus,
  HelpCircle,
} from "lucide-react";
import LoadingComponent from "./components/loading";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [isAnyLoading, setIsAnyLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsAnyLoading(false), 1000)
  }, []);
  // Mock data
  const stats = [
    { title: "Total Users", value: "2,543", change: "+12% from last month", icon: Users, color: "text-blue-600" },
    { title: "Active News", value: "145", change: "+8% from last month", icon: Newspaper, color: "text-green-600" },
    { title: "Open Positions", value: "23", change: "+3% from last month", icon: Briefcase, color: "text-purple-600" },
    { title: "Products", value: "567", change: "+15% from last month", icon: Package, color: "text-orange-600" },
  ];

  const recentUsers = [
    { id: 1, name: "User 1", email: "user1@example.com", time: "2h ago", avatar: "U1" },
    { id: 2, name: "User 2", email: "user2@example.com", time: "2h ago", avatar: "U2" },
    { id: 3, name: "User 3", email: "user3@example.com", time: "2h ago", avatar: "U3" },
    { id: 4, name: "User 4", email: "user4@example.com", time: "2h ago", avatar: "U4" },
  ];

  const recentActivities = [
    { id: 1, title: "New article published", time: "5m ago", icon: FileText, color: "text-gray-500" },
    { id: 2, title: "User account created", time: "15m ago", icon: UserPlus, color: "text-blue-500" },
    { id: 3, title: "Product updated", time: "1h ago", icon: PackagePlus, color: "text-orange-500" },
    { id: 4, title: "FAQ added", time: "2h ago", icon: HelpCircle, color: "text-pink-500" },
  ];

  if (isAnyLoading) {
    return <LoadingComponent />
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.change.startsWith("+");
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-8 w-8 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl! font-bold! ${stat.color}`}>{stat.value}</div>
                <p
                  className={`text-xs ${isPositive ? "text-green-600" : "text-red-600"
                    }`}
                >
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bottom Section: Recent Users + Recent Activities */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest registered users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                      {user.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{user.time}</span>
              </div>
            ))}
            <Separator className="my-2" />
            <Button variant="outline" className="w-full text-sm">
              View all users
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <Icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <p className="text-sm font-medium">{activity.title}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              );
            })}
            <Separator className="my-2" />
            <Button variant="outline" className="w-full text-sm">
              View full log
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}