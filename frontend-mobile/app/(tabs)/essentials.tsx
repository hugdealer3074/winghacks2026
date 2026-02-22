import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = "http://YOUR_IP_HERE:8000"; // Use same IP as map

export default function EssentialsScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxPrice, setMaxPrice] = useState(40);

  useEffect(() => {
    axios.get(`${BACKEND_URL}/products`, { timeout: 30000 })
      .then(res => { 
        setProducts(res.data); 
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter(p => p.price <= maxPrice);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Essentials</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Necessities Under ${maxPrice}</Text>
        
        {loading ? (
          <Text style={styles.loading}>Loading...</Text>
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.productCard}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productStore}>{item.store}</Text>
                <Text style={styles.productPrice}>${item.price}</Text>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#8B5CF6', padding: 20, paddingTop: 60, alignItems: 'center' },
  headerText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  content: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  loading: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 40 },
  productCard: { 
    backgroundColor: 'white', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productName: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  productStore: { fontSize: 14, color: '#666', marginBottom: 8 },
  productPrice: { fontSize: 20, color: '#8B5CF6', fontWeight: 'bold' },
});