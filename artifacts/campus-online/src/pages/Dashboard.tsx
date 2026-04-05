import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/lib/auth";
import { Redirect } from "wouter";
import { useGetDashboardSummary, useListEvents } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventCard } from "@/components/events/EventCard";
import { Activity, Calendar, Clock, Megaphone, Users, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect to="/login" />;
  }

  return (
    <AppLayout>
      <div className="bg-primary/5 py-12 border-b">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-serif font-bold tracking-tight mb-2">Welcome back, {user.name.split(' ')[0]}</h1>
          <p className="text-lg text-muted-foreground">
            {user.role === 'admin' && "Here's an overview of campus activity."}
            {user.role === 'club_official' && "Manage your club's presence on campus."}
            {user.role === 'student' && "Your personalized campus dashboard."}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {user.role === 'admin' && <AdminDashboard />}
        {user.role === 'student' && <StudentDashboard />}
        {user.role === 'club_official' && <ClubDashboard clubId={user.clubId!} />}
      </div>
    </AppLayout>
  );
}

function AdminDashboard() {
  const { data: stats, isLoading } = useGetDashboardSummary({
    query: { queryKey: ['dashboard-stats'] }
  });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Users", value: stats?.totalStudents, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
          { title: "Active Clubs", value: stats?.totalClubs, icon: BuildingIcon, color: "text-purple-500", bg: "bg-purple-500/10" },
          { title: "Total Events", value: stats?.totalEvents, icon: Calendar, color: "text-green-500", bg: "bg-green-500/10" },
          { title: "Pending Approvals", value: stats?.pendingApprovals, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" }
        ].map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold">{stat.value || 0}</div>}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="flex justify-between items-center bg-amber-500/10 border border-amber-500/20 p-6 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="bg-amber-500/20 p-3 rounded-full text-amber-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Event Approvals</h3>
            <p className="text-sm text-muted-foreground">You have {stats?.pendingApprovals || 0} events waiting for review.</p>
          </div>
        </div>
        <Button asChild>
          <Link href="/admin/events">Review Events</Link>
        </Button>
      </div>
    </div>
  );
}

function StudentDashboard() {
  // Fetch events the user is attending/interested in
  // For now, we'll fetch upcoming events as a placeholder since the API 
  // doesn't have a specific endpoint for "my reactions" 
  const { data: upcomingEvents, isLoading } = useListEvents({
    upcoming: true,
    limit: 6
  }, { query: { queryKey: ['student-dashboard-events'] }});

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b pb-4">
        <h2 className="text-2xl font-serif font-semibold">Recommended for You</h2>
        <Button variant="outline" size="sm" asChild>
          <Link href="/events">Browse All</Link>
        </Button>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-80 w-full rounded-xl" />)}
        </div>
      ) : upcomingEvents?.events && upcomingEvents.events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingEvents.events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/10 rounded-xl border-dashed border-2">
          <Calendar className="mx-auto h-10 w-10 text-muted-foreground opacity-30 mb-4" />
          <h3 className="text-lg font-medium">No upcoming events</h3>
          <p className="text-muted-foreground mb-4">It's quiet on campus right now.</p>
          <Button asChild>
            <Link href="/clubs">Discover Clubs</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

function ClubDashboard({ clubId }: { clubId: number }) {
  const { data: events, isLoading } = useListEvents({
    clubId: clubId
  }, { query: { queryKey: ['club-manage-events', clubId] }});

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-primary/10 border border-primary/20 p-6 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="bg-primary/20 p-3 rounded-full text-primary">
            <Megaphone className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Manage Club</h3>
            <p className="text-sm text-muted-foreground">Create events and broadcast announcements.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/my-events">Manage Events</Link>
          </Button>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-serif font-semibold mb-6 border-b pb-4">Recent Club Events</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-80 w-full rounded-xl" />)}
          </div>
        ) : events?.events && events.events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.events.slice(0, 3).map(event => (
              <EventCard key={event.id} event={event} showStatus={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/10 rounded-xl border-dashed border-2">
            <Calendar className="mx-auto h-10 w-10 text-muted-foreground opacity-30 mb-4" />
            <h3 className="text-lg font-medium">No events created</h3>
            <p className="text-muted-foreground mb-4">Your club hasn't hosted any events yet.</p>
            <Button asChild>
              <Link href="/my-events">Create First Event</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Icon alias to avoid conflict
const BuildingIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
    <path d="M9 22v-4h6v4"></path>
    <path d="M8 6h.01"></path>
    <path d="M16 6h.01"></path>
    <path d="M12 6h.01"></path>
    <path d="M12 10h.01"></path>
    <path d="M12 14h.01"></path>
    <path d="M16 10h.01"></path>
    <path d="M16 14h.01"></path>
    <path d="M8 10h.01"></path>
    <path d="M8 14h.01"></path>
  </svg>
);
