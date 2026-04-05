import { useLocation, useParams } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { useGetClub, useListEvents } from "@workspace/api-client-react";
import { EventCard } from "@/components/events/EventCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, CalendarDays, ArrowLeft, Mail } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ClubDetail() {
  const { id } = useParams<{ id: string }>();
  const clubId = parseInt(id || "0", 10);

  const { data: club, isLoading, error } = useGetClub(clubId, {
    query: { enabled: !!clubId, queryKey: ['club', clubId] }
  });

  const { data: eventsData, isLoading: loadingEvents } = useListEvents(
    { clubId, status: "approved" },
    { query: { enabled: !!clubId, queryKey: ['club-events', clubId] } }
  );

  if (error) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-2xl font-bold mb-2">Club Not Found</h2>
          <p className="text-muted-foreground mb-6">The club you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/clubs">Browse Clubs</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (isLoading || !club) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="flex gap-6 mb-12 items-center">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-4 flex-1">
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-6 w-1/4" />
            </div>
          </div>
          <Skeleton className="h-32 w-full mb-12" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="bg-gradient-to-b from-primary/10 to-background border-b pb-8">
        <div className="container mx-auto px-4 pt-6 pb-4 max-w-5xl">
          <Button variant="ghost" size="sm" className="mb-6 -ml-3 text-muted-foreground hover:text-foreground" asChild>
            <Link href="/clubs">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to clubs
            </Link>
          </Button>
          
          <div className="flex flex-col md:flex-row gap-6 md:items-end">
            <Avatar className="h-32 w-32 border-4 border-background shadow-lg bg-white shrink-0">
              <AvatarImage src={club.logoUrl || undefined} alt={club.name} className="object-contain p-2" />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-4xl">
                {club.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 pb-2">
              {club.category && (
                <Badge variant="outline" className="mb-3 border-primary/20 bg-background/50 backdrop-blur text-primary font-medium px-3 py-1">
                  {club.category}
                </Badge>
              )}
              <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-4 text-foreground">{club.name}</h1>
              
              <div className="flex flex-wrap gap-4 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-1.5 bg-background/50 px-3 py-1.5 rounded-full shadow-sm">
                  <Users className="h-4 w-4 text-primary" />
                  <span>{club.memberCount} Members</span>
                </div>
                <div className="flex items-center gap-1.5 bg-background/50 px-3 py-1.5 rounded-full shadow-sm">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <span>{club.eventCount} Hosted Events</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 pb-2 md:self-end">
              <Button>Join Club</Button>
              <Button variant="outline" size="icon">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl flex flex-col gap-12">
        <section className="bg-muted/10 rounded-2xl p-8 border">
          <h2 className="text-2xl font-serif font-semibold mb-4">About</h2>
          {club.description ? (
            <p className="text-lg leading-relaxed text-foreground/80 whitespace-pre-wrap">{club.description}</p>
          ) : (
            <p className="italic text-muted-foreground">No description provided.</p>
          )}
        </section>

        <section>
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-3xl font-serif font-bold tracking-tight">Events by {club.name}</h2>
          </div>
          
          {loadingEvents ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-80 w-full rounded-xl" />
              ))}
            </div>
          ) : eventsData?.events && eventsData.events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventsData.events.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center border-2 border-dashed rounded-xl bg-muted/10">
              <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-foreground mb-1">No upcoming events</h3>
              <p className="text-muted-foreground">This club hasn't scheduled any events yet.</p>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
