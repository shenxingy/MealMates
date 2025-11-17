import type { FC } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface ProfileEditModalProps {
  visible: boolean;
  nameValue: string;
  onNameChange: (value: string) => void;
  nameError: string | null;
  emojiValue: string;
  onEmojiChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
  modalError: string | null;
  isSaving: boolean;
  disableSave: boolean;
  defaultAvatarEmoji: string;
}

const ProfileEditModal: FC<ProfileEditModalProps> = ({
  visible,
  nameValue,
  onNameChange,
  nameError,
  emojiValue,
  onEmojiChange,
  onClose,
  onSave,
  modalError,
  isSaving,
  disableSave,
  defaultAvatarEmoji,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Edit Profile</Text>
          <TextInput
            style={styles.textInput}
            value={nameValue}
            placeholder="Display name"
            onChangeText={onNameChange}
          />
          {nameError ? (
            <Text style={styles.nameErrorText}>{nameError}</Text>
          ) : null}
          <TextInput
            style={styles.textInput}
            value={emojiValue}
            placeholder="Favorite emoji (e.g., 🍣)"
            onChangeText={onEmojiChange}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={4}
          />
          <View style={styles.emojiPreviewRow}>
            <Text style={styles.previewLabel}>Preview</Text>
            <View style={styles.previewCircle}>
              <Text style={styles.previewEmoji}>
                {emojiValue.trim() || defaultAvatarEmoji}
              </Text>
            </View>
          </View>
          <Text style={styles.emojiHint}>
            Enter a single emoji to use as your avatar. Leave blank to use your
            initials.
          </Text>
          {modalError ? (
            <Text style={styles.modalError}>{modalError}</Text>
          ) : null}
          <View style={styles.modalActions}>
            <Pressable
              style={[styles.button, styles.secondaryButton]}
              onPress={onClose}
              disabled={isSaving}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
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
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
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
  nameErrorText: {
    marginTop: -4,
    marginBottom: -4,
    color: "#B91C1C",
    fontSize: 14,
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
  emojiHint: {
    fontSize: 13,
    color: "#6B7280",
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
  secondaryButtonText: {
    color: "#1F2937",
    fontWeight: "600",
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
