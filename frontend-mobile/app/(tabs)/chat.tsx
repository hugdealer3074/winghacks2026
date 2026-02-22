import { useMemo, useState } from "react";
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
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { BackgroundBlobs } from "../../components/BackgroundBlobs";
import { COLORS, SPACING, RADIUS, SHADOW } from "../../theme";

// IMPORTANT: Your bottom glass tab bar floats on top of screens.
// This spacing keeps your input dock from being covered by it.
const TAB_BAR_SPACE = Platform.OS === "ios" ? 120 : 110;

type Msg = { id: string; text: string; isUser: boolean };

export default function ChatScreen() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "1",
      text:
        "Hi there! 👋 I’m Ruma — your calm, supportive AI buddy for new parents.\n\nAsk me anything about pregnancy, newborn care, or parenting. I’ll keep things practical, kind, and non-judgmental.",
      isUser: false,
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  // One consistent “systemInstruction” so it always feels like one unified persona
  const systemInstruction = useMemo(
    () =>
      "You are Ruma, a warm, knowledgeable assistant for new parents and pregnant women. Provide practical, supportive advice about pregnancy, newborn care, and parenting. Be encouraging and non-judgmental. For medical questions, always remind users to consult their healthcare provider. Keep responses concise, friendly, and easy to scan with short paragraphs/bullets when helpful.",
    []
  );

  const callGemini = async (prompt: string) => {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_KEY;
    if (!apiKey) throw new Error("API key not found");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-pro-latest",
      systemInstruction,
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Msg = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);

    const currentInput = inputText;
    setInputText("");
    setLoading(true);

    try {
      const aiText = await callGemini(currentInput);

      const aiMessage: Msg = {
        id: (Date.now() + 1).toString(),
        text: aiText,
        isUser: false,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Msg = {
        id: (Date.now() + 1).toString(),
        text:
          "I’m sorry — something went wrong.\n\nPlease try again, and make sure your EXPO_PUBLIC_GEMINI_KEY is set correctly.",
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const sendQuickPrompt = (question: string) => {
    const userMessage: Msg = {
      id: Date.now().toString(),
      text: question,
      isUser: true,
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    (async () => {
      try {
        const aiText = await callGemini(question);

        const aiMessage: Msg = {
          id: (Date.now() + 1).toString(),
          text: aiText,
          isUser: false,
        };
        setMessages((prev) => [...prev, aiMessage]);
      } catch (error) {
        console.error("Error:", error);
        const errorMessage: Msg = {
          id: (Date.now() + 1).toString(),
          text: "I’m sorry — something went wrong. Please try again.",
          isUser: false,
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setLoading(false);
      }
    })();
  };

  const renderMessage = ({ item }: { item: Msg }) => {
    if (item.isUser) {
      return (
        <View style={[styles.bubbleBase, styles.userBubble]}>
          <LinearGradient
            colors={["rgba(160,131,249,0.95)", "rgba(90,31,193,0.92)"]}
            start={{ x: 0.1, y: 0.2 }}
            end={{ x: 0.9, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={[styles.messageText, styles.userText]}>{item.text}</Text>
        </View>
      );
    }

    return (
      <View style={[styles.bubbleBase, styles.aiBubble]}>
        <BlurView intensity={22} tint="light" style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={[
            "rgba(255,255,255,0.72)",
            "rgba(222,210,255,0.22)",
            "rgba(167,199,161,0.14)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      {/* Soft flowing background */}
      <BackgroundBlobs />

      {/* Header */}
      <View style={styles.headerWrap}>
        <BlurView intensity={22} tint="light" style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={["rgba(160,131,249,0.22)", "rgba(167,199,161,0.10)", "rgba(255,251,249,0.40)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <Text style={styles.headerTitle}>Ruma</Text>
        <Text style={styles.headerSubtitle}>Calm, practical support for new parents</Text>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={COLORS.lavenderDeep ?? "#5A1FC1"} />
          <Text style={styles.loadingText}>Ruma is thinking…</Text>
        </View>
      )}

      {/* Input Dock */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        style={{ width: "100%" }}
      >
        <View style={styles.dockWrap}>
          <View style={styles.dockGlass}>
            <BlurView intensity={26} tint="light" style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={[
                "rgba(160,131,249,0.18)",
                "rgba(167,199,161,0.12)",
                "rgba(255,255,255,0.20)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            {/* Quick prompts */}
            <View style={styles.quickPromptsHeaderRow}>
              <Text style={styles.quickPromptsTitle}>Quick questions</Text>
              <Text style={styles.quickPromptsHint}>tap one to ask</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickPromptsScroll}
            >
              <TouchableOpacity
                style={styles.quickChip}
                onPress={() => sendQuickPrompt("What should I pack in a diaper bag?")}
              >
                <Text style={styles.quickChipText}>💼 Diaper Bag</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickChip}
                onPress={() => sendQuickPrompt("How often should a newborn eat?")}
              >
                <Text style={styles.quickChipText}>🍼 Feeding</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickChip}
                onPress={() => sendQuickPrompt("Tips for breastfeeding?")}
              >
                <Text style={styles.quickChipText}>👶 Breastfeeding</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickChip}
                onPress={() => sendQuickPrompt("How to soothe a crying baby?")}
              >
                <Text style={styles.quickChipText}>😢 Crying</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Input row */}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask Ruma anything…"
                placeholderTextColor={COLORS.textMuted}
                multiline
              />

              <TouchableOpacity
                style={[styles.sendButton, (loading || !inputText.trim()) && { opacity: 0.5 }]}
                onPress={sendMessage}
                disabled={loading || !inputText.trim()}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Bottom spacer so dock + content don’t collide with your floating tab bar */}
        <View style={{ height: TAB_BAR_SPACE }} />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  headerWrap: {
    paddingTop: Platform.OS === "ios" ? 60 : 42,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.45)",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.text,
  },
  headerSubtitle: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textMuted,
  },

  messagesList: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    gap: 10,
  },

  bubbleBase: {
    maxWidth: "84%",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
  },

  userBubble: {
    alignSelf: "flex-end",
    borderTopRightRadius: 10,
    ...SHADOW.soft,
  },

  aiBubble: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
    ...SHADOW.soft,
  },

  messageText: {
    fontSize: 15,
    lineHeight: 21,
    color: COLORS.text,
    fontWeight: "500",
  },
  userText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 10,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontWeight: "600",
  },

  dockWrap: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },

  dockGlass: {
    borderRadius: RADIUS.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    ...SHADOW.soft,
  },

  quickPromptsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  quickPromptsTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.text,
  },
  quickPromptsHint: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
  },

  quickPromptsScroll: {
    paddingHorizontal: 2,
    paddingBottom: 12,
    gap: 10,
  },

  quickChip: {
    backgroundColor: "rgba(255,255,255,0.60)",
    borderWidth: 1,
    borderColor: "rgba(34,34,34,0.10)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  quickChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },

  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 1,
    borderColor: "rgba(34,34,34,0.10)",
    fontSize: 16,
    color: COLORS.text,
  },

  sendButton: {
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 14,
    overflow: "hidden",
    backgroundColor: COLORS.lavenderDeep ?? "#5A1FC1",
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
});