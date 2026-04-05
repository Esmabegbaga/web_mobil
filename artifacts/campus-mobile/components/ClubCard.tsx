import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";

interface Club {
  id: number;
  name: string;
  description?: string | null;
  category?: string | null;
  logoUrl?: string | null;
  memberCount: number;
  eventCount: number;
}

export function ClubCard({ club }: { club: Club }) {
  const colors = useColors();
  const router = useRouter();

  const initials = club.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/clubs/${club.id}` as never)}
      activeOpacity={0.85}
    >
      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
        <Text style={[styles.initials, { color: colors.primaryForeground }]}>{initials}</Text>
      </View>
      <View style={styles.content}>
        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>{club.name}</Text>
        {club.category && (
          <Text style={[styles.category, { color: colors.primary }]}>{club.category}</Text>
        )}
        {club.description && (
          <Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={2}>{club.description}</Text>
        )}
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Feather name="users" size={12} color={colors.mutedForeground} />
            <Text style={[styles.statText, { color: colors.mutedForeground }]}>{club.memberCount} uye</Text>
          </View>
          <View style={styles.stat}>
            <Feather name="calendar" size={12} color={colors.mutedForeground} />
            <Text style={[styles.statText, { color: colors.mutedForeground }]}>{club.eventCount} etkinlik</Text>
          </View>
        </View>
      </View>
      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  initials: {
    fontSize: 16,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
  },
  category: {
    fontSize: 12,
    fontWeight: "600",
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  stats: {
    flexDirection: "row",
    gap: 12,
    marginTop: 2,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
  },
});
