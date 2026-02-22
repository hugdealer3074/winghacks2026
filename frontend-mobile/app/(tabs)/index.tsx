// import React, { useState, useEffect, useRef } from 'react';
// import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
// import MapView, { Marker, Callout } from 'react-native-maps';
// import axios from 'axios';
// import { Ionicons } from '@expo/vector-icons';
// import * as Location from 'expo-location';
// import ProfileMenu from '@/components/ProfileMenu';

// // ---------------- Constants ----------------
// const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
// const BRAND_COLOR = "#8B5CF6";
// const LIGHT_PURPLE = "#F3E5F5";

// // ---------------- Types ----------------
// interface Clinic {
//   _id: string;
//   name: string;
//   lat: number;
//   lng: number;
//   type: 'medical' | 'community' | 'amenity' | 'shop';
//   medicaid: boolean;
//   family_restroom: boolean;
//   description: string;
// }

// interface Product {
//   _id: string; 
//   name: string;
//   price: number;
//   store: string;
//   brand: string;
//   category: string; 
// }

// //const Tab = createBottomTabNavigator();

// function EmptyState({ message }: { message: string }) {
//   return (
//     <View style={styles.center}>
//       <ActivityIndicator size="large" color={BRAND_COLOR} />
//       <Text style={styles.emptyText}>{message}</Text>
//     </View>
//   );
// }

// // ---------------- Map Screen ----------------
// export default function MapScreen() {
//   const [clinics, setClinics] = useState<Clinic[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState('All');
//   const [userCoords, setUserCoords] = useState<Location.LocationObjectCoords | null>(null);
//   const [menuVisible, setMenuVisible] = useState(false);
//   const mapRef = useRef<MapView>(null);

//   const mapFilters = [
//     { id: 'Medical', icon: 'medical', label: 'Health Clinics' },
//     { id: 'Restroom', icon: 'woman', label: 'Family Restrooms' },
//     { id: 'Shop', icon: 'cart', label: 'Care & Supply Shops' },
//     { id: 'Medicaid', icon: 'shield-checkmark', label: 'Medicaid' }
//   ];

//   useEffect(() => {
//     (async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status === "granted") {
//         const current = await Location.getCurrentPositionAsync({});
//         setUserCoords(current.coords);
//       }
//       try {
//         const res = await axios.get(`${BACKEND_URL}/clinics`);
//         setClinics(res.data);
//       } catch (err) {
//         console.error("Fetch Error:", err);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   const displayedClinics = clinics.filter(c => {
//     if (filter === 'All') return true;
//     switch (filter) {
//       case 'Medical':
//         return c.type === 'medical';
//       case 'Restroom':
//         return c.family_restroom === true;
//       case 'Shop':
//         return c.type === 'shop' || (c.type === 'community' && c.description?.toLowerCase().includes('supply'));
//       case 'Medicaid':
//         return c.medicaid === true;
//       default:
//         return true;
//     }
//   });

//   if (loading) return <EmptyState message="Locating resources..." />;

//   return (
//     <View style={styles.container}>
//       {/* Menu Button */}
//       <TouchableOpacity
//         style={styles.menuButton}
//         onPress={() => setMenuVisible(true)}
//       >
//         <Ionicons name="menu" size={28} color="white" />
//       </TouchableOpacity>

//       {/* Filter Pills */}
//       <View style={styles.pillContainer}>
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={{ paddingHorizontal: 15, paddingLeft: 70 }}
//         >
//           {mapFilters.map((f) => (
//             <TouchableOpacity
//               key={f.id}
//               style={[styles.filterPill, filter === f.id && styles.activePill]}
//               onPress={() => setFilter(prev => prev === f.id ? 'All' : f.id)}
//             >
//               <Ionicons
//                 name={f.icon as any}
//                 size={14}
//                 color={filter === f.id ? 'white' : BRAND_COLOR}
//                 style={{ marginRight: 5 }}
//               />
//               <Text style={[styles.pillText, filter === f.id && styles.activePillText]}>
//                 {f.label}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>
//       </View>

