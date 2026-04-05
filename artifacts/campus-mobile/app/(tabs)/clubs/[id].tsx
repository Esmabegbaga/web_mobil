import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useGetClub, useListEvents } from "@workspace/api-client-react";
import { EventCard } from "@/components/EventCard";

export default function ClubDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const clubId = parseInt(id ?? "0", 10);

  const { data: club, isLoading: clubLoading } = useGetClub(clubId, { query: { enabled: !!clubId } });
  const { data: events } = useListEvents({ clubId, status: "approved", page: 1, limit: 10 });

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  if (clubLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!club) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.mutedForeground }}>Kulup bulunamadi</Text>
      </View>
    );
  }

  const initials = club.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.navHeader, { paddingTop: topPadding + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.muted }]}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.foreground }]} numberOfLines={1}>{club.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroSection, { backgroundColor: colors.primary }]}>
          <View style={[styles.avatar, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.clubName}>{club.name}</Text>
          {club.category && <Text style={styles.clubCategory}>{club.category}</Text>}
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>{club.memberCount}</Text>
              <Text style={styles.heroStatLabel}>Uye</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>{club.eventCount}</Text>
              <Text style={styles.heroStatLabel}>Etkinlik</Text>
            </View>
          </View>
        </View>

        {club.description && (
          <View style={[styles.descSection, { borderBottomColor: colors.border }]}>
            <Text style={[styles.descTitle, { color: colors.foreground }]}>Hakkimizda</Text>
            <Text style={[styles.descText, { color: colors.mutedForeground }]}>{club.description}</Text>
          </View>
        )}

        <View style={styles.eventsSection}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Etkinlikler</Text>
          {events && events.events.length > 0 ? (
            events.events.map((event) => <EventCard key={event.id} event={event} />)
          ) : (
            <View style={[styles.empty, { borderColor: colors.border }]}>
              <Feather name="calendar" size={28} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Etkinlik bulunamadi</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  navHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  navTitle: { flex: 1, textAlign: "center", fontSize: 16, fontWeight: "700" },
  heroSection: { padding: 28, alignItems: "center", gap: 8 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  avatarText: { fontSize: 28, fontWeight: "800", color: "#fff" },
  clubName: { fontSize: 22, fontWeight: "800", color: "#fff", textAlign: "center" },
  clubCategory: { fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: "600" },
  heroStats: { flexDirection: "row", alignItems: "center", gap: 20, marginTop: 8 },
  heroStat: { alignItems: "center", gap: 2 },
  heroStatNum: { fontSize: 24, fontWeight: "800", color: "#fff" },
  heroStatLabel: { fontSize: 12, color: "rgba(255,255,255,0.8)" },
  heroStatDivider: { width: 1, height: 30, backgroundColor: "rgba(255,255,255,0.3)" },
  descSection: { padding: 20, borderBottomWidth: 1, gap: 8 },
  descTitle: { fontSize: 17, fontWeight: "700" },
  descText: { fontSize: 14, lineHeight: 22 },
  eventsSection: { padding: 16, gap: 4 },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 8 },
  empty: { borderWidth: 1, borderStyle: "dashed", borderRadius: 12, padding: 24, alignItems: "center", gap: 8 },
  emptyText: { fontSize: 14 },
});
