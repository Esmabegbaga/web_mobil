import { Announcement } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Clock } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";

interface AnnouncementCardProps {
  announcement: Announcement;
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-sm transition-shadow">
      <CardHeader className="p-4 pb-2 space-y-2">
        <div className="flex justify-between items-start gap-4">
          <div className="flex gap-2 items-center flex-wrap">
            {announcement.isGlobal ? (
              <Badge variant="default" className="bg-primary/90 hover:bg-primary">
                <Megaphone className="h-3 w-3 mr-1" /> Campus Wide
              </Badge>
            ) : (
              <Badge variant="secondary">
                Club Update
              </Badge>
            )}
            
            {announcement.clubName && !announcement.isGlobal && (
              <Link href={`/clubs/${announcement.clubId}`}>
                <Badge variant="outline" className="hover:bg-muted cursor-pointer transition-colors">
                  {announcement.clubName}
                </Badge>
              </Link>
            )}
          </div>
          <div className="flex items-center text-xs text-muted-foreground shrink-0">
            <Clock className="h-3 w-3 mr-1" />
            {formatDistanceToNow(parseISO(announcement.createdAt), { addSuffix: true })}
          </div>
        </div>
        <h3 className="font-serif font-bold text-lg leading-snug">
          {announcement.title}
        </h3>
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        <div className="prose prose-sm prose-p:leading-relaxed max-w-none text-muted-foreground whitespace-pre-wrap">
          {announcement.content}
        </div>
        <div className="mt-4 pt-3 border-t flex justify-between items-center text-xs text-muted-foreground">
          <span>Posted by {announcement.authorName || 'Unknown User'}</span>
        </div>
      </CardContent>
    </Card>
  );
}
