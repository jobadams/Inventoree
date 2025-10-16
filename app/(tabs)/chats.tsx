import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../contexts/theme-context'; // ✅ Import theme

type Message = {
  id: string;
  sender: string;
  text?: string;
  images?: string[];
  time: string;
  date: string;
  isMe: boolean;
  avatar: string;
  email?: string;
};

const ChatScreen = () => {
  const { colors } = useTheme(); // ✅ Access theme colors
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const flatListRef = useRef<FlatList>(null);

  // ✅ Load user and messages
  useEffect(() => {
    const fetchData = async () => {
      try {
        const name = await AsyncStorage.getItem('currentUserName');
        const email = await AsyncStorage.getItem('currentUserEmail');
        if (name) setCurrentUser(name);
        if (email) setCurrentUserEmail(email);

        const savedMessages = await AsyncStorage.getItem('chatMessages');
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages));
        }
      } catch (error) {
        console.log('Error loading data:', error);
      }
    };
    fetchData();
  }, []);

  // ✅ Auto scroll when new message appears
  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // ✅ Save messages persistently
  const saveMessages = async (msgs: Message[]) => {
    try {
      await AsyncStorage.setItem('chatMessages', JSON.stringify(msgs));
    } catch (error) {
      console.log('Error saving messages:', error);
    }
  };

  // ✅ Send message (checks for name & email)
  const sendMessage = async () => {
    if (!input.trim() && selectedImages.length === 0) return;

    const name = currentUser || (await AsyncStorage.getItem('currentUserName'));
    const email = currentUserEmail || (await AsyncStorage.getItem('currentUserEmail'));

    if (!name || !email) {
      Alert.alert('Please sign in first', 'We need your name and email before sending messages.');
      return;
    }

    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = now.toDateString();

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: name,
      text: input.trim() || undefined,
      images: selectedImages.length > 0 ? [...selectedImages] : undefined,
      time,
      date,
      isMe: true,
      avatar: 'https://randomuser.me/api/portraits/men/33.jpg',
      email,
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    await saveMessages(updatedMessages);

    setInput('');
    setSelectedImages([]);
  };

  // ✅ Pick multiple images
  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'We need access to your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const newUris = result.assets.map((asset) => asset.uri);
      setSelectedImages((prev) => [...prev, ...newUris]);
    }
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.isMe && styles.myMessageContainer]}>
      {!item.isMe && <Image source={{ uri: item.avatar }} style={styles.avatar} />}

      <View
        style={[
          styles.bubble,
          item.isMe
            ? { backgroundColor: colors.primary, borderTopRightRadius: 0 }
            : { backgroundColor: colors.surface, borderTopLeftRadius: 0 },
        ]}
      >
        <Text style={[styles.sender, { color: item.isMe ? colors.onPrimary : colors.textSecondary }]}>
          {item.sender}
        </Text>

        {item.text && (
          <Text style={[styles.messageText, { color: item.isMe ? colors.onPrimary : colors.text }]}>
            {item.text}
          </Text>
        )}

        {item.images &&
          item.images.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.sentImage} />
          ))}

        <Text style={[styles.timestamp, { color: colors.textSecondary }]}>{item.time}</Text>
      </View>

      {item.isMe && <Image source={{ uri: item.avatar }} style={styles.avatar} />}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />

      {/* ✅ Image Preview before sending */}
      {selectedImages.length > 0 && (
        <View
          style={[
            styles.imagePreviewContainer,
            { backgroundColor: colors.surface, borderTopColor: colors.border },
          ]}
        >
          <FlatList
            horizontal
            data={selectedImages}
            keyExtractor={(uri, idx) => idx.toString()}
            renderItem={({ item }) => <Image source={{ uri: item }} style={styles.previewImage} />}
          />
        </View>
      )}

      {/* ✅ Input + Send Section */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: colors.surface, borderTopColor: colors.border },
          ]}
        >
          <TouchableOpacity onPress={pickImages}>
            <Ionicons name="image-outline" size={26} color={colors.primary} />
          </TouchableOpacity>

          <TextInput
            style={[
              styles.textInput,
              { borderColor: colors.border, color: colors.text, backgroundColor: colors.background },
            ]}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            value={input}
            onChangeText={setInput}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (input.trim() || selectedImages.length > 0)
                ? { backgroundColor: colors.primary }
                : { backgroundColor: colors.disabled },
            ]}
            onPress={sendMessage}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 6,
  },
  myMessageContainer: {
    flexDirection: 'row-reverse',
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '75%',
  },
  sender: { fontSize: 12, marginBottom: 4 },
  messageText: { fontSize: 15 },
  timestamp: { fontSize: 10, marginTop: 4, textAlign: 'right' },
  sentImage: {
    width: 180,
    height: 180,
    borderRadius: 10,
    marginTop: 6,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 6,
  },
  imagePreviewContainer: {
    paddingVertical: 6,
    paddingLeft: 12,
    borderTopWidth: 1,
  },
  previewImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
  },
  sendButton: {
    padding: 10,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
