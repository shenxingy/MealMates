import type { ElementType } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";

interface ProfileEditModalProps {
  visible: boolean;
  nameValue: string;
  onNameChange: (value: string) => void;
  nameError: string | null;
  emojiValue: string;
  onEmojiChange: (value: string) => void;
  emojiError: string | null;
  availableColors: string[];
  selectedColor: string;
  onColorChange: (color: string) => void;
  colorInputValue: string;
  onCustomColorInputChange: (value: string) => void;
  colorError: string | null;
  onClose: () => void;
  onSave: () => void;
  modalError: string | null;
  isSaving: boolean;
  disableSave: boolean;
  defaultAvatarLabel: string;
}

const ProfileEditModal: ElementType<ProfileEditModalProps> = ({
  visible,
  nameValue,
  onNameChange,
  nameError,
  emojiValue,
  onEmojiChange,
  emojiError,
  availableColors,
  selectedColor,
  onColorChange,
  colorInputValue,
  onCustomColorInputChange,
  colorError,
  onClose,
  onSave,
  modalError,
  isSaving,
  disableSave,
  defaultAvatarLabel,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const trimmedEmojiValue = emojiValue.trim();
  const normalizedLabel = defaultAvatarLabel.trim();
  const fallbackAvatar =
    normalizedLabel.length > 0 ? normalizedLabel.charAt(0).toUpperCase() : "?";
  const previewAvatar =
    trimmedEmojiValue.length > 0 ? trimmedEmojiValue : fallbackAvatar;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, isDark && styles.modalCardDark]}>
          <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>Edit Profile</Text>
          <Text style={[styles.sectionHeading, isDark && styles.sectionHeadingDark]}>Display Name</Text>
          <Text style={[styles.sectionSubtitle, isDark && styles.sectionSubtitleDark]}>
            This name appears across MealMates.
          </Text>
          <TextInput
            style={[styles.textInput, isDark && styles.textInputDark]}
            value={nameValue}
            placeholder="Display name"
            placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
            onChangeText={onNameChange}
          />
          {nameError ? (
            <Text style={styles.inputErrorText}>{nameError}</Text>
          ) : null}
          <Text style={[styles.sectionHeading, isDark && styles.sectionHeadingDark]}>Avatar Icon</Text>
          <Text style={[styles.sectionSubtitle, isDark && styles.sectionSubtitleDark]}>
            Enter a single emoji or letter to use inside the avatar.
          </Text>
          <TextInput
            style={[styles.textInput, isDark && styles.textInputDark]}
            value={emojiValue}
            placeholder="Favorite emoji (e.g., 🍣)"
            placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
            onChangeText={onEmojiChange}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={4}
          />
          {emojiError ? (
            <Text style={styles.inputErrorText}>{emojiError}</Text>
          ) : null}
          <View style={styles.emojiPreviewRow}>
            <Text style={[styles.previewLabel, isDark && styles.previewLabelDark]}>Preview</Text>
            <View
              style={[styles.previewCircle, { backgroundColor: selectedColor }]}
            >
              <Text style={styles.previewEmoji}>{previewAvatar}</Text>
            </View>
          </View>
          <Text style={[styles.sectionHeading, isDark && styles.sectionHeadingDark]}>Avatar Background</Text>
          <Text style={[styles.sectionSubtitle, isDark && styles.sectionSubtitleDark]}>
            Pick a color from the palette or enter your own hex code.
          </Text>
          <TextInput
            style={[styles.colorTextInput, isDark && styles.colorTextInputDark]}
            value={colorInputValue}
            placeholder="#FF5733"
            placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
            autoCapitalize="characters"
            onChangeText={onCustomColorInputChange}
          />
          {colorError ? (
            <Text style={styles.inputErrorText}>{colorError}</Text>
          ) : null}
          <View style={styles.colorGrid}>
            {availableColors.map((color) => {
              const isSelected = selectedColor === color;
              return (
                <Pressable
                  key={color}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: color },
                    isSelected && [styles.colorSwatchSelected, isDark && styles.colorSwatchSelectedDark],
                  ]}
                  onPress={() => onColorChange(color)}
                >
                  {isSelected ? (
                    <Text style={styles.colorSwatchCheck}>✓</Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
          {modalError ? (
            <Text style={styles.modalError}>{modalError}</Text>
          ) : null}
          <View style={styles.modalActions}>
            <Pressable
              style={[styles.button, styles.secondaryButton, isDark && styles.secondaryButtonDark]}
              onPress={onClose}
              disabled={isSaving}
            >
              <Text style={[styles.secondaryButtonText, isDark && styles.secondaryButtonTextDark]}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[
                styles.button,
                styles.primaryButton,
                disableSave && styles.disabledButton,
              ]}
              onPress={onSave}
              disabled={disableSave}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Save</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    gap: 16,
  },
  modalCardDark: {
    backgroundColor: "rgba(45, 45, 45, 0.95)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  modalTitleDark: {
    color: "rgba(255, 255, 255, 0.95)",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#CBD5F5",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  textInputDark: {
    borderColor: "rgba(75, 75, 75, 0.8)",
    backgroundColor: "rgba(30, 30, 30, 0.5)",
    color: "rgba(255, 255, 255, 0.95)",
  },
  sectionHeading: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  sectionHeadingDark: {
    color: "rgba(255, 255, 255, 0.95)",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 6,
  },
  sectionSubtitleDark: {
    color: "#9CA3AF",
  },
  inputErrorText: {
    marginTop: -2,
    marginBottom: 4,
    color: "#B91C1C",
    fontSize: 13,
  },
  emojiPreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  previewLabelDark: {
    color: "rgba(255, 255, 255, 0.75)",
  },
  previewCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  previewEmoji: {
    fontSize: 30,
  },
  colorTextInput: {
    borderWidth: 1,
    borderColor: "#CBD5F5",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#111827",
    textTransform: "uppercase",
  },
  colorTextInputDark: {
    borderColor: "rgba(75, 75, 75, 0.8)",
    backgroundColor: "rgba(30, 30, 30, 0.5)",
    color: "rgba(255, 255, 255, 0.95)",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorSwatchSelected: {
    borderColor: "#111827",
  },
  colorSwatchSelectedDark: {
    borderColor: "rgba(255, 255, 255, 0.85)",
  },
  colorSwatchCheck: {
    color: "#111827",
    fontWeight: "700",
  },
  modalError: {
    color: "#B91C1C",
    fontSize: 14,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 110,
  },
  secondaryButton: {
    backgroundColor: "#E2E8F0",
  },
  secondaryButtonDark: {
    backgroundColor: "rgba(75, 75, 75, 0.6)",
  },
  secondaryButtonText: {
    color: "#1F2937",
    fontWeight: "600",
  },
  secondaryButtonTextDark: {
    color: "rgba(255, 255, 255, 0.95)",
  },
  primaryButton: {
    backgroundColor: "#2563EB",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default ProfileEditModal;
