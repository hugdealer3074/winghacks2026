import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Platform,
} from "react-native";
import axios from "axios";
import Ionicons from "@expo/vector-icons/Ionicons";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

import { BackgroundBlobs } from "../../components/BackgroundBlobs";
import { COLORS, SPACING, RADIUS, SHADOW } from "../../theme";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

// IMPORTANT: your floating glass tab bar overlays the screen.
// This keeps the list + content from being hidden behind it.
const TAB_BAR_SPACE = Platform.OS === "ios" ? 120 : 110;

type Product = {
  _id?: string;
  name: string;
  category: string;
  price: number;
  store: string;
};

export default function EssentialsScreen() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [maxPrice, setMaxPrice] = useState(40);
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);

  const categories = useMemo(
    () => ["All", "Health", "Feeding", "Diapering", "Clothing", "Gear"],
    []
  );

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        if (!BACKEND_URL) {
          console.warn("EXPO_PUBLIC_BACKEND_URL is missing. Showing empty list.");
          if (isMounted) setProducts([]);
          return;
        }

        const res = await axios.get(`${BACKEND_URL}/products`, {
          timeout: 6000,
        });

        if (isMounted) setProducts(res.data);
      } catch (err) {
        console.error("Essentials Fetch Error:", err);
        if (isMounted) setProducts([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredAndSorted = useMemo(() => {
    return products
      .filter((p) => activeTab === "All" || p.category === activeTab)
      .filter((p) => p.price <= maxPrice)
      .sort((a, b) => a.price - b.price);
  }, [products, activeTab, maxPrice]);

  const iconForCategory = (category: string) => {
    switch (category) {
      case "Health":
        return "medkit";
      case "Feeding":
        return "nutrition";
      case "Diapering":
        return "water";
      case "Clothing":
        return "shirt";
      case "Gear":
        return "car";
      default:
        return "sparkles";
    }
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => {
        router.push({
          pathname: "/",
          params: { scrollToStore: item.store },
        });
      }}
      style={styles.productCard}
    >
      {/* Glass background */}
      <BlurView intensity={18} tint="light" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={[
          "rgba(255,255,255,0.72)",
          "rgba(222,210,255,0.20)",
          "rgba(167,199,161,0.14)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.cardLeft}>
        <View style={styles.iconCircle}>
          <Ionicons
            name={iconForCategory(item.category) as any}
            size={18}
            color={COLORS.lavenderDeep}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.productTitle}>{item.name}</Text>

          <View style={styles.storeBadge}>
            <Ionicons name="location" size={12} color={COLORS.lavenderDeep} />
            <Text style={styles.storeBadgeText}> {item.store} →</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardRight}>
        <Text style={[styles.productPrice, item.price === 0 && styles.freeText]}>
          {item.price === 0 ? "FREE" : `$${item.price.toFixed(2)}`}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      <BackgroundBlobs />

      {/* Forum-style Header (full-width glass banner) */}
      <View style={styles.headerWrap}>
        <BlurView intensity={22} tint="light" style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={[
            "rgba(160,131,249,0.22)",
            "rgba(167,199,161,0.10)",
            "rgba(255,251,249,0.40)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <Text style={styles.headerTitle}>Essentials</Text>
        <Text style={styles.headerSubtitle}>
          Budget-friendly items and free resources near you
        </Text>
      </View>

      {/* Controls (glass card) */}
      <View style={styles.controlsGlass}>
        <BlurView intensity={18} tint="light" style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={[
            "rgba(255,255,255,0.62)",
            "rgba(222,210,255,0.14)",
            "rgba(167,199,161,0.10)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {categories.map((cat) => {
            const active = activeTab === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveTab(cat)}
                activeOpacity={0.9}
                style={[styles.catTab, active && styles.catTabActive]}
              >
                <Text style={[styles.catTabText, active && styles.catTabTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Budget */}
        <View style={styles.budgetRow}>
          <View style={styles.budgetHeaderRow}>
            <Text style={styles.budgetTitle}>Budget</Text>
            <Text style={styles.budgetValue}>Under ${maxPrice}</Text>
          </View>

          <Slider
            style={{ width: "100%", height: 36 }}
            minimumValue={0}
            maximumValue={40}
            step={5}
            value={maxPrice}
            onValueChange={setMaxPrice}
            minimumTrackTintColor={COLORS.lavenderDeep}
            thumbTintColor={COLORS.lavenderDeep}
          />
        </View>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.lavenderDeep} />
          <Text style={styles.loadingText}>Finding essentials…</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAndSorted}
          renderItem={renderProduct}
          keyExtractor={(item, index) =>
            `${item._id ?? "noid"}-${item.name}-${item.store}-${index}`
          }
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🧺</Text>
              <Text style={styles.emptyTitle}>No items found</Text>
              <Text style={styles.emptyText}>
                Try increasing your budget or changing categories.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  /* ===== Forum-style header ===== */
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

  /* ===== Controls card ===== */
  controlsGlass: {
    marginTop: SPACING.md,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    ...SHADOW.soft,
  },

  categoryRow: {
    paddingHorizontal: 2,
    gap: 10,
    paddingBottom: SPACING.sm,
  },

  catTab: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: 1,
    borderColor: "rgba(34,34,34,0.10)",
  },
  catTabActive: {
    backgroundColor: "rgba(222,210,255,0.75)",
    borderColor: "rgba(160,131,249,0.40)",
  },
  catTabText: {
    color: COLORS.textMuted,
    fontWeight: "800",
    fontSize: 13,
  },
  catTabTextActive: {
    color: COLORS.text,
  },

  budgetRow: {
    marginTop: 6,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(34,34,34,0.08)",
  },

  budgetHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  budgetTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.text,
  },
  budgetValue: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.lavenderDeep,
  },

  /* ===== List ===== */
  listPadding: {
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: TAB_BAR_SPACE + 40,
    gap: 12,
  },

  loadingWrap: {
    paddingTop: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textMuted,
  },

  emptyState: {
    paddingTop: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.xl,
  },
  emptyEmoji: { fontSize: 28, marginBottom: 8 },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  emptyText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMuted,
    textAlign: "center",
  },

  /* ===== Product card ===== */
  productCard: {
    borderRadius: RADIUS.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
    padding: SPACING.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    ...SHADOW.soft,
  },

  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },

  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: "rgba(222,210,255,0.65)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(34,34,34,0.10)",
  },

  productTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
  },

  storeBadge: {
    marginTop: 6,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: 1,
    borderColor: "rgba(34,34,34,0.10)",
  },
  storeBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textMuted,
  },

  cardRight: {
    alignItems: "flex-end",
    justifyContent: "center",
    paddingLeft: 10,
  },

  productPrice: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.text,
  },

  freeText: {
    color: COLORS.lavenderDeep,
  },
});