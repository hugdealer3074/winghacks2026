import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default function App() {
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hi there! I\'m your AI assistant for new parents and expecting families. Ask me anything about pregnancy, newborn care, or parenting - I\'m here to help 24/7! Try the quick questions below or type your own. 💚', isUser: false }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      // Get API key
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_KEY;
      console.log('🔑 API Key loaded:', apiKey)

      // Initialize Gemini
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-pro-latest',
        systemInstruction: 'You are a warm, knowledgeable assistant for new parents and pregnant women. Provide practical, supportive advice about pregnancy, newborn care, and parenting. Be encouraging and non-judmental. For medical questions, always remind users to consult their healthcare provider.'
      });

      // Send message to AI
      const result = await model.generateContent(inputText);
      const response = await result.response;
      const aiText = response.text();

      // Add AI response
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: aiText,
        isUser: false,
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, something went wrong. Please try again.',
        isUser: false,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const sendQuickPrompt = (question) => {
    // Add user message to chat
    const userMessage = {
      id: Date.now().toString(),
      text: question,
      isUser: true,
    };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    // Send to AI immediately
    (async () => {
      try {
        const apiKey = process.env.EXPO_PUBLIC_GEMINI_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-pro-latest',
          systemInstruction: 'You are a warm, knowledgeable assistant for new parents and pregnant women. Provide practical, supportive advice about pregnancy, newborn care, and parenting. Be encouraging and non-judgmental. For medical questions, always remind users to consult their healthcare provider.'
        });

        const result = await model.generateContent(question);
        const response = await result.response;
        const aiText = response.text();

        const aiMessage = {
          id: (Date.now() + 1).toString(),
          text: aiText,
          isUser: false,
        };
        setMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        console.error('Error:', error);
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          text: 'Sorry, something went wrong. Please try again.',
          isUser: false,
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setLoading(false);
      }
    })();
  };

 

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.isUser ? styles.userBubble : styles.aiBubble,
      ]}
    >
      <Text style={[
        styles.messageText,
        item.isUser ? styles.userText : styles.aiText
      ]}>
        {item.text}
      </Text>
    </View>
  );

  return (
  <KeyboardAvoidingView
    style={styles.container}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
  >
    {/* 1. Header at TOP */}
    <View style={styles.header}>
      <Text style={styles.headerText}>Parent AI Assistant</Text>
    </View>

    {/* 2. Messages in the MIDDLE (should grow to fill space) */}
    <FlatList
      data={messages}
      renderItem={renderMessage}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.messagesList}
      style={{ flex: 1 }} // ← ADD THIS! Makes it take available space
    />

    {/* 3. Loading indicator */}
    {loading && (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingText}>AI is thinking...</Text>
      </View>
    )}

    {/* 4. Quick Prompts ABOVE input */}
    <View style={styles.quickPromptsContainer}>
      <Text style={styles.quickPromptsTitle}>Quick questions:</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickPromptsScroll}
      >
        <TouchableOpacity 
          style={styles.quickPromptButton}
          onPress={() => sendQuickPrompt('What should I pack in a diaper bag?')}
        >
          <Text style={styles.quickPromptText}>💼 Diaper Bag</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickPromptButton}
          onPress={() => sendQuickPrompt('How often should a newborn eat?')}
        >
          <Text style={styles.quickPromptText}>🍼 Feeding</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickPromptButton}
          onPress={() => sendQuickPrompt('Tips for breastfeeding?')}
        >
          <Text style={styles.quickPromptText}>👶 Breastfeeding</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.quickPromptButton}
          onPress={() => sendQuickPrompt('How to soothe a crying baby?')}
        >
          <Text style={styles.quickPromptText}>😢 Crying</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.quickPromptButton}
          onPress={() => sendQuickPrompt('Safe sleep for babies')}
        >
          <Text style={styles.quickPromptText}>😴 Sleep</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.quickPromptButton}
          onPress={() => sendQuickPrompt('When to call the doctor?')}
        >
          <Text style={styles.quickPromptText}>🏥 Doctor</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>

    {/* 5. Input Box at BOTTOM */}
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        value={inputText}
        onChangeText={setInputText}
        placeholder="Type your question..."
        multiline
        maxLength={500}
      />
      <TouchableOpacity
        style={styles.sendButton}
        onPress={sendMessage}
        disabled={loading || !inputText.trim()}
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
  header: {
    backgroundColor: '#3c6449',
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  messagesList: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    backgroundColor: '#3c6449',
    alignSelf: 'flex-end',
  },
  aiBubble: {
    backgroundColor: '#E5E5EA',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  userText: {
    color: 'white',
  },
  aiText: {
    color: '#000',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'white',
  },
  loadingText: {
    marginLeft: 10,
    color: '#666',
  },
  
  // Quick Prompts Styles
  quickPromptsContainer: {
    backgroundColor: 'white',
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    maxHeight: 80, // ← LIMIT HEIGHT so it doesn't take over
  },
  quickPromptsTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    marginLeft: 16,
    fontWeight: '600',
  },
  quickPromptsScroll: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  quickPromptButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  quickPromptText: {
    fontSize: 14,
    color: '#333',
  },
  
  // Input Container Styles
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'center',
    paddingBottom: 30,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12, // ← INCREASE from 8 to 12 (or more)
    marginRight: 8,
    minHeight: 50, // ← ADD THIS: Minimum height of 50px
    maxHeight: 120, // ← INCREASE from 100 to 120 (allows more lines)
    backgroundColor: '#f9f9f9',
    fontSize: 16, // ← INCREASE text size if you want
  },
  sendButton: {
    backgroundColor: '#3c6449',
    borderRadius: 20,
    paddingHorizontal: 24, // ← INCREASE from 20 to 24
    paddingVertical: 16, // ← INCREASE from 12 to 16
    justifyContent: 'center',
    minWidth: 70, // ← ADD THIS: Ensures button isn't too narrow
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16, // ← Make text bigger too
  },
});