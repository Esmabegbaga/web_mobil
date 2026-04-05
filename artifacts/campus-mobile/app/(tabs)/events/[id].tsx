import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useGetEvent, useReactToEvent, useRemoveReaction, getGetEventQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function EventDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const eventId = parseInt(id ?? "0", 10);
  const { data: event, isLoading } = useGetEvent(eventId, { query: { enabled: !!eventId } });
  const reactMutation = useReactToEvent();
  const removeReactionMutation = useRemoveReaction();

  async function handleReact(type: "going" | "interested") {
    if (!user) {
      router.push("/profile" as never);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (event?.userReaction === type) {
      await removeReactionMutation.mutateAsync({ id: eventId });
    } else {
      await reactMutation.mutateAsync({ id: eventId, data: { type } });
    }
    queryClient.invalidateQueries({ queryKey: getGetEventQueryKey(eventId) });
  }

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.mutedForeground }}>Etkinlik bulunamadi</Text>
      </View>
    );
  }

  const date = new Date(event.startDate);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.navHeader, { paddingTop: topPadding + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.muted }]}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.foreground }]} numberOfLines={1}>Etkinlik Detayi</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {event.imageUrl ? (
          <Image source={{ uri: event.imageUrl }} style={styles.heroImage} />
        ) : (
          <View style={[styles.heroPlaceholder, { backgroundColor: colors.primary + "22" }]}>
            <Feather name="calendar" size={48} color={colors.primary} />
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.metaRow}>
            {event.category && (
              <View style={[styles.badge, { backgroundColor: colors.primary + "18" }]}>
                <Text style={[styles.badgeText, { color: colors.primary }]}>{event.category}</Text>
              </View>
            )}
            <View style={[styles.badge, { backgroundColor: event.status === "approved" ? colors.success + "18" : colors.pending + "18" }]}>
              <Text style={[styles.badgeText, { color: event.status === "approved" ? colors.success : colors.pending }]}>
                {event.status === "approved" ? "Onaylandi" : event.status === "pending" ? "Bekliyor" : "Reddedildi"}
              </Text>
            </View>
          </View>

          <Text style={[styles.title, { color: colors.foreground }]}>{event.title}</Text>
          {event.clubName && (
            <Text style={[styles.club, { color: colors.primary }]}>{event.clubName}</Text>
          )}

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: colors.primary + "15" }]}>
                <Feather name="calendar" size={16} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Tarih</Text>
                <Text style={[styles.infoValue, { color: colors.foreground }]}>
                  {date.toLocaleDateString("tr-TR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </Text>
              </View>
            </View>
            {event.location && (
              <View style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: colors.primary + "15" }]}>
                  <Feather name="map-pin" size={16} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Yer</Text>
                  <Text style={[styles.infoValue, { color: colors.foreground }]}>{event.location}</Text>
                </View>
              </View>
            )}
          </View>

          {event.description && (
            <View style={styles.descSection}>
              <Text style={[styles.descTitle, { color: colors.foreground }]}>Hakkinda</Text>
              <Text style={[styles.description, { color: colors.mutedForeground }]}>{event.description}</Text>
            </View>
          )}

          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statNum, { color: colors.primary }]}>{event.attendeeCount}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Katiliyor</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statNum, { color: colors.primary }]}>{event.interestedCount}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Ilgileniyor</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.actionBar, {
        backgroundColor: colors.card,
        borderTopColor: colors.border,
        paddingBottom: Platform.OS === "web" ? 20 : insets.bottom + 8,
      }]}>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            event.userReaction === "going"
              ? { backgroundColor: colors.primary }
              : { backgroundColor: colors.muted, borderColor: colors.border, borderWidth: 1 },
          ]}
          onPress={() => handleReact("going")}
          activeOpacity={0.8}
        >
          <Feather name="check-circle" size={18} color={event.userReaction === "going" ? "#fff" : colors.foreground} />
          <Text style={[styles.actionBtnText, { color: event.userReaction === "going" ? "#fff" : colors.foreground }]}>Katiliyorum</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            event.userReaction === "interested"
              ? { backgroundColor: colors.primary }
              : { backgroundColor: colors.muted, borderColor: colors.border, borderWidth: 1 },
          ]}
          onPress={() => handleReact("interested")}
          activeOpacity={0.8}
        >
          <Feather name="star" size={18} color={event.userReaction === "interested" ? "#fff" : colors.foreground} />
          <Text style={[styles.actionBtnText, { color: event.userReaction === "interested" ? "#fff" : colors.foreground }]}>Ilgileniyorum</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  navHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  navTitle: { flex: 1, textAlign: "center", fontSize: 16, fontWeight: "700" },
  heroImage: { width: "100%", height: 220, resizeMode: "cover" },
  heroPlaceholder: { width: "100%", height: 180, alignItems: "center", justifyContent: "center" },
  content: { padding: 20, gap: 14 },
  metaRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: "600" },
  title: { fontSize: 22, fontWeight: "800", lineHeight: 30 },
  club: { fontSize: 15, fontWeight: "600" },
  infoSection: { gap: 12 },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  infoIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  infoLabel: { fontSize: 12, marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: "600" },
  descSection: { gap: 6 },
  descTitle: { fontSize: 16, fontWeight: "700" },
  description: { fontSize: 14, lineHeight: 22 },
  statsRow: { flexDirection: "row", gap: 12 },
  statBox: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 16, alignItems: "center", gap: 4 },
  statNum: { fontSize: 26, fontWeight: "800" },
  statLabel: { fontSize: 12 },
  actionBar: { padding: 16, flexDirection: "row", gap: 12, borderTopWidth: 1 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 14 },
  actionBtnText: { fontSize: 15, fontWeight: "700" },
});