//       {/* Map */}
//       <MapView
//         ref={mapRef}
//         style={StyleSheet.absoluteFillObject}
//         initialRegion={{
//           latitude: userCoords?.latitude ?? 29.6516,
//           longitude: userCoords?.longitude ?? -82.3248,
//           latitudeDelta: 0.08,
//           longitudeDelta: 0.08,
//         }}
//         showsUserLocation={true}
//       >
//         {displayedClinics.map((c, index) => (
//           <Marker
//             key={index}
//             coordinate={{ latitude: Number(c.lat), longitude: Number(c.lng) }}
//             identifier={c.name}
//           >
//             <View style={[
//               styles.customMarker,
//               filter === 'Medicaid' && c.medicaid && { backgroundColor: '#2ecc71' }
//             ]}>
//               <Ionicons
//                 name={c.type === 'medical' ? "medical" : c.type === 'shop' ? "cart" : "heart"}
//                 size={16}
//                 color="white"
//               />
//             </View>
//             <Callout>
//               <View style={styles.calloutBox}>
//                 <Text style={styles.calloutTitle}>{c.name}</Text>
//                 <Text style={styles.calloutDesc}>{c.description}</Text>
//                 <View style={styles.amenityRow}>
//                   {c.type === 'medical' && c.medicaid && (
//                     <Text style={[styles.tag, styles.medicaidTag]}>🛡️ Medicaid</Text>
//                   )}
//                   {c.family_restroom && <Text style={styles.tag}>🚻 Restroom</Text>}
//                 </View>
//               </View>
//             </Callout>
//           </Marker>
//         ))}
//       </MapView>

//       {/* Profile Menu */}
//       <ProfileMenu
//         visible={menuVisible}
//         onClose={() => setMenuVisible(false)}
//       />
//     </View>
//   );
// }

// // ---------------- Styles ----------------
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff'
//   },
//   center: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 30
//   },
//   emptyText: {
//     marginTop: 15,
//     fontSize: 16,
//     color: 'gray',
//     textAlign: 'center'
//   },
//   menuButton: {
//     position: 'absolute',
//     top: 70,
//     left: 15,
//     backgroundColor: '#8B5CF6',
//     width: 45,
//     height: 45,
//     borderRadius: 22.5,
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 20,
//     elevation: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//   },
//   pillContainer: {
//     position: 'absolute',
//     top: 70,
//     left: 65,
//     right: 0,
//     zIndex: 10,
//   },
//   filterPill: {
//     flexDirection: 'row',
//     backgroundColor: 'white',
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//     borderRadius: 25,
//     marginRight: 10,
//     alignItems: 'center',
//     elevation: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//   },
//   activePill: {
//     backgroundColor: BRAND_COLOR,
//     elevation: 2,
//   },
//   pillText: {
//     fontWeight: '700',
//     fontSize: 13,
//     color: '#555'
//   },
//   activePillText: {
//     color: 'white'
//   },
//   customMarker: {
//     backgroundColor: BRAND_COLOR,
//     padding: 6,
//     borderRadius: 20,
//     borderWidth: 2,
//     borderColor: 'white',
//     elevation: 5
//   },
//   calloutBox: {
//     width: 180,
//     padding: 5
//   },
//   calloutTitle: {
//     fontWeight: 'bold',
//     fontSize: 14
//   },
//   calloutDesc: {
//     fontSize: 11,
//     color: 'gray',
//     marginVertical: 4
//   },
//   amenityRow: {
//     flexDirection: 'row',
//     marginTop: 5
//   },
//   tag: {
//     fontSize: 10,
//     backgroundColor: '#f0f0f0',
//     padding: 3,
//     borderRadius: 5,
//     marginRight: 5
//   },
//   medicaidTag: {
//     backgroundColor: LIGHT_PURPLE,
//     color: BRAND_COLOR
//   },
// });


import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import axios from 'axios';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Location from 'expo-location';
import ProfileMenu from '@/components/ProfileMenu';

// ---------------- Constants ----------------
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const BRAND_COLOR = "#8B5CF6"; // Maintained your first file's purple
const LIGHT_PURPLE = "#F3E5F5";

// ---------------- Types ----------------
interface Clinic {
  _id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'medical' | 'community' | 'amenity' | 'shop';
  medicaid: boolean;
  family_restroom: boolean;
  description: string;
}

interface Product {
  _id: string; 
  name: string;
  price: number;
  store: string;
  brand: string;
  category: string; 
}

const Tab = createBottomTabNavigator();

function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={BRAND_COLOR} />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

