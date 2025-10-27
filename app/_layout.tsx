import { Stack } from 'expo-router';
import { ThemeProvider } from '../contexts/theme-context';
import { AuthProvider } from '../contexts/auth-context';
import { InventoryProvider } from '../contexts/inventory-context';
import { ChatProvider } from '../contexts/chat-context';


export default function RootLayout() {
  return (
    <AuthProvider>
      <InventoryProvider>
        <ChatProvider>
          <ThemeProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </ThemeProvider>
        </ChatProvider>
      </InventoryProvider>
    </AuthProvider>
  );
}
