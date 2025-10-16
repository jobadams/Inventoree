import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../contexts/auth-context';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
// import WelcomeScreen from '../(tabs)/index1';

// Required for Expo web-browser to handle auth redirect
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // ✅ Google Auth config
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // Replace with your Google Web Client ID
    iosClientId: '508151158727-hc5da90j6t0f47ri4glbtq8nvbjr6ld1.apps.googleusercontent.com', // Optional
    androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com', // Optional
  });

  const handleGoogleLogin = async () => {
    try {
      const result = await promptAsync();
      if (result?.type === 'success') {
        const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
          headers: { Authorization: `Bearer ${result.authentication.accessToken}` },
        });
        const user = await userInfoResponse.json();

        // ✅ Save name & email for chat + app context
        await AsyncStorage.setItem('currentUserName', user.name || 'User');
        await AsyncStorage.setItem('currentUserEmail', user.email);

        Alert.alert('Success', `Welcome ${user.name}!`);
      } else {
        Alert.alert('Login Cancelled', 'Google sign-in was cancelled.');
      }
    } catch (error) {
      console.error('Google login error:', error);
      Alert.alert('Error', 'Failed to sign in with Google.');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await login({ email, password });
    setLoading(false);

    if (!result.success) {
      Alert.alert('Login Failed', result.error || 'Please try again');
      return;
    }

    try {
      // ✅ Store user data for chat use
      if (result.user) {
        const userName = result.user.name || result.user.fullName || result.user.username || 'User';
        await AsyncStorage.setItem('currentUserName', userName);
        await AsyncStorage.setItem('currentUserEmail', result.user.email);
      } else {
        console.warn('⚠️ No user data returned from login response');
      }
    } catch (error) {
      console.error('Error saving user info to AsyncStorage:', error);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image 
            source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/xkxizm9mfmvaa5712c7vh' }}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Welcome to Inventoree</Text>
          <Text style={styles.subtitle}>Sign in to manage your inventory</Text>
        </View>

        <Card style={styles.card}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Enter your email"
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            showPasswordToggle
            placeholder="Enter your password"
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/(auth)/signup" style={styles.link}>
            <Text style={styles.linkText}>Sign up</Text>
          </Link>
        </View>

        {/* Divider and Google login */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleLogin}
          disabled={!request}
        >
          <Image
            source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png' }}
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 120, height: 120, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#2563eb', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748b', textAlign: 'center' },
  card: { marginBottom: 20 },
  loginButton: { marginTop: 8 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  footerText: { fontSize: 16, color: '#64748b' },
  link: { marginLeft: 4 },
  linkText: { fontSize: 16, color: '#2563eb', fontWeight: '600' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  divider: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  orText: { marginHorizontal: 10, color: '#64748b', fontWeight: '500' },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 12,
    borderRadius: 8,
  },
  googleIcon: { width: 90, height: 30, marginRight: 10 },
  googleButtonText: { fontSize: 16, color: '#374151', fontWeight: '500' },
});
