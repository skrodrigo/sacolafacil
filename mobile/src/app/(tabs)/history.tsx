import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/infra/api';
import { List } from '@/types';
import { useRouter } from 'expo-router';

export default function HistoryScreen() {
  const router = useRouter();
  const { data: lists, isLoading, isError } = useQuery<List[]>({
    queryKey: ['lists'],
    queryFn: () => api.get('/api/lists'),
  });

  if (isLoading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#FF6347" />;
  }

  if (isError) {
    return <Text style={styles.errorText}>Erro ao carregar o histórico.</Text>;
  }

  const renderItem = ({ item }: { item: List }) => {
    const totalSpent = item.items.reduce((acc, curr) => acc + curr.value * curr.quantity, 0);
    return (
      <TouchableOpacity style={styles.itemContainer} onPress={() => router.push(`/report/${item.id}`)}>
        <Text style={styles.itemTitle}>{item.name || new Date(item.createdAt).toLocaleDateString('pt-BR')}</Text>
        <Text>{totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico de Listas</Text>
      <FlatList
        data={lists}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={{ width: '100%' }}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma lista encontrada.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF0E5', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333', textAlign: 'center' },
  itemContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderRadius: 5, marginBottom: 10 },
  itemTitle: { fontSize: 16, fontWeight: '500' },
  errorText: { flex: 1, textAlign: 'center', textAlignVertical: 'center', fontSize: 18, color: 'red' },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#888' },
});
