import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { timeAgo } from '../../utils/timeAgo';

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
    id: '1',
    title: 'Best diaper bags for new parents?',
    content: 'Looking for recommendations on diaper bags that are actually practical.',
    category: 'parenting',
    authorUsername: 'HappyPanda42',
    upvotes: 15,
    replies: [],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'When should I call the doctor about fever?',
    content: 'My 3-month-old has a temp of 100.5. Is this urgent?',
    category: 'health',
    authorUsername: 'CalmButterfly23',
    upvotes: 8,
    replies: [],
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'Feeling overwhelmed as a first-time mom',
    content: 'Is it normal to feel like I have no idea what I\'m doing?',
    category: 'general',
    authorUsername: 'TiredDolphin91',
    upvotes: 23,
    replies: [],
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
];

export default function ForumScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('all');

  const loadPosts = async () => {
    const savedPosts = await AsyncStorage.getItem('forumPosts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      setPosts(mockPosts);
      await AsyncStorage.setItem('forumPosts', JSON.stringify(mockPosts));
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // Reload posts when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [])
  );

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      pregnancy: '#FF6B9D',
      newborn: '#4ECDC4',
      parenting: '#95E1D3',
      health: '#F38181',
      general: '#AA96DA',
    };
    return colors[category] || '#999';
  };

  const renderPost = ({ item }: { item: ForumPost }) => {
    const isMyPost = item.authorUsername === user?.anonymousUsername;
    
    return (
      <TouchableOpacity
        style={[styles.postCard, isMyPost && styles.myPostCard]}
        onPress={() => router.push({
          pathname: '/forum/post',
          params: { postId: item.id }
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
          <Text style={styles.postTime}>{timeAgo(item.createdAt)}</Text>
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

  let filteredPosts = posts;
  
  if (viewMode === 'myPosts') {
    filteredPosts = posts.filter(p => p.authorUsername === user?.anonymousUsername);
  }
  
  if (filter !== 'all') {
    filteredPosts = filteredPosts.filter(p => p.category === filter);
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Community Forum</Text>
          <Text style={styles.headerSubtitle}>
            Welcome, {user?.anonymousUsername || 'Guest'}
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
          {['all', 'pregnancy', 'newborn', 'parenting', 'health', 'general'].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.filterChip, filter === cat && styles.filterChipActive]}
              onPress={() => setFilter(cat)}
            >
              <Text style={[styles.filterText, filter === cat && styles.filterTextActive]}>
                {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
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
      {user && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/forum/create')}
        >
          <Text style={styles.createButtonText}>+ Ask Question</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#8B5CF6',
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: '#8B5CF6',
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
    backgroundColor: '#8B5CF6',
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
    paddingBottom: 100,
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
    borderWidth: 3,
    borderColor: '#8B5CF6',
    backgroundColor: '#F5F3FF',
  },
  myPostBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#8B5CF6',
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
    color: '#8B5CF6',
    fontWeight: '600',
  },
  myPostAuthor: {
    color: '#7C3AED',
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
    bottom: 90,
    right: 20,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 100,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});