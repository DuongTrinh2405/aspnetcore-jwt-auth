import { isCustomerRole, isTechnicianRole, type CurrentUserProfile } from "@cnl/shared";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { AuthScreen } from "./src/screens/AuthScreen";
import { CustomerHomeScreen } from "./src/screens/CustomerHomeScreen";
import { TechnicianHomeScreen } from "./src/screens/TechnicianHomeScreen";
import { getMobileUserProfile, supabase } from "./src/services/supabase";

export default function App() {
  const [profile, setProfile] = useState<CurrentUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile() {
    const nextProfile = await getMobileUserProfile();
    setProfile(nextProfile);
    setLoading(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setProfile(null);
  }

  useEffect(() => {
    loadProfile();

    const { data } = supabase.auth.onAuthStateChange(() => {
      loadProfile();
    });

    return () => data.subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={styles.muted}>Đang tải...</Text>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <>
        <StatusBar style="dark" />
        <AuthScreen onSignedIn={loadProfile} />
      </>
    );
  }

  if (profile.role === "admin") {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={styles.title}>Tài khoản admin</Text>
        <Text style={styles.muted}>Admin chỉ sử dụng web admin.</Text>
        <Pressable style={styles.button} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Đăng xuất</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      {isCustomerRole(profile.role) ? (
        <CustomerHomeScreen profile={profile} onSignOut={handleSignOut} />
      ) : null}
      {isTechnicianRole(profile.role) ? (
        <TechnicianHomeScreen profile={profile} onSignOut={handleSignOut} />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f8fafc"
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0f172a"
  },
  muted: {
    marginTop: 8,
    color: "#64748b"
  },
  button: {
    marginTop: 24,
    borderRadius: 10,
    backgroundColor: "#075985",
    paddingVertical: 14,
    alignItems: "center"
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700"
  }
});
