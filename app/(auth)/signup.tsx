import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../contexts/auth-context';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  
  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await signup({ name, email, password });
    setLoading(false);

    if (!result.success) {
      Alert.alert('Signup Failed', result.error || 'Please try again');
      return;
    }

    try {
      // ✅ Store user data for chat use
      await AsyncStorage.setItem('currentUserName', name);
      await AsyncStorage.setItem('currentUserEmail', email);
      console.log('✅ User info saved for chat after signup:', name);
    } catch (error) {
      console.error('Error saving user info:', error);
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Inventoree to start managing your inventory</Text>
        </View>

        <Card style={styles.card}>
          <Input
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
          />

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

          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            showPasswordToggle
            placeholder="Confirm your password"
          />

          <Button
            title="Create Account"
            onPress={handleSignup}
            loading={loading}
            style={styles.signupButton}
          />
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" style={styles.link}>
            <Text style={styles.linkText}>Sign in</Text>
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
  signupButton: {
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