// ---------------- Map Screen ----------------
function MapScreen({ route }: any) {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [userCoords, setUserCoords] = useState<Location.LocationObjectCoords | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const mapRef = useRef<MapView>(null);
  
  // 🚀 Marker References for auto-showing callouts
  const markerRefs = useRef<{[key: string]: any}>({});

  const mapFilters = [
    { id: 'Medical', icon: 'medical', label: 'Health Clinics' },
    { id: 'Restroom', icon: 'woman', label: 'Family Restrooms' },
    { id: 'Shop', icon: 'Care & Supply Shops', label: 'Shops' },
    { id: 'Medicaid', icon: 'shield-checkmark', label: 'Medicaid' }
  ];

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const current = await Location.getCurrentPositionAsync({});
        setUserCoords(current.coords);
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

  // 🚀 Logic to handle jump from Products Screen
  useEffect(() => {
    if (route.params?.scrollToStore && clinics.length > 0) {
      const target = clinics.find(c => 
        c.name.toLowerCase().includes(route.params.scrollToStore.toLowerCase())
      );
      
      if (target && mapRef.current) {
        setFilter('All'); 

        mapRef.current.animateToRegion({
          latitude: Number(target.lat),
          longitude: Number(target.lng),
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);

        setTimeout(() => {
          const marker = markerRefs.current[target.name];
          if (marker) {
            marker.showCallout();
          }
        }, 1200); 
      }
    }
  }, [route.params?.scrollToStore, clinics]);

  const displayedClinics = clinics.filter(c => {
    if (filter === 'All') return true;
    switch (filter) {
      case 'Medical': return c.type === 'medical';
      case 'Restroom': return c.family_restroom === true;
      case 'Shop': return c.type === 'shop' || (c.type === 'community' && c.description?.toLowerCase().includes('supply'));
      case 'Medicaid': return c.type === 'medical' && c.medicaid === true;
      default: return true;
    }
  });

  if (loading) return <EmptyState message="Locating resources..." />;

  return (
    <View style={styles.container}>
      {/* Menu Button from File 1 */}
      <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
        <Ionicons name="menu" size={28} color="white" />
      </TouchableOpacity>

      {/* Filter Pills from File 1 with updated logic */}
      <View style={styles.pillContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 15, paddingLeft: 70 }}>
          {mapFilters.map((f) => (
            <TouchableOpacity 
              key={f.id} 
              style={[styles.filterPill, filter === f.id && styles.activePill]}
              onPress={() => setFilter(prev => prev === f.id ? 'All' : f.id)}
            >
              <Ionicons name={f.icon as any} size={14} color={filter === f.id ? 'white' : BRAND_COLOR} style={{ marginRight: 5 }} />
              <Text style={[styles.pillText, filter === f.id && styles.activePillText]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: userCoords?.latitude ?? 29.6516,
          longitude: userCoords?.longitude ?? -82.3248,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
        showsUserLocation={true}
      >
        {displayedClinics.map((c, index) => (
          <Marker 
            key={`${filter}-${c._id || index}`} 
            coordinate={{ latitude: Number(c.lat), longitude: Number(c.lng) }}
            ref={(el) => { if(el) markerRefs.current[c.name] = el; }}
            identifier={c.name}
          >
            <View style={[
              styles.customMarker, 
              filter === 'Restroom' && { backgroundColor: '#3498db', borderColor: '#fff' },
              filter === 'Medicaid' && c.type === 'medical' && { backgroundColor: '#2ecc71', borderColor: '#fff' },
              filter === 'Shop' && { backgroundColor: '#e67e22', borderColor: '#fff' }
            ]}>
              <Ionicons 
                name={filter === 'Restroom' ? "woman" : filter === 'Shop' ? "cart" : c.type === 'medical' ? "medical" : "heart"} 
                size={16} 
                color="white" 
              />
            </View>

            <Callout tooltip={false}>
              <View style={styles.calloutBox}>
                <Text style={styles.calloutTitle}>{c.name}</Text>
                <Text style={styles.calloutDesc}>{c.description || "Gainesville Community Resource"}</Text>
                <View style={styles.amenityRow}>
                  {c.type === 'medical' && c.medicaid && (
                    <Text style={[styles.tag, styles.medicaidTag]}>🛡️ Medicaid</Text>
                  )}
                  {c.family_restroom && <Text style={styles.tag}>🚻 Restroom</Text>}
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <ProfileMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </View>
  );
}

// ---------------- Products Screen ----------------
function ProductsScreen({ navigation }: any) {
  const [products, setProducts] = useState<Product[]>([]);
  const [maxPrice, setMaxPrice] = useState(40); 
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Health', 'Feeding', 'Diapering', 'Clothing', 'Gear'];

  useEffect(() => {
    axios.get(`${BACKEND_URL}/products`)
      .then(res => { setProducts(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filteredAndSorted = products
    .filter(p => (activeTab === 'All' || p.category === activeTab))
    .filter(p => p.price <= maxPrice)
    .sort((a, b) => a.price - b.price);

  if (loading) return <EmptyState message="Searching essentials..." />;

  return (
    <View style={styles.container}>
      <View style={styles.categoryBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 15 }}>
          {categories.map(cat => (
            <TouchableOpacity key={cat} onPress={() => setActiveTab(cat)} style={[styles.catTab, activeTab === cat && styles.activeCatTab]}>
              <Text style={[styles.catTabText, activeTab === cat && styles.activeCatTabText]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.priceFilterContainer}>
        <View style={styles.priceHeaderRow}>
           <Text style={styles.priceHeaderText}>Budget</Text>
           <Text style={styles.priceValueText}>Under ${maxPrice}</Text>
        </View>
        <Slider style={{ width: '100%', height: 40 }} minimumValue={0} maximumValue={40} step={5} value={maxPrice} onValueChange={setMaxPrice} minimumTrackTintColor={BRAND_COLOR} thumbTintColor={BRAND_COLOR} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollPadding}>
        {filteredAndSorted.map((p, index) => (
          <View key={index} style={styles.productCard}>
            <View style={styles.cardLeft}>
              <View style={styles.iconCircle}><Ionicons name={p.category === 'Health' ? "medkit" : "nutrition"} size={20} color={BRAND_COLOR} /></View>
              <View>
                <Text style={styles.productTitle}>{p.name}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Map', { scrollToStore: p.store })} style={styles.storeBadge}>
                  <Ionicons name="location" size={12} color={BRAND_COLOR} />
                  <Text style={{ color: BRAND_COLOR, fontWeight: 'bold' }}> {p.store} →</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.cardRight}>
              <Text style={[styles.productPrice, p.price === 0 && styles.freeText]}>{p.price === 0 ? "FREE" : `$${p.price.toFixed(2)}`}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ---------------- Chat Screen ----------------
function ChatScreen() {
  return (
    <View style={styles.center}>
      <Ionicons name="chatbubbles-outline" size={80} color={BRAND_COLOR} />
      <Text style={{ fontSize: 22, fontWeight: 'bold' }}>GatorFamily AI</Text>
      <Text style={styles.chatSub}>Ask about eligibility or supply locations.</Text>
    </View>
  );
}

// ---------------- Main App Component ----------------
export default function App() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      tabBarActiveTintColor: BRAND_COLOR,
      headerStyle: { backgroundColor: BRAND_COLOR },
      headerTintColor: '#fff',
      tabBarIcon: ({ color, size }) => {
        let icon: any = route.name === 'Map' ? 'map' : route.name === 'Products' ? 'cart' : 'chatbubbles';
        return <Ionicons name={icon} size={size} color={color} />;
      },
    })}>
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
    </Tab.Navigator>
  );
}

// ---------------- Styles (Combined) ----------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  menuButton: {
    position: 'absolute', top: 70, left: 15, backgroundColor: BRAND_COLOR,
    width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center',
    zIndex: 20, elevation: 10, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4,
  },
  pillContainer: { position: 'absolute', top: 70, left: 65, right: 0, zIndex: 10 },
  filterPill: {
    flexDirection: 'row', backgroundColor: 'white', paddingHorizontal: 15, paddingVertical: 10,
    borderRadius: 25, marginRight: 10, alignItems: 'center', elevation: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4,
  },
  activePill: { backgroundColor: BRAND_COLOR, elevation: 2 },
  pillText: { fontWeight: '700', fontSize: 13, color: '#555' },
  activePillText: { color: 'white' },
  customMarker: { backgroundColor: BRAND_COLOR, padding: 6, borderRadius: 20, borderWidth: 2, borderColor: 'white', elevation: 5 },
  calloutBox: { width: 180, padding: 5 },
  calloutTitle: { fontWeight: 'bold', fontSize: 14 },
  calloutDesc: { fontSize: 11, color: 'gray', marginVertical: 4 },
  amenityRow: { flexDirection: 'row', marginTop: 5, flexWrap: 'wrap' },
  tag: { fontSize: 10, backgroundColor: '#f0f0f0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, marginRight: 5, marginTop: 2, color: '#444' },
  medicaidTag: { backgroundColor: LIGHT_PURPLE, color: BRAND_COLOR, fontWeight: 'bold' },
  productCard: { backgroundColor: 'white', borderRadius: 15, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', elevation: 3 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: LIGHT_PURPLE, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  productTitle: { fontSize: 16, fontWeight: '700' },
  storeBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  productPrice: { fontSize: 18, fontWeight: 'bold' },
  freeText: { color: '#2ecc71' },
  categoryBar: { backgroundColor: '#fff', paddingVertical: 10 },
  catTab: { paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, borderRadius: 20, backgroundColor: '#eee' },
  activeCatTab: { backgroundColor: BRAND_COLOR },
  catTabText: { color: '#666', fontWeight: '600' },
  activeCatTabText: { color: 'white' },
  priceFilterContainer: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  priceHeaderRow: { flexDirection: 'row', justifyContent: 'space-between' },
  priceValueText: { color: BRAND_COLOR, fontWeight: 'bold' },
  scrollPadding: { padding: 15 },
  emptyText: { marginTop: 15, fontSize: 16, color: 'gray', textAlign: 'center' },
  chatSub: { color: 'gray', marginTop: 10, textAlign: 'center' },
  priceHeaderText: { fontSize: 14, color: '#666', fontWeight: '600' },
  cardRight: { alignItems: 'flex-end', justifyContent: 'center' }
});