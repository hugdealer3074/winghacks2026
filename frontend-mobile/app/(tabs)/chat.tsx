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

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    { 
      id: '1', 
      text: 'Hi there! 👋 I\'m your AI assistant for new parents. Ask me anything about pregnancy, newborn care, or parenting!', 
      isUser: false 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
    };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setLoading(true);

    try {
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_KEY;
      
      if (!apiKey) {
        throw new Error('API key not found');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-pro-latest',
        systemInstruction: 'You are a warm, knowledgeable assistant for new parents and pregnant women. Provide practical, supportive advice about pregnancy, newborn care, and parenting. Be encouraging and non-judgmental. For medical questions, always remind users to consult their healthcare provider.'
      });

      const result = await model.generateContent(currentInput);
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
        text: 'Sorry, something went wrong. Please try again or check your API key.',
        isUser: false,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const sendQuickPrompt = (question: string) => {
    const userMessage = {
      id: Date.now().toString(),
      text: question,
      isUser: true,
    };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    (async () => {
      try {
        const apiKey = process.env.EXPO_PUBLIC_GEMINI_KEY;
        
        if (!apiKey) {
          throw new Error('API key not found');
        }

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

  const renderMessage = ({ item }: any) => (
    <View
      style={[
        styles.messageBubble,
        item.isUser ? styles.userBubble : styles.aiBubble,
      ]}
    >
      <Text style={[
        styles.messageText,
        item.isUser && { color: 'white' }
      ]}>
        {item.text}
      </Text>
    </View>
  );

  return (
  <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.headerText}>Parent AI Assistant</Text>
    </View>

    <FlatList
      data={messages}
      renderItem={renderMessage}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.messagesList}
      style={{ flex: 1 }}
    />

    {loading && (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#8B5CF6" />
        <Text style={styles.loadingText}>AI is thinking...</Text>
      </View>
    )}

    <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? -40 : 0}
    style={{ width: '100%' }}
    >
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
        </ScrollView>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your question..."
          multiline
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
    backgroundColor: '#8B5CF6',
    alignSelf: 'flex-end',
  },
  aiBubble: {
    backgroundColor: '#E5E5EA',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
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
  quickPromptsContainer: {
    backgroundColor: 'white',
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    maxHeight: 80,
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
    inputContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16, // Add extra padding for iOS
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 70 : 65, // Space for tab bar
    },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    minHeight: 50,
    maxHeight: 120,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 16,
    justifyContent: 'center',
    minWidth: 70,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});