import { Club } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, CalendarDays, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface ClubCardProps {
  club: Club;
}

export function ClubCard({ club }: ClubCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200 h-full group">
      <CardHeader className="p-5 pb-4 flex-none relative">
        <div className="flex justify-between items-start">
          <Avatar className="h-16 w-16 border-2 border-background shadow-sm bg-white shrink-0">
            <AvatarImage src={club.logoUrl || undefined} alt={club.name} className="object-contain p-1" />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
              {club.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {club.category && (
            <Badge variant="outline" className="bg-muted/50 font-medium text-xs">
              {club.category}
            </Badge>
          )}
        </div>
        <h3 className="font-serif font-bold text-xl mt-3 leading-tight group-hover:text-primary transition-colors">
          <Link href={`/clubs/${club.id}`}>
            {club.name}
          </Link>
        </h3>
      </CardHeader>
      
      <CardContent className="p-5 py-0 flex-1">
        {club.description ? (
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {club.description}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground italic">No description provided.</p>
        )}
      </CardContent>
      
      <CardFooter className="p-5 pt-4 flex-none flex flex-col gap-4">
        <div className="flex gap-4 w-full text-sm font-medium text-muted-foreground">
          <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
            <Users className="h-4 w-4 text-primary/70" />
            <span>{club.memberCount} <span className="font-normal opacity-70">members</span></span>
          </div>
          <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
            <CalendarDays className="h-4 w-4 text-primary/70" />
            <span>{club.eventCount} <span className="font-normal opacity-70">events</span></span>
          </div>
        </div>
        
        <Button variant="outline" className="w-full justify-between group-hover:bg-primary group-hover:text-primary-foreground transition-colors" asChild>
          <Link href={`/clubs/${club.id}`}>
            View Club
            <ChevronRight className="h-4 w-4 opacity-50 group-hover:opacity-100" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
