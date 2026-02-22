import { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import { timeAgo } from "../../utils/timeAgo";

import { BackgroundBlobs } from "../../components/BackgroundBlobs";
import { COLORS, SPACING, RADIUS, SHADOW } from "../../theme";

// IMPORTANT: your floating glass tab bar overlays the screen.
// This keeps content and the FAB from getting covered.
const TAB_BAR_SPACE = Platform.OS === "ios" ? 120 : 110;

interface Reply {
  id: string;
  content: string;
  authorUsername: string;
  createdAt: string;
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string;
  authorUsername: string;
  upvotes: number;
  replies: Reply[];
  createdAt: string;
}

const mockPosts: ForumPost[] = [
  {
    id: "1",
    title: "Best diaper bags for new parents?",
    content: "Looking for recommendations on diaper bags that are actually practical.",
    category: "parenting",
    authorUsername: "HappyPanda42",
    upvotes: 15,
    replies: [],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    title: "When should I call the doctor about fever?",
    content: "My 3-month-old has a temp of 100.5. Is this urgent?",
    category: "health",
    authorUsername: "CalmButterfly23",
    upvotes: 8,
    replies: [],
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    title: "Feeling overwhelmed as a first-time mom",
    content: "Is it normal to feel like I have no idea what I'm doing?",
    category: "general",
    authorUsername: "TiredDolphin91",
    upvotes: 23,
    replies: [],
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
];

export default function ForumScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"all" | "myPosts">("all");

  const loadPosts = async () => {
    const savedPosts = await AsyncStorage.getItem("forumPosts");
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      setPosts(mockPosts);
      await AsyncStorage.setItem("forumPosts", JSON.stringify(mockPosts));
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [])
  );

  // Softer, calmer category colors (still distinct)
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      pregnancy: "rgba(160,131,249,0.85)", // lavender
      newborn: "rgba(167,199,161,0.85)", // sage
      parenting: "rgba(222,210,255,0.90)", // lavender soft
      health: "rgba(90,31,193,0.82)", // lavender deep
      general: "rgba(167,199,161,0.65)", // sage soft
    };
    return colors[category] || "rgba(34,34,34,0.25)";
  };

  const categories = useMemo(
    () => ["all", "pregnancy", "newborn", "parenting", "health", "general"],
    []
  );

  let filteredPosts = posts;

  if (viewMode === "myPosts") {
    filteredPosts = posts.filter((p) => p.authorUsername === user?.anonymousUsername);
  }

  if (filter !== "all") {
    filteredPosts = filteredPosts.filter((p) => p.category === filter);
  }

  const renderPost = ({ item }: { item: ForumPost }) => {
    const isMyPost = item.authorUsername === user?.anonymousUsername;

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        style={[styles.postCard, isMyPost && styles.myPostCard]}
        onPress={() =>
          router.push({
            pathname: "/forum/post",
            params: { postId: item.id },
          })
        }
      >
        {/* glass background */}
        <BlurView intensity={18} tint="light" style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={[
            "rgba(255,255,255,0.72)",
            "rgba(222,210,255,0.22)",
            "rgba(167,199,161,0.14)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {isMyPost && (
          <View style={styles.myPostBadge}>
            <Text style={styles.myPostBadgeText}>Your Post</Text>
          </View>
        )}

        <View style={styles.postHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
            <Text style={styles.categoryText}>
              {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
            </Text>
          </View>
          <Text style={styles.postTime}>{timeAgo(item.createdAt)}</Text>
        </View>

        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postPreview} numberOfLines={2}>
          {item.content}
        </Text>

        <View style={styles.postFooter}>
          <Text style={[styles.postAuthor, isMyPost && styles.myPostAuthor]}>
            {item.authorUsername} {isMyPost && "(You)"}
          </Text>

          <View style={styles.statsContainer}>
            <Text style={styles.statText}>⬆️ {item.upvotes}</Text>
            <Text style={styles.statText}>💬 {item.replies.length}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <BackgroundBlobs />

      {/* Header (glass) */}
      <View style={styles.headerWrap}>
        <BlurView intensity={22} tint="light" style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={["rgba(160,131,249,0.22)", "rgba(167,199,161,0.10)", "rgba(255,251,249,0.40)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <Text style={styles.headerTitle}>Community Forum</Text>
        <Text style={styles.headerSubtitle}>
          Welcome, {user?.anonymousUsername || "Guest"}
        </Text>
      </View>

      {/* Controls (glass strip) */}
      <View style={styles.controlsWrap}>
        <BlurView intensity={18} tint="light" style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={["rgba(255,255,255,0.62)", "rgba(222,210,255,0.14)", "rgba(167,199,161,0.10)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* View mode toggle */}
        <View style={styles.viewModeRow}>
          <TouchableOpacity
            style={[styles.togglePill, viewMode === "all" && styles.togglePillActive]}
            onPress={() => setViewMode("all")}
            activeOpacity={0.9}
          >
            <Text style={[styles.toggleText, viewMode === "all" && styles.toggleTextActive]}>
              All Posts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.togglePill, viewMode === "myPosts" && styles.togglePillActive]}
            onPress={() => setViewMode("myPosts")}
            activeOpacity={0.9}
          >
            <Text
              style={[styles.toggleText, viewMode === "myPosts" && styles.toggleTextActive]}
            >
              My Posts
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {categories.map((cat) => {
            const active = filter === cat;
            return (
              <TouchableOpacity
                key={cat}
                activeOpacity={0.9}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setFilter(cat)}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Posts */}
      {filteredPosts.length > 0 ? (
        <FlatList
          data={filteredPosts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.postsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📝</Text>
          <Text style={styles.emptyTitle}>
            {viewMode === "myPosts" ? "No posts yet" : "No posts found"}
          </Text>
          <Text style={styles.emptyText}>
            {viewMode === "myPosts"
              ? "Ask your first question — the community has your back."
              : "Try changing the category filter."}
          </Text>
        </View>
      )}

      {/* Floating Create Button (FAB) */}
      {user && (
        <TouchableOpacity
          activeOpacity={0.92}
          style={styles.fabWrap}
          onPress={() => router.push("/forum/create")}
        >
          <LinearGradient
            colors={["rgba(160,131,249,1)", "rgba(90,31,193,1)"]}
            start={{ x: 0.1, y: 0.2 }}
            end={{ x: 0.9, y: 1 }}
            style={styles.fab}
          >
            <Text style={styles.fabText}>+ Ask</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  headerWrap: {
    paddingTop: Platform.OS === "ios" ? 60 : 42,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.45)",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.text,
  },
  headerSubtitle: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textMuted,
  },

  controlsWrap: {
    marginTop: SPACING.md,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
    padding: SPACING.md,
    ...SHADOW.soft,
  },

  viewModeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },

  togglePill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: 1,
    borderColor: "rgba(34,34,34,0.10)",
    alignItems: "center",
  },
  togglePillActive: {
    backgroundColor: "rgba(222,210,255,0.70)",
    borderColor: "rgba(160,131,249,0.35)",
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  toggleTextActive: {
    color: COLORS.text,
  },

  filterRow: {
    paddingHorizontal: 2,
    gap: 10,
    paddingBottom: 2,
  },

  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: 1,
    borderColor: "rgba(34,34,34,0.10)",
  },
  filterChipActive: {
    backgroundColor: "rgba(167,199,161,0.35)",
    borderColor: "rgba(167,199,161,0.60)",
  },
  filterText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  filterTextActive: {
    color: COLORS.text,
  },

  postsList: {
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: TAB_BAR_SPACE + 40,
    gap: 12,
  },

  postCard: {
    borderRadius: RADIUS.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
    padding: SPACING.lg,
    ...SHADOW.soft,
  },

  myPostCard: {
    borderColor: "rgba(160,131,249,0.55)",
  },

  myPostBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(90,31,193,0.92)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    zIndex: 10,
  },
  myPostBadgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "800",
  },

  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  categoryText: {
    color: "white",
    fontSize: 12,
    fontWeight: "800",
  },

  postTime: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
  },

  postTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 8,
  },
  postPreview: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.textMuted,
    lineHeight: 20,
    marginBottom: 12,
  },

  postFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(34,34,34,0.08)",
  },

  postAuthor: {
    fontSize: 14,
    color: COLORS.lavenderDeep,
    fontWeight: "800",
  },
  myPostAuthor: {
    color: COLORS.lavenderDeep,
  },

  statsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  statText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textMuted,
  },

  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textMuted,
    textAlign: "center",
  },

  fabWrap: {
    position: "absolute",
    right: 18,
    bottom: TAB_BAR_SPACE + 18,
    borderRadius: 999,
    overflow: "hidden",
    ...SHADOW.soft,
  },
  fab: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  fabText: {
    color: "white",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
});