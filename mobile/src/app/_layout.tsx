import { Stack, useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner-native';
import '../../global.css';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { ConnectivityProvider, useConnectivity } from '@/context/ConnectivityContext';

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isAuthenticated, loading } = useAuth();
  const { isOffline } = useConnectivity();
  const router = useRouter();
  const navigationDone = useRef(false);

  useEffect(() => {
    if (loading || navigationDone.current) return;

    try {
      if (isAuthenticated || isOffline) {
        navigationDone.current = true;
        router.replace('/(tabs)/newList');
      } else {
        navigationDone.current = true;
        router.replace('/login');
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }, [isAuthenticated, isOffline, loading, router]);

  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen
        name="list/[id]"
        options={{
          title: 'Lista de Compras',
          headerBackButtonMenuEnabled: false,
          headerBackButtonDisplayMode: 'minimal',
          headerTintColor: "#000000",
          headerStyle: { backgroundColor: '#F6F6F6' },
        }}
      />
      <Stack.Screen
        name="report/[id]"
        options={{
          title: 'Relatório da Lista',
          headerBackVisible: false,
          headerStyle: { backgroundColor: '#F6F6F6' },
          headerTintColor: "#000000",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.replace('/(tabs)/history')}
              className='w-10 h-10 justify-center items-center'>
              <Ionicons name="close" size={22} color="#000000" />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ConnectivityProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RootLayoutNav />
            <Toaster richColors invert />
          </AuthProvider>
        </QueryClientProvider>
      </ConnectivityProvider>
    </GestureHandlerRootView>
  );
}