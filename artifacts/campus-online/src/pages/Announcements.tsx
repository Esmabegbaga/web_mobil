import { AppLayout } from "@/components/layout/AppLayout";
import { AnnouncementCard } from "@/components/announcements/AnnouncementCard";
import { useListAnnouncements } from "@workspace/api-client-react";
import { Loader2, Megaphone } from "lucide-react";

export default function Announcements() {
  const { data: announcementsData, isLoading } = useListAnnouncements(
    { limit: 50 },
    { query: { queryKey: ['announcements'] } }
  );

  return (
    <AppLayout>
      <div className="bg-primary/5 py-12 border-b">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-primary text-primary-foreground p-3 rounded-xl shadow-sm">
              <Megaphone className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-serif font-bold tracking-tight">Campus Feed</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Important updates from the university administration and announcements from your favorite clubs.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl flex-1">
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : announcementsData?.announcements && announcementsData.announcements.length > 0 ? (
          <div className="space-y-6">
            {announcementsData.announcements.map((announcement) => (
              <AnnouncementCard key={announcement.id} announcement={announcement} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border-2 border-dashed rounded-xl bg-muted/10">
            <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-medium text-foreground mb-2">It's quiet here</h3>
            <p className="text-muted-foreground">
              No announcements have been posted recently.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
