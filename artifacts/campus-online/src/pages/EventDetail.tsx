import { useLocation, useParams } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { useGetEvent, useReactToEvent, useRemoveReaction, useListEventAttendees } from "@workspace/api-client-react";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Users, Heart, Share2, ArrowLeft, Building2, UserCircle } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const eventId = parseInt(id || "0", 10);
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: event, isLoading, error } = useGetEvent(eventId, {
    query: { enabled: !!eventId, queryKey: ['event', eventId] }
  });

  const { data: attendees } = useListEventAttendees(eventId, {
    query: { enabled: !!eventId, queryKey: ['event-attendees', eventId] }
  });

  const reactMutation = useReactToEvent();
  const removeReactionMutation = useRemoveReaction();

  // Local optimistic state for reactions
  const [optimisticReaction, setOptimisticReaction] = useState<string | null>(null);
  const [attendeeDelta, setAttendeeDelta] = useState(0);
  const [interestedDelta, setInterestedDelta] = useState(0);

  useEffect(() => {
    if (event) {
      setOptimisticReaction(event.userReaction || null);
    }
  }, [event]);

  if (error) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
          <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link href="/events">Back to Events</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (isLoading || !event) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-8 w-24 mb-6" />
          <Skeleton className="w-full aspect-[21/9] rounded-2xl mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4 mb-6" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const handleReaction = async (type: 'going' | 'interested') => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to react to events.",
      });
      setLocation("/login");
      return;
    }

    const previousReaction = optimisticReaction;
    
    // Optimistic update
    if (previousReaction === type) {
      // Removing reaction
      setOptimisticReaction(null);
      if (type === 'going') setAttendeeDelta(d => d - 1);
      if (type === 'interested') setInterestedDelta(d => d - 1);
      
      try {
        await removeReactionMutation.mutateAsync({ id: eventId });
      } catch (e) {
        // Revert on failure
        setOptimisticReaction(previousReaction);
        if (type === 'going') setAttendeeDelta(d => d + 1);
        if (type === 'interested') setInterestedDelta(d => d + 1);
        toast({ variant: "destructive", title: "Error", description: "Failed to update reaction." });
      }
    } else {
      // Changing or adding reaction
      setOptimisticReaction(type);
      
      if (type === 'going') {
        setAttendeeDelta(d => d + 1);
        if (previousReaction === 'interested') setInterestedDelta(d => d - 1);
      } else {
        setInterestedDelta(d => d + 1);
        if (previousReaction === 'going') setAttendeeDelta(d => d - 1);
      }
      
      try {
        await reactMutation.mutateAsync({ id: eventId, data: { type } });
      } catch (e) {
        // Revert on failure
        setOptimisticReaction(previousReaction);
        if (type === 'going') {
          setAttendeeDelta(d => d - 1);
          if (previousReaction === 'interested') setInterestedDelta(d => d + 1);
        } else {
          setInterestedDelta(d => d - 1);
          if (previousReaction === 'going') setAttendeeDelta(d => d + 1);
        }
        toast({ variant: "destructive", title: "Error", description: "Failed to update reaction." });
      }
    }
  };

  const isGoing = optimisticReaction === 'going';
  const isInterested = optimisticReaction === 'interested';
  const displayAttendees = Math.max(0, event.attendeeCount + attendeeDelta);
  const displayInterested = Math.max(0, event.interestedCount + interestedDelta);

  return (
    <AppLayout>
      <div className="bg-muted/10 border-b">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-foreground" asChild>
            <Link href="/events">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to events
            </Link>
          </Button>
          
          <div className="relative w-full aspect-[21/9] bg-muted rounded-2xl overflow-hidden shadow-sm mb-8">
            {event.imageUrl ? (
              <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/5">
                <CalendarDays className="h-24 w-24 text-primary/20" />
              </div>
            )}
            {event.category && (
              <div className="absolute top-4 left-4">
                <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm px-3 py-1 text-sm shadow-sm">
                  {event.category}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            <div>
              <h1 className="text-4xl font-serif font-bold tracking-tight mb-4">{event.title}</h1>
              <div className="flex flex-wrap items-center gap-6 text-muted-foreground border-b pb-6">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <CalendarDays className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{format(parseISO(event.startDate), "EEEE, MMMM d, yyyy")}</p>
                    <p className="text-sm">{format(parseISO(event.startDate), "h:mm a")}</p>
                  </div>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Location</p>
                      <p className="text-sm">{event.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="prose prose-lg max-w-none text-foreground/80">
              <h3 className="font-serif text-2xl font-semibold text-foreground">About this event</h3>
              {event.description ? (
                <p className="whitespace-pre-wrap leading-relaxed">{event.description}</p>
              ) : (
                <p className="italic text-muted-foreground">No description provided.</p>
              )}
            </div>

            {/* Attendees Section */}
            <div className="pt-8 border-t">
              <h3 className="font-serif text-xl font-semibold mb-4">Who's Going ({displayAttendees})</h3>
              {attendees && attendees.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                  {attendees.filter(a => a.type === 'going').map(attendee => (
                    <div key={attendee.id} className="flex items-center gap-2 bg-muted/30 rounded-full pr-4 p-1">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {attendee.userName?.substring(0, 2).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{attendee.userName}</span>
                    </div>
                  ))}
                  {displayAttendees > (attendees.filter(a => a.type === 'going').length) && (
                    <div className="flex items-center justify-center h-10 px-4 rounded-full bg-muted/50 text-sm font-medium text-muted-foreground">
                      +{displayAttendees - attendees.filter(a => a.type === 'going').length} more
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg inline-block">Be the first to say you're going!</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-muted/10 border rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="font-semibold mb-4">Are you attending?</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <Button 
                  variant={isGoing ? "default" : "outline"} 
                  className={`h-12 flex items-center justify-center gap-2 ${isGoing ? 'shadow-md ring-2 ring-primary/20' : ''}`}
                  onClick={() => handleReaction('going')}
                >
                  <Users className="h-4 w-4" />
                  Going
                </Button>
                <Button 
                  variant={isInterested ? "secondary" : "outline"} 
                  className={`h-12 flex items-center justify-center gap-2 ${isInterested ? 'shadow-md border-secondary-foreground/20' : ''}`}
                  onClick={() => handleReaction('interested')}
                >
                  <Heart className={`h-4 w-4 ${isInterested ? 'fill-current text-destructive' : ''}`} />
                  Interested
                </Button>
              </div>

              <div className="flex justify-between text-sm text-muted-foreground border-t pt-4 mb-6">
                <span className="flex items-center"><Users className="h-4 w-4 mr-1" /> {displayAttendees} Going</span>
                <span className="flex items-center"><Heart className="h-4 w-4 mr-1" /> {displayInterested} Interested</span>
              </div>

              <Button variant="outline" className="w-full" onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast({ title: "Link copied!", description: "Event link copied to clipboard." });
              }}>
                <Share2 className="mr-2 h-4 w-4" /> Share Event
              </Button>
            </div>

            {event.clubName && (
              <div className="border rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Organized By</h3>
                <Link href={`/clubs/${event.clubId}`} className="group flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-lg group-hover:text-primary transition-colors">{event.clubName}</h4>
                    <p className="text-sm text-muted-foreground">View club profile</p>
                  </div>
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
