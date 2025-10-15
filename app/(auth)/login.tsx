import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../contexts/auth-context';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

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
      // ✅ Store the user's name and email so ChatScreen can use it
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  card: {
    marginBottom: 20,
  },
  loginButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#64748b',
  },
  link: {
    marginLeft: 4,
  },
  linkText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
});
