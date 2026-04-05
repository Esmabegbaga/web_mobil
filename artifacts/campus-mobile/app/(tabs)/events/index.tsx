import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useListEvents, useListEventCategories } from "@workspace/api-client-react";
import { EventCard } from "@/components/EventCard";

export default function EventsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  const { data: categories } = useListEventCategories();
  const { data, isLoading, refetch } = useListEvents({
    search: search || undefined,
    category: selectedCategory,
    limit: 20,
    page: 1,
  });

  const topPadding = Platform.OS === "web" ? 67 : insets.top + 10;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Etkinlikler</Text>
        <View style={[styles.searchBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Etkinlik ara..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
        {categories && categories.length > 0 && (
          <FlatList
            horizontal
            data={[{ category: "Tümü", count: 0 }, ...categories]}
            keyExtractor={(item) => item.category}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 12 }}
            renderItem={({ item }) => {
              const isAll = item.category === "Tümü";
              const isSelected = isAll ? !selectedCategory : selectedCategory === item.category;
              return (
                <TouchableOpacity
                  style={[
                    styles.chip,
                    isSelected
                      ? { backgroundColor: colors.primary }
                      : { backgroundColor: colors.secondary, borderColor: colors.border },
                  ]}
                  onPress={() => setSelectedCategory(isAll ? undefined : item.category)}
                >
                  <Text style={[styles.chipText, { color: isSelected ? "#fff" : colors.foreground }]}>
                    {item.category}{!isAll && ` (${item.count})`}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={data?.events ?? []}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <EventCard event={item} />}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 80,
          }}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isLoading}
          ListEmptyComponent={
            <View style={[styles.empty]}>
              <Feather name="calendar" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Etkinlik bulunamadi</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                {search ? "Arama kriterlerinizi degistirin" : "Henuz etkinlik eklenmemis"}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { borderBottomWidth: 1, paddingHorizontal: 16, paddingBottom: 0 },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 12 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 14 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: "600" },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: "700" },
  emptyText: { fontSize: 14 },
});
