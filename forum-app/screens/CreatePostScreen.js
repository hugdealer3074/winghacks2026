// screens/CreatePostScreen.js
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CreatePostScreen({ navigation, route }) {
  const { currentUser } = route.params;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');

  const categories = [
    { id: 'pregnancy', label: 'Pregnancy', color: '#FF6B9D' },
    { id: 'newborn', label: 'Newborn', color: '#4ECDC4' },
    { id: 'parenting', label: 'Parenting', color: '#95E1D3' },
    { id: 'health', label: 'Health', color: '#F38181' },
    { id: 'general', label: 'General', color: '#AA96DA' },
  ];

const handlePost = async () => {
  if (!title.trim() || !content.trim()) {
    Alert.alert('Error', 'Please fill in both title and content');
    return;
  }

  try {
    // Create new post
    const newPost = {
      id: `post_${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      category: category,
      authorId: currentUser.id,
      authorUsername: currentUser.anonymousUsername,
      upvotes: 0,
      replies: [],
      createdAt: new Date().toISOString(), // ← CHANGED: Use ISO string
    };

    // ... rest of code stays the same

      // Get existing posts
      const postsJson = await AsyncStorage.getItem('forumPosts');
      const posts = postsJson ? JSON.parse(postsJson) : [];

      // Add new post to the beginning of the array
      const updatedPosts = [newPost, ...posts];

      // Save back to AsyncStorage
      await AsyncStorage.setItem('forumPosts', JSON.stringify(updatedPosts));

      // Show success and navigate back
      Alert.alert(
        'Success! 🎉',
        'Your question has been posted!',
        [{ 
          text: 'OK', 
          onPress: () => navigation.navigate('Forum', { refresh: true })
        }]
      );
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>Ask a Question</Text>
        <Text style={styles.subtitle}>
          Get support from our anonymous community
        </Text>

        {/* Category Selection */}
        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryContainer}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                category === cat.id && { backgroundColor: cat.color },
                category !== cat.id && { borderWidth: 1, borderColor: cat.color },
              ]}
              onPress={() => setCategory(cat.id)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  category === cat.id && styles.categoryChipTextActive,
                  category !== cat.id && { color: cat.color },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Title Input */}
        <Text style={styles.label}>Question Title</Text>
        <TextInput
          style={styles.titleInput}
          placeholder="e.g., Best diaper bags for new parents?"
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />
        <Text style={styles.charCount}>{title.length}/100</Text>

        {/* Content Input */}
        <Text style={styles.label}>Details</Text>
        <TextInput
          style={styles.contentInput}
          placeholder="Share more details about your question..."
          value={content}
          onChangeText={setContent}
          multiline
          maxLength={500}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{content.length}/500</Text>

        {/* Privacy Notice */}
        <View style={styles.privacyNotice}>
          <Text style={styles.privacyText}>
            🔒 Your post will show as: {currentUser?.anonymousUsername || 'Anonymous'}
          </Text>
        </View>

        {/* Post Button */}
        <TouchableOpacity
          style={[styles.postButton, (!title.trim() || !content.trim()) && styles.postButtonDisabled]}
          onPress={handlePost}
          disabled={!title.trim() || !content.trim()}
        >
          <Text style={styles.postButtonText}>Post Question</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: 'white',
  },
  titleInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  contentInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 150,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  privacyNotice: {
    backgroundColor: '#e8f5e9',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  privacyText: {
    fontSize: 14,
    color: '#2e7d32',
    textAlign: 'center',
  },
  postButton: {
    backgroundColor: '#3c6449',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  postButtonDisabled: {
    backgroundColor: '#ccc',
  },
  postButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});