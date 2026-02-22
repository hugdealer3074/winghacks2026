import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { timeAgo } from "../utils/timeAgo";
import { BackgroundBlobs } from "../components/BackgroundBlobs";
import { COLORS, RADIUS, SPACING, SHADOW } from "../theme";

function formatCategory(cat) {
  const s = (cat || "general").toString().trim();
  if (!s) return "General";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Optional: category -> subtle tint (keeps same “Forum tag” vibe but cohesive)
 * You can expand this later, but defaults still look good.
 */
function categoryChipStyle(category) {
  const c = (category || "general").toString().toLowerCase();
  switch (c) {
    case "health":
      return { backgroundColor: "rgba(167,199,161,0.28)", borderColor: "rgba(167,199,161,0.35)" };
    case "parenting":
      return { backgroundColor: "rgba(222,210,255,0.55)", borderColor: "rgba(160,131,249,0.35)" };
    case "newborn":
      return { backgroundColor: "rgba(255,255,255,0.62)", borderColor: "rgba(34,34,34,0.08)" };
    case "pregnancy":
      return { backgroundColor: "rgba(160,131,249,0.22)", borderColor: "rgba(160,131,249,0.30)" };
    default:
      return { backgroundColor: "rgba(255,255,255,0.60)", borderColor: "rgba(34,34,34,0.08)" };
  }
}

export default function PostDetailScreen({ route, navigation }) {
  const { post } = route.params;

  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState(post.replies || []);

  const formattedCategory = formatCategory(post.category);

  const replyCountLabel = useMemo(() => {
    const n = replies.length;
    return `${n} ${n === 1 ? "Reply" : "Replies"}`;
  }, [replies.length]);

  const handleAddReply = () => {
    if (!replyText.trim()) return;

    const newReply = {
      id: `r${Date.now()}`,
      content: replyText.trim(),
      authorUsername: "HappyPanda42",
      createdAt: new Date().toISOString(),
    };

    setReplies((prev) => [...prev, newReply]);
    setReplyText("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
    >
      <View style={styles.screen}>
        <BackgroundBlobs />

        {/* ✅ Liquid-glass header (replaces old purple banner) */}
        <View style={styles.headerWrap}>
          <BlurView intensity={22} tint="light" style={StyleSheet.absoluteFill} />
          <LinearGradient
            colors={[
              "rgba(160,131,249,0.18)",
              "rgba(222,210,255,0.16)",
              "rgba(167,199,161,0.10)",
              "rgba(255,251,249,0.35)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.headerTopRow}>
            {/* ✅ Back arrow (top-left) */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={18} color={COLORS.text} />
            </TouchableOpacity>

            <View style={{ flex: 1 }} />

            {/* ✅ Category chip (Forum vibe + proper capitalization) */}
            <View style={[styles.categoryChip, categoryChipStyle(post.category)]}>
              <Text style={styles.categoryChipText}>{formattedCategory}</Text>
            </View>
          </View>

          <Text style={styles.headerTitle}>Post</Text>
          <Text style={styles.headerSubtitle}>
            {post.authorUsername} • {timeAgo(post.createdAt)}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Post card */}
          <View style={styles.card}>
            <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={[
                "rgba(255,255,255,0.72)",
                "rgba(222,210,255,0.18)",
                "rgba(167,199,161,0.10)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postBody}>{post.content}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaPill}>
                <Text style={styles.metaText}>⬆️ {post.upvotes}</Text>
              </View>
              <View style={styles.metaPill}>
                <Text style={styles.metaText}>💬 {replies.length}</Text>
              </View>
            </View>
          </View>

          {/* Replies */}
          <View style={styles.repliesWrap}>
            <Text style={styles.repliesTitle}>{replyCountLabel}</Text>

            {replies.map((reply) => (
              <View key={reply.id} style={styles.replyCard}>
                <BlurView intensity={14} tint="light" style={StyleSheet.absoluteFill} />
                <LinearGradient
                  colors={["rgba(255,255,255,0.62)", "rgba(222,210,255,0.12)"]}
                  style={StyleSheet.absoluteFill}
                />

                <Text style={styles.replyContent}>{reply.content}</Text>

                <View style={styles.replyMeta}>
                  <Text style={styles.replyAuthor}>{reply.authorUsername}</Text>
                  <Text style={styles.replyTime}>{timeAgo(reply.createdAt)}</Text>
                </View>
              </View>
            ))}

            {replies.length === 0 && (
              <Text style={styles.emptyReply}>
                No replies yet. Be the first to leave something kind 💜
              </Text>
            )}
          </View>

          {/* Spacer so last reply isn't hidden behind input */}
          <View style={{ height: 140 }} />
        </ScrollView>

        {/* Reply input dock */}
        <View style={styles.replyDock}>
          <BlurView intensity={24} tint="light" style={StyleSheet.absoluteFill} />
          <LinearGradient
            colors={[
              "rgba(255,255,255,0.70)",
              "rgba(222,210,255,0.14)",
              "rgba(167,199,161,0.10)",
            ]}
            style={StyleSheet.absoluteFill}
          />

          <TextInput
            style={styles.replyInput}
            placeholder="Write a reply..."
            placeholderTextColor={COLORS.textMuted}
            value={replyText}
            onChangeText={setReplyText}
            multiline
          />

          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.sendButton, !replyText.trim() && styles.sendDisabled]}
            onPress={handleAddReply}
            disabled={!replyText.trim()}
          >
            <LinearGradient
              colors={["rgba(90,31,193,0.90)", "rgba(160,131,249,0.85)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },

  /* ===== Liquid-glass header ===== */
  headerWrap: {
    paddingTop: Platform.OS === "ios" ? 60 : 42,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.45)",
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: 1,
    borderColor: "rgba(34,34,34,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.lavenderDeep,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.text,
  },
  headerSubtitle: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textMuted,
  },

  /* ===== Content ===== */
  content: {
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    paddingBottom: 20,
  },

  /* ===== Post Card ===== */
  card: {
    borderRadius: RADIUS.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    ...SHADOW.soft,
  },
  postTitle: { fontSize: 20, fontWeight: "900", color: COLORS.text },
  postBody: {
    marginTop: SPACING.md,
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.textMuted,
  },
  metaRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: SPACING.lg,
  },
  metaPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.60)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: "rgba(34,34,34,0.06)",
  },
  metaText: { fontSize: 14, fontWeight: "800", color: COLORS.textMuted },

  /* ===== Replies ===== */
  repliesWrap: { marginTop: SPACING.xl },
  repliesTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  replyCard: {
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  replyContent: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 21,
    marginBottom: 10,
  },
  replyMeta: { flexDirection: "row", justifyContent: "space-between" },
  replyAuthor: { fontSize: 13, fontWeight: "900", color: COLORS.lavenderDeep },
  replyTime: { fontSize: 13, color: COLORS.textMuted },
  emptyReply: { color: COLORS.textMuted, lineHeight: 20, marginTop: 6 },

  /* ===== Reply Dock ===== */
  replyDock: {
    position: "absolute",
    left: SPACING.xl,
    right: SPACING.xl,
    bottom: Platform.OS === "ios" ? 22 : 16,
    borderRadius: RADIUS.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    gap: 10,
    ...SHADOW.soft,
  },
  replyInput: {
    flex: 1,
    maxHeight: 110,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: RADIUS.lg,
    backgroundColor: "rgba(255,255,255,0.55)",
    color: COLORS.text,
  },
  sendButton: {
    borderRadius: RADIUS.pill,
    overflow: "hidden",
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sendDisabled: { opacity: 0.55 },
  sendText: { color: "white", fontWeight: "900" },
});