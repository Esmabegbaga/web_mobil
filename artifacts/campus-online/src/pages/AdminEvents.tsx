import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/lib/auth";
import { Redirect, Link } from "wouter";
import { useListEvents, useApproveEvent } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Calendar, Check, X } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function AdminEvents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  if (!user || user.role !== 'admin') {
    return <Redirect to="/" />;
  }

  const { data: pendingEvents, isLoading } = useListEvents(
    { status: "pending" },
    { query: { queryKey: ['admin-pending-events'] } }
  );

  const approveMutation = useApproveEvent();

  const handleApproval = async (eventId: number, approved: boolean) => {
    try {
      await approveMutation.mutateAsync({
        id: eventId,
        data: { approved }
      });
      
      queryClient.invalidateQueries({ queryKey: ['admin-pending-events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      
      toast({
        title: approved ? "Event Approved" : "Event Rejected",
        description: `The event has been ${approved ? 'published to the campus feed' : 'rejected'}.`,
      });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: e?.message || "Failed to process event.",
      });
    }
  };

  return (
    <AppLayout>
      <div className="bg-primary/5 py-12 border-b">
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="text-3xl font-serif font-bold tracking-tight mb-2">Event Moderation</h1>
          <p className="text-muted-foreground">Review and approve club events before they go live.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl flex-1">
        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : pendingEvents?.events && pendingEvents.events.length > 0 ? (
          <div className="space-y-6">
            {pendingEvents.events.map((event) => (
              <Card key={event.id} className="overflow-hidden flex flex-col md:flex-row">
                <div className="w-full md:w-64 h-48 md:h-auto bg-muted relative shrink-0">
                  {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Calendar className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold font-serif mb-1">{event.title}</h3>
                        <p className="text-sm font-medium text-primary">Organized by {event.clubName}</p>
                      </div>
                      <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border-amber-500/20">Pending</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="py-2 flex-1">
                    <div className="text-sm text-muted-foreground mb-4 space-y-1">
                      <p><strong>Date:</strong> {format(parseISO(event.startDate), "MMM d, yyyy • h:mm a")}</p>
                      {event.location && <p><strong>Location:</strong> {event.location}</p>}
                      {event.category && <p><strong>Category:</strong> {event.category}</p>}
                    </div>
                    <p className="text-sm line-clamp-3">{event.description}</p>
                  </CardContent>
                  <CardFooter className="pt-4 border-t bg-muted/10 flex justify-between">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/events/${event.id}`}>View Details</Link>
                    </Button>
                    <div className="flex gap-2">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleApproval(event.id, false)}
                        disabled={approveMutation.isPending}
                      >
                        <X className="mr-1 h-4 w-4" /> Reject
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleApproval(event.id, true)}
                        disabled={approveMutation.isPending}
                      >
                        <Check className="mr-1 h-4 w-4" /> Approve
                      </Button>
                    </div>
                  </CardFooter>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border-2 border-dashed rounded-xl bg-muted/10">
            <Check className="h-16 w-16 text-emerald-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-foreground mb-2">All Caught Up!</h3>
            <p className="text-muted-foreground">
              There are no pending events waiting for your approval.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
