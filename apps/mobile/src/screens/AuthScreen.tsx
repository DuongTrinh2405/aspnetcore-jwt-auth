import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { supabase } from "../services/supabase";

type AuthScreenProps = {
  onSignedIn: () => void;
};

export function AuthScreen({ onSignedIn }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setMessage("");

    if (!email.trim() || password.length < 6) {
      setMessage("Nhập email và mật khẩu ít nhất 6 ký tự.");
      return;
    }

    if (mode === "register" && fullName.trim().length < 2) {
      setMessage("Nhập họ tên khách hàng.");
      return;
    }

    setLoading(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });
      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      onSignedIn();
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
          role: "customer"
        }
      }
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Tài khoản đã tạo. Nếu Supabase yêu cầu xác minh email, hãy xác minh trước khi đăng nhập.");
    setMode("login");
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>C</Text>
          </View>
          <Text style={styles.brand}>CNL Service</Text>
          <Text style={styles.title}>{mode === "login" ? "Đăng nhập" : "Đăng ký khách hàng"}</Text>
          <Text style={styles.subtitle}>Kết nối khách hàng với kỹ thuật viên camera, Wi-Fi, internet và điện nhẹ.</Text>

          {mode === "register" ? (
            <View>
              <TextInput style={styles.input} placeholder="Họ tên" value={fullName} onChangeText={setFullName} />
              <TextInput style={styles.input} placeholder="Số điện thoại" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </View>
          ) : null}

          <TextInput
            style={styles.input}
            autoCapitalize="none"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            autoComplete="password"
            placeholder="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {message ? <Text style={styles.message}>{message}</Text> : null}

          <Pressable style={[styles.button, loading && styles.buttonDisabled]} disabled={loading} onPress={submit}>
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>{mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}</Text>
            )}
          </Pressable>

          <Pressable disabled={loading} onPress={() => setMode(mode === "login" ? "register" : "login")}>
            <Text style={styles.link}>{mode === "login" ? "Tạo tài khoản khách hàng" : "Đã có tài khoản? Đăng nhập"}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F6F8FB"
  },
  keyboardView: {
    flex: 1
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24
  },
  brandMark: {
    width: 54,
    height: 54,
    borderRadius: 20,
    backgroundColor: "#0F4C81",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F4C81",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 8
  },
  brandMarkText: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 22
  },
  brand: {
    marginTop: 18,
    color: "#0F4C81",
    fontWeight: "900",
    letterSpacing: 0
  },
  title: {
    marginTop: 10,
    fontSize: 31,
    lineHeight: 38,
    fontWeight: "900",
    color: "#0F172A"
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 24,
    color: "#64748B",
    lineHeight: 22,
    fontWeight: "600"
  },
  input: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15
  },
  message: {
    marginBottom: 12,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    color: "#B91C1C",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontWeight: "800"
  },
  button: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: "#0F4C81",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  buttonDisabled: {
    opacity: 0.72
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 16
  },
  link: {
    marginTop: 18,
    textAlign: "center",
    color: "#0F4C81",
    fontWeight: "800"
  }
});
