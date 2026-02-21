// screens/ForumScreen.js
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockPosts } from '../data/mockData';
import ProfileMenu from '../components/ProfileMenu';
import { timeAgo } from '../utils/timeAgo';

export default function ForumScreen({ navigation, currentUser, route, onLogout }) {  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('all');
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  // Reload posts when returning from CreatePost screen
  useEffect(() => {
    if (route.params?.refresh) {
      loadPosts();
      // Clear the refresh param
      navigation.setParams({ refresh: false });
    }
  }, [route.params?.refresh]);

  const loadPosts = async () => {
    // Load posts from AsyncStorage (or use mock data for now)
    const savedPosts = await AsyncStorage.getItem('forumPosts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      // Use mock data initially
      setPosts(mockPosts);
      await AsyncStorage.setItem('forumPosts', JSON.stringify(mockPosts));
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      pregnancy: '#FF6B9D',
      newborn: '#4ECDC4',
      parenting: '#95E1D3',
      health: '#F38181',
      general: '#AA96DA',
    };
    return colors[category] || '#999';
  };

  const renderPost = ({ item }) => {
    const isMyPost = item.authorUsername === currentUser?.anonymousUsername;
    
    return (
      <TouchableOpacity
        style={[styles.postCard, isMyPost && styles.myPostCard]}
        onPress={() => navigation.navigate('PostDetail', { 
          post: item,
          currentUser: currentUser,
        })}
      >
        {isMyPost && (
          <View style={styles.myPostBadge}>
            <Text style={styles.myPostBadgeText}>Your Post</Text>
          </View>
        )}

        <View style={styles.postHeader}>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
            <Text style={styles.categoryText}>{item.category}</Text>
            </View>
            <Text style={styles.postTime}>{timeAgo(item.createdAt)}</Text>  {/* ← CHANGED */}
        </View>

        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postPreview} numberOfLines={2}>
          {item.content}
        </Text>

        <View style={styles.postFooter}>
          <Text style={[styles.postAuthor, isMyPost && styles.myPostAuthor]}>
            {item.authorUsername} {isMyPost && '(You)'}
          </Text>
          <View style={styles.statsContainer}>
            <Text style={styles.statText}>⬆️ {item.upvotes}</Text>
            <Text style={styles.statText}>💬 {item.replies.length}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Filter posts
  let filteredPosts = posts;
  
  // Filter by view mode (all vs my posts)
  if (viewMode === 'myPosts') {
    filteredPosts = posts.filter(p => p.authorUsername === currentUser?.anonymousUsername);
  }
  
  // Filter by category
  if (filter !== 'all') {
    filteredPosts = filteredPosts.filter(p => p.category === filter);
  }

  return (
    <View style={styles.container}>
    {/* Header */}
    <View style={styles.header}>
    <TouchableOpacity 
        style={styles.menuButton}
        onPress={() => setMenuVisible(true)}
    >
        <Text style={styles.menuButtonText}>☰</Text>
    </TouchableOpacity>
    <View style={styles.headerTextContainer}>
        <Text style={styles.headerTitle}>Community Forum</Text>
        <Text style={styles.headerSubtitle}>
        Welcome, {currentUser?.anonymousUsername || 'Guest'}
        </Text>
    </View>
    </View>

      {/* View Mode Toggle */}
      <View style={styles.viewModeContainer}>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'all' && styles.viewModeButtonActive]}
          onPress={() => setViewMode('all')}
        >
          <Text style={[styles.viewModeText, viewMode === 'all' && styles.viewModeTextActive]}>
            All Posts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'myPosts' && styles.viewModeButtonActive]}
          onPress={() => setViewMode('myPosts')}
        >
          <Text style={[styles.viewModeText, viewMode === 'myPosts' && styles.viewModeTextActive]}>
            My Posts
          </Text>
        </TouchableOpacity>
      </View>

      
      {/* Category Filters */}
    <View style={styles.filterWrapper}>
    <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
    >
        <TouchableOpacity
        style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
        onPress={() => setFilter('all')}
        >
        <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All
        </Text>
        </TouchableOpacity>
        <TouchableOpacity
        style={[styles.filterChip, filter === 'pregnancy' && styles.filterChipActive]}
        onPress={() => setFilter('pregnancy')}
        >
        <Text style={[styles.filterText, filter === 'pregnancy' && styles.filterTextActive]}>
            Pregnancy
        </Text>
        </TouchableOpacity>
        <TouchableOpacity
        style={[styles.filterChip, filter === 'newborn' && styles.filterChipActive]}
        onPress={() => setFilter('newborn')}
        >
        <Text style={[styles.filterText, filter === 'newborn' && styles.filterTextActive]}>
            Newborn
        </Text>
        </TouchableOpacity>
        <TouchableOpacity
        style={[styles.filterChip, filter === 'parenting' && styles.filterChipActive]}
        onPress={() => setFilter('parenting')}
        >
        <Text style={[styles.filterText, filter === 'parenting' && styles.filterTextActive]}>
            Parenting
        </Text>
        </TouchableOpacity>
        <TouchableOpacity
        style={[styles.filterChip, filter === 'health' && styles.filterChipActive]}
        onPress={() => setFilter('health')}
        >
        <Text style={[styles.filterText, filter === 'health' && styles.filterTextActive]}>
            Health
        </Text>
        </TouchableOpacity>
        <TouchableOpacity
        style={[styles.filterChip, filter === 'general' && styles.filterChipActive]}
        onPress={() => setFilter('general')}
        >
        <Text style={[styles.filterText, filter === 'general' && styles.filterTextActive]}>
            General
        </Text>
        </TouchableOpacity>
    </ScrollView>
    </View>
        

      {/* Posts List */}
      {filteredPosts.length > 0 ? (
        <FlatList
          data={filteredPosts}
          renderItem={renderPost}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.postsList}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📝</Text>
          <Text style={styles.emptyTitle}>
            {viewMode === 'myPosts' ? 'No posts yet' : 'No posts found'}
          </Text>
          <Text style={styles.emptyText}>
            {viewMode === 'myPosts' 
              ? 'Ask your first question to get started!' 
              : 'Try changing the category filter'}
          </Text>
        </View>
      )}

      {/* Create Post Button */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreatePost', { currentUser })}
      >
        <Text style={styles.createButtonText}>+ Ask Question</Text>
      </TouchableOpacity>

      {/* Profile Menu */}
        <ProfileMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        currentUser={currentUser}
        onLogout={onLogout}
        />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#3c6449',
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  viewModeContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: 8,
    backgroundColor: 'white',
    gap: 8,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  viewModeButtonActive: {
    backgroundColor: '#3c6449',
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  viewModeTextActive: {
    color: 'white',
  },
  filterWrapper: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  filterContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    minWidth: 70,
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: '#3c6449',
  },
  filterText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  postsList: {
    padding: 16,
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  myPostCard: {
    borderWidth: 2,
    borderColor: '#3c6449',
  },
  myPostBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#3c6449',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  myPostBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  postTime: {
    fontSize: 12,
    color: '#999',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  postPreview: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  postAuthor: {
    fontSize: 14,
    color: '#3c6449',
    fontWeight: '600',
  },
  myPostAuthor: {
    color: '#2e5438',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  createButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#3c6449',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
  backgroundColor: '#3c6449',
  padding: 20,
  paddingTop: 60,
  flexDirection: 'row',  // ← ADD THIS
  alignItems: 'center',  // ← ADD THIS
},
menuButton: {
  width: 40,
  height: 40,
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 12,
  borderRadius: 8,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
},
menuButtonText: {
  color: 'white',
  fontSize: 24,
  fontWeight: 'bold',
},
headerTextContainer: {
  flex: 1,
},
headerTitle: {
  fontSize: 28,
  fontWeight: 'bold',
  color: 'white',
},
headerSubtitle: {
  fontSize: 14,
  color: 'rgba(255,255,255,0.9)',
  marginTop: 4,
},
});