import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useRegister, useLogin } from "@workspace/api-client-react";

type Mode = "view" | "login" | "register";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, signIn, signOut } = useAuth();
  const [mode, setMode] = useState<Mode>("view");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState("");

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const topPadding = Platform.OS === "web" ? 67 : insets.top + 10;

  async function handleLogin() {
    if (!email || !password) { setError("E-posta ve sifre zorunludur"); return; }
    setError("");
    try {
      const result = await loginMutation.mutateAsync({ data: { email, password } });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await signIn(result.user as never, result.token);
      setMode("view");
      setEmail(""); setPassword("");
    } catch {
      setError("Gecersiz e-posta veya sifre");
    }
  }

  async function handleRegister() {
    if (!email || !password || !name) { setError("Ad, e-posta ve sifre zorunludur"); return; }
    setError("");
    try {
      const result = await registerMutation.mutateAsync({ data: { name, email, password, studentId: studentId || undefined, department: department || undefined } });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await signIn(result.user as never, result.token);
      setMode("view");
      setEmail(""); setPassword(""); setName(""); setStudentId(""); setDepartment("");
    } catch {
      setError("Kayit olunurken hata olustu");
    }
  }

  async function handleSignOut() {
    Alert.alert("Cikis", "Cikmak istediginizden emin misiniz?", [
      { text: "Iptal", style: "cancel" },
      { text: "Cikis Yap", style: "destructive", onPress: async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await signOut();
      }},
    ]);
  }

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPadding, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>Profil</Text>
        </View>
        <ScrollView contentContainerStyle={[styles.authContainer, { paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 80 }]}>
          {mode === "view" ? (
            <View style={styles.authGate}>
              <View style={[styles.authIcon, { backgroundColor: colors.primary + "18" }]}>
                <Feather name="user" size={40} color={colors.primary} />
              </View>
              <Text style={[styles.authTitle, { color: colors.foreground }]}>Hesabina Giris Yap</Text>
              <Text style={[styles.authDesc, { color: colors.mutedForeground }]}>
                Etkinliklere katilmak, kuluplerinizi takip etmek icin giris yapin.
              </Text>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.primary }]}
                onPress={() => setMode("login")}
              >
                <Text style={[styles.btnText, { color: "#fff" }]}>Giris Yap</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border }]}
                onPress={() => setMode("register")}
              >
                <Text style={[styles.btnText, { color: colors.foreground }]}>Kayit Ol</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.authForm}>
              <View style={styles.formHeader}>
                <TouchableOpacity onPress={() => { setMode("view"); setError(""); }}>
                  <Feather name="arrow-left" size={22} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.formTitle, { color: colors.foreground }]}>
                  {mode === "login" ? "Giris Yap" : "Kayit Ol"}
                </Text>
              </View>

              {mode === "register" && (
                <View style={styles.field}>
                  <Text style={[styles.label, { color: colors.foreground }]}>Ad Soyad</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]}
                    placeholder="Adinizi girin"
                    placeholderTextColor={colors.mutedForeground}
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              )}
              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.foreground }]}>E-posta</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="E-posta adresiniz"
                  placeholderTextColor={colors.mutedForeground}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.foreground }]}>Sifre</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="Sifreniz"
                  placeholderTextColor={colors.mutedForeground}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
              {mode === "register" && (
                <>
                  <View style={styles.field}>
                    <Text style={[styles.label, { color: colors.foreground }]}>Ogrenci No</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]}
                      placeholder="Ogrenci numaraniz (opsiyonel)"
                      placeholderTextColor={colors.mutedForeground}
                      value={studentId}
                      onChangeText={setStudentId}
                    />
                  </View>
                  <View style={styles.field}>
                    <Text style={[styles.label, { color: colors.foreground }]}>Bolum</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]}
                      placeholder="Bolumunuz (opsiyonel)"
                      placeholderTextColor={colors.mutedForeground}
                      value={department}
                      onChangeText={setDepartment}
                    />
                  </View>
                </>
              )}

              {error.length > 0 && (
                <View style={[styles.errorBox, { backgroundColor: colors.destructive + "18" }]}>
                  <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.primary }]}
                onPress={mode === "login" ? handleLogin : handleRegister}
                disabled={loginMutation.isPending || registerMutation.isPending}
              >
                {(loginMutation.isPending || registerMutation.isPending) ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[styles.btnText, { color: "#fff" }]}>
                    {mode === "login" ? "Giris Yap" : "Kayit Ol"}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
                <Text style={[styles.switchText, { color: colors.primary }]}>
                  {mode === "login" ? "Hesabin yok mu? Kayit ol" : "Zaten hesabin var mi? Giris yap"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  const roleLabels: Record<string, string> = {
    student: "Ogrenci",
    club_official: "Kulup Yetkilisi",
    admin: "Yonetici",
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Profil</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 80 }}>
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.profileAvatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.profileAvatarText}>
              {user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.profileName, { color: colors.foreground }]}>{user.name}</Text>
          <Text style={[styles.profileEmail, { color: colors.mutedForeground }]}>{user.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: colors.primary }]}>
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>{roleLabels[user.role] ?? user.role}</Text>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {user.studentId && (
            <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <Feather name="credit-card" size={16} color={colors.mutedForeground} />
              <View>
                <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Ogrenci No</Text>
                <Text style={[styles.infoValue, { color: colors.foreground }]}>{user.studentId}</Text>
              </View>
            </View>
          )}
          {user.department && (
            <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <Feather name="book" size={16} color={colors.mutedForeground} />
              <View>
                <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Bolum</Text>
                <Text style={[styles.infoValue, { color: colors.foreground }]}>{user.department}</Text>
              </View>
            </View>
          )}
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Feather name="shield" size={16} color={colors.mutedForeground} />
            <View>
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Rol</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>{roleLabels[user.role] ?? user.role}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.signOutBtn, { backgroundColor: colors.destructive + "12", borderColor: colors.destructive + "30" }]}
          onPress={handleSignOut}
        >
          <Feather name="log-out" size={18} color={colors.destructive} />
          <Text style={[styles.signOutText, { color: colors.destructive }]}>Cikis Yap</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { borderBottomWidth: 1, paddingHorizontal: 16, paddingBottom: 14 },
  title: { fontSize: 24, fontWeight: "800" },
  authContainer: { padding: 20 },
  authGate: { alignItems: "center", gap: 16, paddingTop: 40 },
  authIcon: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  authTitle: { fontSize: 22, fontWeight: "800" },
  authDesc: { fontSize: 14, textAlign: "center", lineHeight: 22, maxWidth: 280 },
  btn: { width: "100%", padding: 16, borderRadius: 14, alignItems: "center" },
  btnText: { fontSize: 16, fontWeight: "700" },
  authForm: { gap: 14 },
  formHeader: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 8 },
  formTitle: { fontSize: 22, fontWeight: "800" },
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: "600" },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15 },
  errorBox: { padding: 12, borderRadius: 10 },
  errorText: { fontSize: 13, fontWeight: "600" },
  switchText: { textAlign: "center", fontSize: 14, fontWeight: "600", marginTop: 8 },
  profileCard: { borderRadius: 16, borderWidth: 1, padding: 24, alignItems: "center", gap: 6, marginBottom: 14 },
  profileAvatar: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  profileAvatarText: { color: "#fff", fontSize: 24, fontWeight: "800" },
  profileName: { fontSize: 20, fontWeight: "800" },
  profileEmail: { fontSize: 14 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginTop: 4 },
  infoCard: { borderRadius: 14, borderWidth: 1, marginBottom: 16, overflow: "hidden" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderBottomWidth: 1 },
  infoLabel: { fontSize: 12, marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: "600" },
  signOutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, padding: 16, borderRadius: 14, borderWidth: 1 },
  signOutText: { fontSize: 16, fontWeight: "700" },
});
