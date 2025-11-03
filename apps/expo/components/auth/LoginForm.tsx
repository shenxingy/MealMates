import { StyleSheet, TextInput, View } from "react-native";

interface LoginFormProps {
  email: string;
  password: string;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
}

export default function LoginForm({
  email,
  password,
  onEmailChange,
  onPasswordChange,
}: LoginFormProps) {
  return (
    <View style={styles.formCard}>
      <TextInput
        value={email}
        onChangeText={onEmailChange}
        placeholder="Email"
        placeholderTextColor="#94A3B8"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />
      <TextInput
        value={password}
        onChangeText={onPasswordChange}
        placeholder="Password"
        placeholderTextColor="#94A3B8"
        secureTextEntry
        style={[styles.input, styles.lastInput]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  formCard: {
    marginTop: 36,
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 12,
    shadowColor: "#1F2937",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 12,
  },
  input: {
    fontSize: 16,
    paddingVertical: 18,
    color: "#1F2937",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(15, 23, 42, 0.08)",
  },
  lastInput: {
    borderBottomWidth: 0,
  },
});
