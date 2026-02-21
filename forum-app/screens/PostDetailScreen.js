// screens/PostDetailScreen.js
import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { timeAgo } from '../utils/timeAgo';

export default function PostDetailScreen({ route, navigation }) {
  const { post } = route.params;
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState(post.replies);

  const handleAddReply = () => {
    if (!replyText.trim()) return;

    const newReply = {
      id: `r${Date.now()}`,
      content: replyText,
      authorUsername: 'HappyPanda42', // Mock current user
      createdAt: new Date().toISOString(),
    };

    setReplies([...replies, newReply]);
    setReplyText('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.content}>
        {/* Original Post */}
        <View style={styles.postCard}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{post.category}</Text>
          </View>
          
          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postContent}>{post.content}</Text>
          
          <View style={styles.postMeta}>
            <Text style={styles.author}>{post.authorUsername}</Text>
            <Text style={styles.time}>{timeAgo(post.createdAt)}</Text>
          </View>

          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.upvoteButton}>
              <Text style={styles.upvoteText}>⬆️ {post.upvotes} Upvotes</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Replies */}
        <View style={styles.repliesSection}>
          <Text style={styles.repliesTitle}>{replies.length} Replies</Text>
          
          {replies.map(reply => (
            <View key={reply.id} style={styles.replyCard}>
              <Text style={styles.replyContent}>{reply.content}</Text>
              <View style={styles.replyMeta}>
                <Text style={styles.replyAuthor}>{reply.authorUsername}</Text>
                <Text style={styles.replyTime}>{timeAgo(reply.createdAt)}</Text>              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Reply Input */}
      <View style={styles.replyInputContainer}>
        <TextInput
          style={styles.replyInput}
          placeholder="Write a reply..."
          value={replyText}
          onChangeText={setReplyText}
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleAddReply}
          disabled={!replyText.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  postCard: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#3c6449',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  postTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  postContent: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  author: {
    fontSize: 14,
    color: '#3c6449',
    fontWeight: '600',
  },
  time: {
    fontSize: 14,
    color: '#999',
  },
  statsRow: {
    marginTop: 12,
  },
  upvoteButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  upvoteText: {
    fontSize: 14,
    color: '#666',
  },
  repliesSection: {
    backgroundColor: 'white',
    padding: 20,
  },
  repliesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  replyCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  replyContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 8,
  },
  replyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  replyAuthor: {
    fontSize: 13,
    color: '#3c6449',
    fontWeight: '600',
  },
  replyTime: {
    fontSize: 13,
    color: '#999',
  },
  replyInputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'center',
  },
  replyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    maxHeight: 100,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    backgroundColor: '#3c6449',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});