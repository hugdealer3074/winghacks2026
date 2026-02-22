import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import ProfileMenu from "@/components/ProfileMenu";
import { useNavigation, useLocalSearchParams } from "expo-router";
import { GlassHeader } from "../../components/GlassHeader";
import { GlassIconButton } from "../../components/GlassIconButton";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const BRAND_COLOR = "#8B5CF6";
const LIGHT_PURPLE = "#F3E5F5";

interface Clinic {
  _id: string;
  name: string;
  lat: number;
  lng: number;
  type: "medical" | "community" | "amenity" | "shop";
  medicaid: boolean;
  family_restroom: boolean;
  description: string;
}

function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={BRAND_COLOR} />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

export default function MapScreen() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [userCoords, setUserCoords] =
    useState<Location.LocationObjectCoords | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const mapRef = useRef<MapView>(null);
  const markerRefs = useRef<Record<string, any>>({});

  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const scrollToStore = params.scrollToStore as string | undefined;

  const mapFilters = [
    { id: "Medical", icon: "medical", label: "Health Clinics" },
    { id: "Restroom", icon: "woman", label: "Family Restrooms" },
    { id: "Shop", icon: "cart", label: "Care & Supply Shops" },
    { id: "Medicaid", icon: "shield-checkmark", label: "Medicaid" },
  ] as const;

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const current = await Location.getCurrentPositionAsync({});
          setUserCoords(current.coords);
        }
      } catch (e) {
        console.warn("Location error:", e);
      }

      try {
        const res = await axios.get(`${BACKEND_URL}/clinics`);
        setClinics(res.data);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const performScroll = (storeName: string) => {
    if (!storeName || clinics.length === 0) return;

    const normalized = storeName.toLowerCase().trim();

    const target = clinics.find(
      (c) =>
        c.name.toLowerCase().trim() === normalized ||
        c.name.toLowerCase().includes(normalized)
    );

    if (target && mapRef.current) {
      setFilter("All");
      mapRef.current.animateToRegion(
        {
          latitude: Number(target.lat),
          longitude: Number(target.lng),
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );

      setTimeout(() => {
        const ref = markerRefs.current[target.name];
        if (ref?.showCallout) ref.showCallout();
      }, 1100);
    }
  };

  useEffect(() => {
    if (scrollToStore) performScroll(scrollToStore);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollToStore, clinics]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (scrollToStore) performScroll(scrollToStore);
    });
    return unsubscribe;
  }, [navigation, scrollToStore, clinics]);

  const displayedClinics = clinics.filter((c) => {
    if (filter === "All") return true;

    switch (filter) {
      case "Medical":
        return c.type === "medical";
      case "Restroom":
        return c.family_restroom === true;
      case "Shop":
        return (
          c.type === "shop" ||
          (c.type === "community" &&
            (c.description ?? "").toLowerCase().includes("supply"))
        );
      case "Medicaid":
        return c.type === "medical" && c.medicaid === true;
      default:
        return true;
    }
  });

  if (loading) return <EmptyState message="Locating resources..." />;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: userCoords?.latitude ?? 29.6516,
          longitude: userCoords?.longitude ?? -82.3248,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
        showsUserLocation
      >
        {displayedClinics.map((clinic) => (
          <Marker
            key={`${clinic._id ?? "noid"}-${clinic.name}-${clinic.lat}-${clinic.lng}`}
            coordinate={{
              latitude: Number(clinic.lat),
              longitude: Number(clinic.lng),
            }}
            ref={(ref) => {
              if (ref) markerRefs.current[clinic.name] = ref;
            }}
          >
            <View style={styles.customMarker}>
              <Ionicons
                name={clinic.type === "medical" ? "medical" : "heart"}
                size={16}
                color="white"
              />
            </View>

            <Callout tooltip={false}>
              <View style={styles.calloutBox}>
                <Text style={styles.calloutTitle}>{clinic.name}</Text>
                {!!clinic.description && (
                  <Text style={styles.calloutDesc}>{clinic.description}</Text>
                )}

                <View style={styles.amenityRow}>
                  {clinic.family_restroom && (
                    <Text style={styles.tag}>Family Restroom</Text>
                  )}
                  {clinic.medicaid && (
                    <Text style={[styles.tag, styles.medicaidTag]}>Medicaid</Text>
                  )}
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* TOP OVERLAY (header + filters) */}
      <View style={styles.topOverlay}>
        <View style={styles.headerSlot}>
          <GlassHeader title="Map" />
        </View>

        <View style={styles.filtersRow}>
          <GlassIconButton icon="menu" onPress={() => setMenuVisible(true)} />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScrollContent}
          >
            {mapFilters.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[styles.filterPill, filter === f.id && styles.activePill]}
                onPress={() => setFilter((prev) => (prev === f.id ? "All" : f.id))}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={f.icon as any}
                  size={14}
                  color={filter === f.id ? "white" : BRAND_COLOR}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.pillText, filter === f.id && styles.activePillText]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <ProfileMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 30 },
  emptyText: { marginTop: 15, fontSize: 16, color: "gray", textAlign: "center" },

  headerSlot: {
    height: Platform.OS === "ios" ? 110 : 64, // tweak if needed
    justifyContent: "flex-end",
  },

  // overlay wrapper for header + filters
  topOverlay: {
    position: "absolute",
    top: Platform.OS === "ios" ? 6 : 0,
    left: 0,
    right: 0,
    zIndex: 50,
    elevation: 50, // android
  },

  // row that sits UNDER GlassHeader
  filtersRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    marginTop: 0,
  },

  filtersScrollContent: {
    paddingRight: 20,
    alignItems: "center",
  },

  filterPill: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    alignItems: "center",
    elevation: 5,
  },

  activePill: { backgroundColor: BRAND_COLOR },
  pillText: { fontWeight: "700", fontSize: 13, color: "#555" },
  activePillText: { color: "white" },

  customMarker: {
    backgroundColor: BRAND_COLOR,
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "white",
    elevation: 5,
  },

  calloutBox: { width: 180, padding: 5 },
  calloutTitle: { fontWeight: "bold", fontSize: 14 },
  calloutDesc: { fontSize: 11, color: "gray", marginVertical: 4 },

  amenityRow: { flexDirection: "row", marginTop: 5, flexWrap: "wrap" },
  tag: {
    fontSize: 10,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    marginRight: 5,
    marginTop: 2,
    color: "#444",
  },
  medicaidTag: {
    backgroundColor: LIGHT_PURPLE,
    color: BRAND_COLOR,
    fontWeight: "bold",
  },
});