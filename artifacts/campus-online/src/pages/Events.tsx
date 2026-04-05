import { AppLayout } from "@/components/layout/AppLayout";
import { EventCard } from "@/components/events/EventCard";
import { useListEvents, useListEventCategories } from "@workspace/api-client-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export default function Events() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [upcomingOnly, setUpcomingOnly] = useState(false);

  // Simple debounce for search
  useState(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: eventsData, isLoading } = useListEvents(
    { 
      search: debouncedSearch || undefined, 
      category, 
      upcoming: upcomingOnly ? true : undefined,
      status: "approved"
    },
    { query: { queryKey: ['events', debouncedSearch, category, upcomingOnly] } }
  );

  const { data: categories } = useListEventCategories({
    query: { queryKey: ['event-categories'] }
  });

  return (
    <AppLayout>
      <div className="bg-primary/5 py-12 border-b">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-serif font-bold tracking-tight mb-4">Discover Events</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Find out what's happening on campus. From club meetings to university-wide festivals.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4 max-w-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input 
                type="search"
                placeholder="Search for events..." 
                className="pl-10 h-12 text-base bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-12 bg-background">
                    <Filter className="mr-2 h-4 w-4" />
                    {category || "All Categories"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="start">
                  <div className="space-y-1">
                    <Button 
                      variant={category === undefined ? "secondary" : "ghost"} 
                      className="w-full justify-start font-normal"
                      onClick={() => setCategory(undefined)}
                    >
                      All Categories
                    </Button>
                    {categories?.map((cat) => (
                      <Button 
                        key={cat}
                        variant={category === cat ? "secondary" : "ghost"} 
                        className="w-full justify-start font-normal"
                        onClick={() => setCategory(cat)}
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <Button 
                variant={upcomingOnly ? "default" : "outline"} 
                className={`h-12 ${!upcomingOnly && 'bg-background'}`}
                onClick={() => setUpcomingOnly(!upcomingOnly)}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                Upcoming
              </Button>
            </div>
          </div>
          
          {(category || upcomingOnly) && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground mr-1">Active filters:</span>
              {category && (
                <Badge variant="secondary" className="px-3 py-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => setCategory(undefined)}>
                  {category} ×
                </Badge>
              )}
              {upcomingOnly && (
                <Badge variant="secondary" className="px-3 py-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => setUpcomingOnly(false)}>
                  Upcoming Events ×
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 flex-1">
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : eventsData?.events && eventsData.events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {eventsData.events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border-2 border-dashed rounded-xl bg-muted/10">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-medium text-foreground mb-2">No events found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              We couldn't find any events matching your current filters. Try adjusting your search or clearing filters.
            </p>
            {(category || upcomingOnly || search) && (
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => {
                  setCategory(undefined);
                  setUpcomingOnly(false);
                  setSearch("");
                  setDebouncedSearch("");
                }}
              >
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
