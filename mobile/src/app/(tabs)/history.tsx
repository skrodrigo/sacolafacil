import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { listService } from '@/infra/services';
import { offlineListService } from '@/infra/services/offline';
import { List } from '@/types';
import { useRouter } from 'expo-router';
import { useConnectivity } from '@/context/ConnectivityContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HistoryScreen() {
  const router = useRouter();
  const { isOffline } = useConnectivity();
  const {
    data: lists,
    isLoading,
    isError,
  } = useQuery<List[]>({
    queryKey: ['lists'],
    queryFn: async () => {
      if (isOffline) {
        return offlineListService.getAll();
      }
      const onlineLists = await listService.getAll();
      const offlineLists = await offlineListService.getAll();
      return [...onlineLists, ...offlineLists].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
  });

  if (isLoading) {
    return <ActivityIndicator className="flex-1" size="large" color="#18C260" />;
  }

  if (isError) {
    return (
      <Text className="flex-1 self-center text-center text-lg text-[#18C260]">
        Erro ao carregar o histórico.
      </Text>
    );
  }

  const renderItem = ({ item }: { item: List }) => {
    const totalSpent = item.items.reduce((acc, item) => acc + item.value * item.quantity, 0);
    const budget = item.budget ?? 0;
    const ratio = budget > 0 ? totalSpent / budget : 0;
    const budgetColor =
      ratio < 0.7 ? '#18C260' : ratio < 0.95 ? '#92400E' : '#7F1D1D';

    return (
      <TouchableOpacity
        className="mb-4 rounded-lg bg-white p-4 "
        onPress={() => router.push(`/report/${item.id}`)}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Text className="flex-1 text-xl  text-gray-800">{item.name}</Text>
            {item.isOffline && (
              <View className="ml-2 rounded-md bg-gray-200 px-2 py-1">
                <Text className="text-xs text-gray-500">OFFLINE</Text>
              </View>
            )}
          </View>
          <Text style={{ color: budgetColor }} className="text-lg ">
            {totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </Text>
        </View>
        <View className="mt-2 flex-row justify-between">
          <Text className="text-gray-500">{item.items.length} itens</Text>
          <Text className="text-gray-500">
            {new Date(item.createdAt).toLocaleDateString('pt-BR')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f6f6f6] p-5">
      <StatusBar />
      <Text className="mb-5 text-center text-3xl text-gray-800">Histórico de Listas</Text>
      <FlatList
        data={lists}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        className="w-full"
        ListEmptyComponent={
          <Text className="mt-12 text-center  text-gray-500">Nenhuma lista encontrada.</Text>
        }
      />
    </SafeAreaView>
  );
}
