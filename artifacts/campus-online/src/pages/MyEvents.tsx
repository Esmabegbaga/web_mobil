import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/lib/auth";
import { Redirect } from "wouter";
import { useListEvents, useCreateEvent, useUpdateEvent, useDeleteEvent } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Edit, Trash2, CalendarDays, Users } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

const eventSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

export default function MyEvents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  if (!user || user.role !== 'club_official') {
    return <Redirect to="/" />;
  }

  const { data: eventsData, isLoading } = useListEvents(
    { clubId: user.clubId! },
    { query: { queryKey: ['my-club-events', user.clubId] } }
  );

  const createMutation = useCreateEvent();
  const deleteMutation = useDeleteEvent();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      location: "",
      imageUrl: "",
      startDate: new Date().toISOString().slice(0, 16), // YYYY-MM-DDThh:mm
      endDate: "",
    }
  });

  const onSubmit = async (values: EventFormValues) => {
    try {
      await createMutation.mutateAsync({ data: values });
      queryClient.invalidateQueries({ queryKey: ['my-club-events'] });
      setIsCreateOpen(false);
      form.reset();
      toast({
        title: "Event Created",
        description: "Your event has been submitted for admin approval.",
      });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: e?.message || "Failed to create event.",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    
    try {
      await deleteMutation.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: ['my-club-events'] });
      toast({ title: "Event Deleted", description: "The event has been removed." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete event." });
    }
  };

  return (
    <AppLayout>
      <div className="bg-primary/5 py-12 border-b">
        <div className="container mx-auto px-4 max-w-5xl flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight mb-2">Manage Events</h1>
            <p className="text-muted-foreground">Create and manage events for your club.</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="shrink-0 shadow-md">
                <Plus className="mr-2 h-4 w-4" /> Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Event Title *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="academic">Academic</SelectItem>
                          <SelectItem value="social">Social</SelectItem>
                          <SelectItem value="sports">Sports</SelectItem>
                          <SelectItem value="arts">Arts & Culture</SelectItem>
                          <SelectItem value="career">Career/Networking</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="startDate" render={({ field }) => (
                      <FormItem><FormLabel>Start Date & Time *</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="endDate" render={({ field }) => (
                      <FormItem><FormLabel>End Date & Time</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="imageUrl" render={({ field }) => (
                    <FormItem><FormLabel>Cover Image URL</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea className="min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                    {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Submit for Approval
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl flex-1">
        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : eventsData?.events && eventsData.events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventsData.events.map((event) => (
              <Card key={event.id} className="flex flex-col overflow-hidden">
                <div className="aspect-video w-full bg-muted relative">
                  {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><CalendarDays className="h-10 w-10 text-muted-foreground/30" /></div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant={event.status === 'approved' ? 'default' : event.status === 'rejected' ? 'destructive' : 'secondary'} className="shadow-sm capitalize">
                      {event.status}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-xl font-serif line-clamp-1">{event.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex-1">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{format(parseISO(event.startDate), "MMM d, yyyy • h:mm a")}</p>
                    <p className="flex items-center gap-1 mt-2">
                      <Users className="h-4 w-4" /> {event.attendeeCount} Attendees
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="p-4 bg-muted/10 border-t flex justify-between gap-2">
                  <Button variant="outline" size="sm" className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(event.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" disabled>
                    <Edit className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border-2 border-dashed rounded-xl bg-muted/10">
            <CalendarDays className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
            <h3 className="text-xl font-medium text-foreground mb-2">No Events Yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
              Create your first event to start engaging with the campus community.
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>Create First Event</Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
