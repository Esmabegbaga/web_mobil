import { AppLayout } from "@/components/layout/AppLayout";
import { ClubCard } from "@/components/clubs/ClubCard";
import { useListClubs } from "@workspace/api-client-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Users } from "lucide-react";

export default function Clubs() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useState(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: clubsData, isLoading } = useListClubs(
    { search: debouncedSearch || undefined },
    { query: { queryKey: ['clubs', debouncedSearch] } }
  );

  return (
    <AppLayout>
      <div className="bg-primary/5 py-12 border-b">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-serif font-bold tracking-tight mb-4">Campus Clubs</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Find your community. Explore organizations spanning academics, arts, culture, and recreation.
          </p>
          
          <div className="mt-8 relative max-w-2xl">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input 
              type="search"
              placeholder="Search by club name or category..." 
              className="pl-10 h-12 text-base bg-background shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 flex-1">
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : clubsData?.clubs && clubsData.clubs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {clubsData.clubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border-2 border-dashed rounded-xl bg-muted/10 max-w-2xl mx-auto">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-medium text-foreground mb-2">No clubs found</h3>
            <p className="text-muted-foreground">
              We couldn't find any clubs matching your search "{search}".
            </p>
            {search && (
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => {
                  setSearch("");
                  setDebouncedSearch("");
                }}
              >
                Clear search
              </Button>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
