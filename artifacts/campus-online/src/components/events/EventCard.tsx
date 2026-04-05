import { Event } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users, Heart } from "lucide-react";
import { format, parseISO } from "date-fns";

interface EventCardProps {
  event: Event;
  showStatus?: boolean;
}

export function EventCard({ event, showStatus = false }: EventCardProps) {
  const isUpcoming = new Date(event.startDate) > new Date();

  return (
    <Card className="overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200 group h-full">
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {event.imageUrl ? (
          <img 
            src={event.imageUrl} 
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/5">
            <CalendarDays className="h-12 w-12 text-primary/20" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {event.category && (
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm border-none shadow-sm font-medium">
              {event.category}
            </Badge>
          )}
        </div>
        {showStatus && (
          <div className="absolute top-3 right-3">
             <Badge variant={event.status === 'approved' ? 'default' : event.status === 'rejected' ? 'destructive' : 'secondary'} className="capitalize shadow-sm">
              {event.status}
            </Badge>
          </div>
        )}
      </div>
      
      <CardHeader className="p-4 pb-2 flex-none">
        <div className="flex justify-between items-start mb-1 gap-2">
          <h3 className="font-serif font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            <Link href={`/events/${event.id}`}>
              {event.title}
            </Link>
          </h3>
        </div>
        {event.clubName && (
          <Link href={`/clubs/${event.clubId}`} className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors w-fit">
            By {event.clubName}
          </Link>
        )}
      </CardHeader>
      
      <CardContent className="p-4 py-2 flex-1">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 shrink-0 text-primary/70" />
            <span className="truncate">
              {format(parseISO(event.startDate), "MMM d, yyyy • h:mm a")}
            </span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-primary/70" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>
        {event.description && (
          <p className="mt-3 text-sm text-foreground/80 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-3 flex-none border-t bg-muted/10 flex justify-between items-center text-xs text-muted-foreground">
        <div className="flex gap-3">
          <div className="flex items-center gap-1" title={`${event.attendeeCount} going`}>
            <Users className="h-3.5 w-3.5" />
            <span>{event.attendeeCount}</span>
          </div>
          <div className="flex items-center gap-1" title={`${event.interestedCount} interested`}>
            <Heart className="h-3.5 w-3.5" />
            <span>{event.interestedCount}</span>
          </div>
        </div>
        
        {isUpcoming ? (
          <span className="font-medium text-primary">Upcoming</span>
        ) : (
          <span>Past Event</span>
        )}
      </CardFooter>
    </Card>
  );
}
