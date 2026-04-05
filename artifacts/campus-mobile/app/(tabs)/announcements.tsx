import React from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useListAnnouncements } from "@workspace/api-client-react";

export default function AnnouncementsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, isLoading, refetch } = useListAnnouncements({ page: 1, limit: 30 });
  const topPadding = Platform.OS === "web" ? 67 : insets.top + 10;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Duyurular</Text>
      </View>
      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={data?.announcements ?? []}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: item.isGlobal ? colors.primary + "18" : colors.secondary }]}>
                  <Feather name={item.isGlobal ? "globe" : "bell"} size={18} color={item.isGlobal ? colors.primary : colors.mutedForeground} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={2}>{item.title}</Text>
                    {item.isGlobal && (
                      <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                        <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>Genel</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                    {item.clubName ?? item.authorName} • {new Date(item.createdAt).toLocaleDateString("tr-TR")}
                  </Text>
                </View>
              </View>
              <Text style={[styles.content, { color: colors.mutedForeground }]}>{item.content}</Text>
            </View>
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 80 }}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isLoading}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="bell-off" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Duyuru yok</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Henuz duyuru paylasılmamis</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { borderBottomWidth: 1, paddingHorizontal: 16, paddingBottom: 14 },
  title: { fontSize: 24, fontWeight: "800" },
  card: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 10, gap: 10 },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, flex: 1 },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: "700", lineHeight: 21 },
  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10, marginTop: 2 },
  meta: { fontSize: 12, marginTop: 3 },
  content: { fontSize: 14, lineHeight: 22 },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: "700" },
  emptyText: { fontSize: 14 },
});
