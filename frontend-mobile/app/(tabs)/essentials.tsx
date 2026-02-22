

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList, ScrollView, SafeAreaView, Platform } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const BRAND_COLOR = "#8B5CF6";
const LIGHT_PURPLE = "#F3E5F5";

export default function EssentialsScreen({ navigation }: any) {
  const [products, setProducts] = useState([]);
  const [maxPrice, setMaxPrice] = useState(40); 
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);
const router = useRouter();
  const categories = ['All', 'Health', 'Feeding', 'Diapering', 'Clothing', 'Gear'];

  useEffect(() => {
    axios.get(`${BACKEND_URL}/products`)
      .then(res => { setProducts(res.data); })
      .catch(err => console.error("Essentials Fetch Error:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredAndSorted = products
    .filter((p: any) => (activeTab === 'All' || p.category === activeTab))
    .filter((p: any) => p.price <= maxPrice)
    .sort((a: any, b: any) => a.price - b.price);

  const renderProduct = ({ item }: { item: any }) => (
  <TouchableOpacity 
    activeOpacity={0.7}
    onPress={() => {
      console.log("Navigating to Map for:", item.store);
      
      // 🚀 FIXED: Navigate to the Map screen (index) within the same tab group
      router.push({
        pathname: "/", // Refers to app/(tabs)/index.tsx
        params: { scrollToStore: item.store }
      });
    }}
    style={styles.productCard}
  >
      <View style={styles.cardLeft}>
        <View style={styles.iconCircle}>
          <Ionicons name={item.category === 'Health' ? "medkit" : "nutrition"} size={20} color={BRAND_COLOR} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.productTitle}>{item.name}</Text>
          <View style={styles.storeBadge}>
            <Ionicons name="location" size={12} color={BRAND_COLOR} />
            <Text style={{ color: BRAND_COLOR, fontWeight: 'bold' }}> {item.store} →</Text>
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
    <View style={styles.container}>
      {/* 🚀 FIXED: New Header + Filters Wrapper */}
      <View style={styles.headerWrapper}>
        <View style={styles.topBranding}>
          <Text style={styles.headerTitle}>Day-to-Day Necessities</Text>
          <Ionicons name="cart" size={24} color="white" />
        </View>

        <View style={styles.categoryBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 15 }}>
            {categories.map(cat => (
              <TouchableOpacity 
                key={cat} 
                onPress={() => setActiveTab(cat)} 
                style={[styles.catTab, activeTab === cat && styles.activeCatTab]}
              >
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
          <Slider 
            style={{ width: '100%', height: 40 }} 
            minimumValue={0} maximumValue={40} step={5} 
            value={maxPrice} onValueChange={setMaxPrice} 
            minimumTrackTintColor={BRAND_COLOR} thumbTintColor={BRAND_COLOR} 
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={BRAND_COLOR} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredAndSorted}
          renderItem={renderProduct}
          keyExtractor={(item, index) => item._id || index.toString()}
          contentContainerStyle={styles.scrollPadding}
          ListEmptyComponent={<Text style={styles.emptyText}>No items found in this budget.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerWrapper: {
    backgroundColor: '#fff',
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  // 🚀 Update these specific styles in essentials.tsx
topBranding: {
  backgroundColor: BRAND_COLOR,
  // 🚀 Standardized to match the Map page header height
  paddingTop: Platform.OS === 'ios' ? 60 : 40, 
  paddingBottom: 20, 
  paddingHorizontal: 20,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  // Gives it that solid "Header" feel
  height: Platform.OS === 'ios' ? 110 : 90, 
},
headerTitle: {
  color: 'white',
  fontSize: 20, // 🚀 Standard header font size
  fontWeight: '700',
},
  // ... keep the rest of your categoryBar, priceFilterContainer, and productCard styles
  categoryBar: { 
    backgroundColor: '#fff', 
    paddingVertical: 10, 
  },
  priceFilterContainer: { 
    padding: 20, 
    backgroundColor: '#fff' 
  },
  storeBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 4,
  },
  catTab: { paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, borderRadius: 20, backgroundColor: '#eee' },
  activeCatTab: { backgroundColor: BRAND_COLOR },
  catTabText: { color: '#666', fontWeight: '600' },
  activeCatTabText: { color: 'white' },
  priceHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  priceHeaderText: { fontSize: 14, color: '#666', fontWeight: '600' },
  priceValueText: { color: BRAND_COLOR, fontWeight: 'bold' },
  scrollPadding: { padding: 15, paddingBottom: 120 }, 
  productCard: { 
    backgroundColor: 'white', 
    borderRadius: 15, 
    padding: 16, 
    marginBottom: 12, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: LIGHT_PURPLE, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  productTitle: { fontSize: 16, fontWeight: '700' },
  productPrice: { fontSize: 18, fontWeight: 'bold' },
  freeText: { color: '#2ecc71' },
  emptyText: { marginTop: 15, fontSize: 16, color: 'gray', textAlign: 'center' },
  cardRight: { alignItems: 'flex-end', justifyContent: 'center' }
});