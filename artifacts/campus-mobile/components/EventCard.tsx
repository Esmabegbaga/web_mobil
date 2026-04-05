import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";

interface Event {
  id: number;
  title: string;
  description?: string | null;
  category?: string | null;
  location?: string | null;
  imageUrl?: string | null;
  startDate: string;
  status: string;
  clubName?: string | null;
  attendeeCount: number;
  interestedCount: number;
  userReaction?: string | null;
}

export function EventCard({ event }: { event: Event }) {
  const colors = useColors();
  const router = useRouter();
  const date = new Date(event.startDate);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/events/${event.id}` as never)}
      activeOpacity={0.85}
    >
      {event.imageUrl ? (
        <Image source={{ uri: event.imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.imagePlaceholder, { backgroundColor: colors.primary + "22" }]}>
          <Feather name="calendar" size={32} color={colors.primary} />
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.meta}>
          {event.category && (
            <View style={[styles.badge, { backgroundColor: colors.primary + "18" }]}>
              <Text style={[styles.badgeText, { color: colors.primary }]}>{event.category}</Text>
            </View>
          )}
          {event.status === "pending" && (
            <View style={[styles.badge, { backgroundColor: colors.pending + "22" }]}>
              <Text style={[styles.badgeText, { color: colors.pending }]}>Onay Bekliyor</Text>
            </View>
          )}
        </View>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>{event.title}</Text>
        {event.clubName && (
          <Text style={[styles.club, { color: colors.primary }]} numberOfLines={1}>{event.clubName}</Text>
        )}
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Feather name="calendar" size={12} color={colors.mutedForeground} />
            <Text style={[styles.detailText, { color: colors.mutedForeground }]}>
              {date.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}
            </Text>
          </View>
          {event.location && (
            <View style={styles.detailRow}>
              <Feather name="map-pin" size={12} color={colors.mutedForeground} />
              <Text style={[styles.detailText, { color: colors.mutedForeground }]} numberOfLines={1}>{event.location}</Text>
            </View>
          )}
        </View>
        <View style={styles.reactions}>
          <View style={styles.reactionItem}>
            <Feather name="check-circle" size={13} color={colors.mutedForeground} />
            <Text style={[styles.reactionText, { color: colors.mutedForeground }]}>{event.attendeeCount} katılıyor</Text>
          </View>
          <View style={styles.reactionItem}>
            <Feather name="star" size={13} color={colors.mutedForeground} />
            <Text style={[styles.reactionText, { color: colors.mutedForeground }]}>{event.interestedCount} ilgileniyor</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 12,
  },
  image: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  imagePlaceholder: {
    width: "100%",
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 14,
    gap: 6,
  },
  meta: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
  },
  club: {
    fontSize: 13,
    fontWeight: "600",
  },
  details: {
    gap: 3,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  detailText: {
    fontSize: 12,
  },
  reactions: {
    flexDirection: "row",
    gap: 14,
    marginTop: 2,
  },
  reactionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reactionText: {
    fontSize: 12,
  },
});
