import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../contexts/theme-context';
// const navTheme = theme === 'dark' ? DarkTheme : DefaultTheme;

//  <NavigationContainer theme={navTheme}>
//   {/* <RootStack /> */}
// </NavigationContainer> 



type Message = {
  id: string;
  sender: string;
  text?: string;
  images?: string[];
  time: string;
  date: string;
  isMe: boolean;
  avatar: string;
};

const { colors } = useTheme();

<View style={{ backgroundColor: colors.background }}>
  <Text style={{ color: colors.text }}>Hello</Text>
</View>


const ChatScreen = () => {
  const [currentUser, setCurrentUser] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const flatListRef = useRef<FlatList>(null);

  // 🟢 Load user and messages
  useEffect(() => {
    const fetchData = async () => {
      try {
        const name = await AsyncStorage.getItem('currentUserName');
        if (name) setCurrentUser(name);

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

  // 🟢 Scroll to bottom when new message appears
  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // 🟢 Save messages to AsyncStorage
  const saveMessages = async (msgs: Message[]) => {
    try {
      await AsyncStorage.setItem('chatMessages', JSON.stringify(msgs));
    } catch (error) {
      console.log('Error saving messages:', error);
    }
  };

  // 🟢 SEND MESSAGE
  const sendMessage = async () => {
    if ((!input.trim() && selectedImages.length === 0) || !currentUser) return;

    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = now.toDateString();

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: currentUser,
      text: input.trim() || undefined,
      images: selectedImages.length > 0 ? [...selectedImages] : undefined,
      time,
      date,
      isMe: true,
      avatar: 'https://randomuser.me/api/portraits/men/33.jpg',
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    await saveMessages(updatedMessages); // persist chat

    setInput('');
    setSelectedImages([]);
  };

  // 🟡 PICK MULTIPLE IMAGES
  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission denied', 'We need access to your photos to send images.');
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
      <View style={[styles.bubble, item.isMe ? styles.myBubble : styles.theirBubble]}>
        <Text style={[styles.sender, item.isMe && styles.mySender]}>
          {item.sender}
        </Text>

        {item.text && (
          <Text style={[styles.messageText, item.isMe && styles.myMessageText]}>
            {item.text}
          </Text>
        )}

        {item.images &&
          item.images.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.sentImage} />
          ))}

        <Text style={styles.timestamp}>{item.time}</Text>
      </View>
      {item.isMe && <Image source={{ uri: item.avatar }} style={styles.avatar} />}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />

      {/* Preview selected images before sending */}
      {selectedImages.length > 0 && (
        <View style={styles.imagePreviewContainer}>
          <FlatList
            horizontal
            data={selectedImages}
            keyExtractor={(uri, idx) => idx.toString()}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.previewImage} />
            )}
          />
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={pickImages}>
            <Ionicons name="image-outline" size={26} color="#2563eb" />
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            value={input}
            onChangeText={setInput}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (input.trim() || selectedImages.length > 0) && styles.sendButtonActive,
            ]}
            onPress={sendMessage}
            disabled={!input.trim() && selectedImages.length === 0}
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
  container: { flex: 1, backgroundColor: '#f9fafb' },
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
  theirBubble: {
    backgroundColor: '#e0f2fe',
    borderTopLeftRadius: 0,
  },
  myBubble: {
    backgroundColor: '#2563eb',
    borderTopRightRadius: 0,
  },
  sender: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 4,
  },
  mySender: {
    color: '#e0f2fe',
    textAlign: 'right',
  },
  messageText: {
    fontSize: 15,
    color: '#111827',
  },
  myMessageText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'right',
  },
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
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
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
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
  },
  sendButton: {
    backgroundColor: '#9ca3af',
    padding: 10,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#2563eb',
  },
});
