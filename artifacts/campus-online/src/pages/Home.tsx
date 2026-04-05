import { useListUpcomingEvents, useListFeaturedClubs, useGetDashboardSummary, useListAnnouncements } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { EventCard } from "@/components/events/EventCard";
import { ClubCard } from "@/components/clubs/ClubCard";
import { AnnouncementCard } from "@/components/announcements/AnnouncementCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Calendar, Users, Megaphone, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: upcomingEvents, isLoading: loadingEvents } = useListUpcomingEvents({
    query: { queryKey: ['upcoming-events'] }
  });
  
  const { data: featuredClubs, isLoading: loadingClubs } = useListFeaturedClubs({
    query: { queryKey: ['featured-clubs'] }
  });

  const { data: recentAnnouncements, isLoading: loadingAnnouncements } = useListAnnouncements(
    { limit: 3 },
    { query: { queryKey: ['recent-announcements', { limit: 3 }] } }
  );

  const { data: stats, isLoading: loadingStats } = useGetDashboardSummary({
    query: { queryKey: ['home-stats'] }
  });

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary/5 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight text-foreground">
              Your Campus Life,<br />
              <span className="text-primary relative whitespace-nowrap">
                <span className="relative z-10">Connected</span>
                <span className="absolute -bottom-2 left-0 w-full h-3 bg-primary/20 -rotate-1 z-0"></span>
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Discover events, join clubs, and stay updated with what's happening around campus. The vibrant digital bulletin board for university life.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8" asChild>
                <Link href="/events">
                  Browse Events <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-12 px-8 bg-background/50 backdrop-blur-sm" asChild>
                <Link href="/clubs">
                  Explore Clubs
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="border-y bg-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 divide-x divide-border/50">
            {[
              { label: "Active Clubs", value: stats?.totalClubs, icon: Users, loading: loadingStats },
              { label: "Upcoming Events", value: stats?.upcomingEvents, icon: Calendar, loading: loadingStats },
              { label: "Announcements", value: stats?.recentAnnouncements, icon: Megaphone, loading: loadingStats },
              { label: "Students Online", value: stats?.totalStudents, icon: Activity, loading: loadingStats },
            ].map((stat, i) => (
              <div key={i} className={`flex flex-col items-center text-center px-4 ${i % 2 === 0 ? 'border-l-0' : ''} ${i === 0 ? 'md:border-l-0' : ''}`}>
                <stat.icon className="h-6 w-6 text-primary/50 mb-2" />
                {stat.loading ? (
                  <Skeleton className="h-8 w-16 mb-1" />
                ) : (
                  <span className="text-3xl font-bold font-serif text-foreground">{stat.value || 0}</span>
                )}
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 space-y-24">
        {/* Upcoming Events */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold font-serif mb-2">Upcoming Events</h2>
              <p className="text-muted-foreground">Don't miss out on what's happening this week.</p>
            </div>
            <Button variant="ghost" className="hidden sm:flex" asChild>
              <Link href="/events">View all <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingEvents ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ))
            ) : upcomingEvents?.events && upcomingEvents.events.length > 0 ? (
              upcomingEvents.events.slice(0, 3).map((event) => (
                <EventCard key={event.id} event={event} />
              ))
            ) : (
              <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl bg-muted/10">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium text-foreground mb-1">No upcoming events</h3>
                <p className="text-muted-foreground">Check back later for new activities.</p>
              </div>
            )}
          </div>
          <Button variant="outline" className="w-full mt-6 sm:hidden" asChild>
            <Link href="/events">View all events</Link>
          </Button>
        </section>

        {/* Two Column Layout for Clubs & Announcements */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Featured Clubs */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold font-serif mb-2">Featured Clubs</h2>
                <p className="text-muted-foreground">Find your people and explore your passions.</p>
              </div>
              <Button variant="ghost" asChild>
                <Link href="/clubs">View all <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loadingClubs ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="flex flex-col space-y-3 border rounded-xl p-5">
                    <div className="flex gap-4">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="space-y-2 flex-1 pt-2">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </div>
                    <Skeleton className="h-16 w-full mt-4" />
                  </div>
                ))
              ) : featuredClubs?.clubs && featuredClubs.clubs.length > 0 ? (
                featuredClubs.clubs.slice(0, 4).map((club) => (
                  <ClubCard key={club.id} club={club} />
                ))
              ) : (
                <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl bg-muted/10">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <h3 className="text-lg font-medium text-foreground mb-1">No clubs found</h3>
                  <p className="text-muted-foreground">Clubs will appear here once registered.</p>
                </div>
              )}
            </div>
          </div>

          {/* Announcements Feed */}
          <div className="space-y-8">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold font-serif mb-2">Latest News</h2>
                <p className="text-muted-foreground">Campus updates.</p>
              </div>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/announcements"><ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>

            <div className="flex flex-col gap-4">
              {loadingAnnouncements ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="border rounded-xl p-4 space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ))
              ) : recentAnnouncements?.announcements && recentAnnouncements.announcements.length > 0 ? (
                recentAnnouncements.announcements.map((announcement) => (
                  <AnnouncementCard key={announcement.id} announcement={announcement} />
                ))
              ) : (
                <div className="py-12 text-center border-2 border-dashed rounded-xl bg-muted/10">
                  <Megaphone className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-20" />
                  <p className="text-sm text-muted-foreground">No recent announcements.</p>
                </div>
              )}
              
              {recentAnnouncements?.announcements && recentAnnouncements.announcements.length > 0 && (
                 <Button variant="outline" className="w-full" asChild>
                   <Link href="/announcements">Read all announcements</Link>
                 </Button>
              )}
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
