import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import {
  useListUpcomingEvents,
  useListFeaturedClubs,
  useGetDashboardSummary,
  useListAnnouncements,
} from "@workspace/api-client-react";
import { EventCard } from "@/components/EventCard";

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const { data: upcoming, isLoading: eventsLoading } = useListUpcomingEvents();
  const { data: featuredClubs } = useListFeaturedClubs();
  const { data: summary } = useGetDashboardSummary();
  const { data: announcements } = useListAnnouncements({ page: 1, limit: 3 });

  const topPadding = Platform.OS === "web" ? 67 : insets.top + 10;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 80 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topPadding, backgroundColor: colors.primary }]}>
        <View>
          <Text style={[styles.greeting, { color: "rgba(255,255,255,0.8)" }]}>
            {user ? `Merhaba, ${user.name.split(" ")[0]}` : "Campus Online'a"}
          </Text>
          <Text style={[styles.headerTitle, { color: "#FFFFFF" }]}>Kampus Hayatina Hosgeldin</Text>
        </View>
        <TouchableOpacity
          style={[styles.headerBtn, { backgroundColor: "rgba(255,255,255,0.2)" }]}
          onPress={() => router.push("/profile" as never)}
        >
          <Feather name="user" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {summary && (
        <View style={[styles.statsRow, { paddingHorizontal: 16 }]}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statNum, { color: colors.primary }]}>{summary.totalEvents}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Etkinlik</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statNum, { color: colors.primary }]}>{summary.upcomingEvents}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Yaklasan</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statNum, { color: colors.primary }]}>{summary.totalClubs}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Kulup</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statNum, { color: colors.primary }]}>{summary.totalStudents}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Ogrenci</Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Yaklasan Etkinlikler</Text>
          <TouchableOpacity onPress={() => router.push("/events" as never)}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>Tumunu Gor</Text>
          </TouchableOpacity>
        </View>
        {eventsLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        ) : upcoming && upcoming.length > 0 ? (
          upcoming.slice(0, 3).map((event) => (
            <EventCard key={event.id} event={event} />
          ))
        ) : (
          <View style={[styles.empty, { borderColor: colors.border }]}>
            <Feather name="calendar" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Yaklasan etkinlik yok</Text>
          </View>
        )}
      </View>

      {announcements && announcements.announcements.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Son Duyurular</Text>
            <TouchableOpacity onPress={() => router.push("/announcements" as never)}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>Tumunu Gor</Text>
            </TouchableOpacity>
          </View>
          {announcements.announcements.map((ann) => (
            <View key={ann.id} style={[styles.announcementCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.annHeader}>
                <Text style={[styles.annTitle, { color: colors.foreground }]} numberOfLines={1}>{ann.title}</Text>
                {ann.isGlobal && (
                  <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.badgeText, { color: "#fff" }]}>Genel</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.annContent, { color: colors.mutedForeground }]} numberOfLines={2}>{ann.content}</Text>
              <Text style={[styles.annMeta, { color: colors.mutedForeground }]}>
                {ann.clubName ?? ann.authorName} • {new Date(ann.createdAt).toLocaleDateString("tr-TR")}
              </Text>
            </View>
          ))}
        </View>
      )}

      {featuredClubs && featuredClubs.length > 0 && (
        <View style={[styles.section, { marginBottom: 0 }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>One Cikan Kulupler</Text>
            <TouchableOpacity onPress={() => router.push("/clubs" as never)}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>Tumunu Gor</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 16 }}>
            {featuredClubs.map((club) => (
              <TouchableOpacity
                key={club.id}
                style={[styles.clubChip, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push(`/clubs/${club.id}` as never)}
                activeOpacity={0.8}
              >
                <View style={[styles.clubAvatar, { backgroundColor: colors.primary }]}>
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>
                    {club.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.clubChipName, { color: colors.foreground }]} numberOfLines={1}>{club.name}</Text>
                <Text style={[styles.clubChipStat, { color: colors.mutedForeground }]}>{club.eventCount} etkinlik</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 20,
    paddingBottom: 24,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  greeting: { fontSize: 14, marginBottom: 2 },
  headerTitle: { fontSize: 20, fontWeight: "800", lineHeight: 26 },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  statCard: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: "center", gap: 2 },
  statNum: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 10, fontWeight: "500" },
  section: { padding: 16, paddingBottom: 4 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  seeAll: { fontSize: 13, fontWeight: "600" },
  empty: { borderWidth: 1, borderStyle: "dashed", borderRadius: 12, padding: 28, alignItems: "center", gap: 8 },
  emptyText: { fontSize: 14 },
  announcementCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10, gap: 5 },
  annHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  annTitle: { flex: 1, fontSize: 14, fontWeight: "700" },
  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  badgeText: { fontSize: 10, fontWeight: "600" },
  annContent: { fontSize: 13, lineHeight: 19 },
  annMeta: { fontSize: 11 },
  clubChip: { borderRadius: 12, borderWidth: 1, padding: 12, alignItems: "center", gap: 6, width: 110 },
  clubAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  clubChipName: { fontSize: 12, fontWeight: "700", textAlign: "center" },
  clubChipStat: { fontSize: 11 },
});
