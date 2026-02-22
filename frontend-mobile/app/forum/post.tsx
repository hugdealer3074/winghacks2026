import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

import { useAuth } from "../../contexts/AuthContext";
import { timeAgo } from "../../utils/timeAgo";

import { BackgroundBlobs } from "../../components/BackgroundBlobs";

const COLORS = {
  lavender: "#A083F9",
  lavenderDeep: "#5A1FC1",
  lavenderSoft: "#DED2FF",
  sage: "#A7C7A1",
  background: "#FFFBF9",
  text: "#222222",
  textMuted: "rgba(34,34,34,0.55)",
  border: "rgba(255,255,255,0.55)",
};

function formatCategory(cat?: string) {
  const s = (cat || "general").toString().trim();
  if (!s) return "General";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function PostDetailScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [post, setPost] = useState<any>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    loadPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const loadPost = async () => {
    const savedPosts = await AsyncStorage.getItem("forumPosts");
    if (savedPosts) {
      const posts = JSON.parse(savedPosts);
      const foundPost = posts.find((p: any) => p.id === postId);
      setPost(foundPost);
    }
  };

  const handleAddReply = async () => {
    if (!replyText.trim() || !user || !post) return;

    const newReply = {
      id: `r${Date.now()}`,
      content: replyText.trim(),
      authorUsername: user.anonymousUsername,
      createdAt: new Date().toISOString(),
    };

    const updatedPost = {
      ...post,
      replies: [...(post.replies || []), newReply],
    };

    const savedPosts = await AsyncStorage.getItem("forumPosts");
    if (savedPosts) {
      const posts = JSON.parse(savedPosts);
      const updatedPosts = posts.map((p: any) => (p.id === postId ? updatedPost : p));
      await AsyncStorage.setItem("forumPosts", JSON.stringify(updatedPosts));
      setPost(updatedPost);
      setReplyText("");
    }
  };

  const replyCountLabel = useMemo(() => {
    const n = post?.replies?.length ?? 0;
    return `${n} ${n === 1 ? "Reply" : "Replies"}`;
  }, [post?.replies?.length]);

  if (!post) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.lavenderDeep} />
        <Text style={styles.loadingText}>Loading post…</Text>
      </View>
    );
  }

  const categoryLabel = formatCategory(post.category);

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
    >
      <View style={styles.screen}>
        <BackgroundBlobs />

        {/* ✅ Liquid-glass header (with back arrow) */}
        <View style={styles.headerWrap}>
          <BlurView intensity={22} tint="light" style={StyleSheet.absoluteFill} />
          <LinearGradient
            colors={[
              "rgba(160,131,249,0.18)",
              "rgba(222,210,255,0.16)",
              "rgba(167,199,161,0.10)",
              "rgba(255,251,249,0.40)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.headerTopRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={18} color={COLORS.text} />
            </TouchableOpacity>

            <View style={{ flex: 1 }} />

            <View style={styles.categoryChip}>
              <Text style={styles.categoryChipText}>{categoryLabel}</Text>
            </View>
          </View>

          <Text style={styles.headerTitle}>Post</Text>
          <Text style={styles.headerSubtitle}>
            {post.authorUsername} • {timeAgo(post.createdAt)}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Post Card */}
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
                <Text style={styles.metaText}>💬 {post.replies?.length ?? 0}</Text>
              </View>
            </View>
          </View>

          {/* Replies */}
          <View style={styles.repliesWrap}>
            <Text style={styles.repliesTitle}>{replyCountLabel}</Text>

            {(post.replies || []).map((reply: any) => (
              <View key={reply.id} style={styles.replyCard}>
                <BlurView intensity={14} tint="light" style={StyleSheet.absoluteFill} />
                <LinearGradient
                  colors={["rgba(255,255,255,0.62)", "rgba(222,210,255,0.12)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />

                <Text style={styles.replyContent}>{reply.content}</Text>

                <View style={styles.replyMeta}>
                  <Text style={styles.replyAuthor}>{reply.authorUsername}</Text>
                  <Text style={styles.replyTime}>{timeAgo(reply.createdAt)}</Text>
                </View>
              </View>
            ))}

            {(post.replies || []).length === 0 && (
              <Text style={styles.emptyReply}>
                No replies yet. Be the first to leave something kind 💜
              </Text>
            )}
          </View>

          {/* Spacer so last reply isn't hidden behind dock */}
          <View style={{ height: 140 }} />
        </ScrollView>

        {/* Reply Dock */}
        {user && (
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
                colors={["rgba(90,31,193,0.92)", "rgba(160,131,249,0.86)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },

  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { marginTop: 10, color: COLORS.textMuted, fontWeight: "700" },

  headerWrap: {
    paddingTop: Platform.OS === "ios" ? 60 : 42,
    paddingBottom: 14,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.45)",
  },
  headerTopRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
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
    borderRadius: 999,
    backgroundColor: "rgba(222,210,255,0.60)",
    borderWidth: 1,
    borderColor: "rgba(160,131,249,0.28)",
  },
  categoryChipText: { fontSize: 12, fontWeight: "900", color: COLORS.lavenderDeep },

  headerTitle: { fontSize: 26, fontWeight: "900", color: COLORS.text },
  headerSubtitle: { marginTop: 6, fontSize: 14, fontWeight: "700", color: COLORS.textMuted },

  content: { paddingTop: 18, paddingHorizontal: 24, paddingBottom: 20 },

  card: {
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  postTitle: { fontSize: 20, fontWeight: "900", color: COLORS.text },
  postBody: { marginTop: 14, fontSize: 16, lineHeight: 22, color: COLORS.textMuted },

  metaRow: { flexDirection: "row", gap: 10, marginTop: 18 },
  metaPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.60)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(34,34,34,0.06)",
  },
  metaText: { fontSize: 14, fontWeight: "800", color: COLORS.textMuted },

  repliesWrap: { marginTop: 24 },
  repliesTitle: { fontSize: 16, fontWeight: "900", color: COLORS.text, marginBottom: 14 },

  replyCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
    padding: 18,
    marginBottom: 14,
  },
  replyContent: { fontSize: 15, color: COLORS.text, lineHeight: 21, marginBottom: 10 },
  replyMeta: { flexDirection: "row", justifyContent: "space-between" },
  replyAuthor: { fontSize: 13, fontWeight: "900", color: COLORS.lavenderDeep },
  replyTime: { fontSize: 13, color: COLORS.textMuted },
  emptyReply: { color: COLORS.textMuted, lineHeight: 20, marginTop: 6 },

  replyDock: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: Platform.OS === "ios" ? 22 : 16,
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  replyInput: {
    flex: 1,
    maxHeight: 110,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.55)",
    color: COLORS.text,
  },
  sendButton: {
    borderRadius: 999,
    overflow: "hidden",
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sendDisabled: { opacity: 0.55 },
  sendText: { color: "white", fontWeight: "900" },
});