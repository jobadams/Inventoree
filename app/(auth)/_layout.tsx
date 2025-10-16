// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';
import { useAuth } from '../../contexts/auth-context';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function AuthLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // If logged in, skip auth and go to main tabs
      router.replace('/(tabs)');
    }
  }, [user, isLoading]);

  return (
    <Stack>
    

      {/* Auth screens */}
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
