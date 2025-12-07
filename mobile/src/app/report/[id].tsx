import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/infra/api';
import { List } from '@/types';

export default function ReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: list, isLoading, isError } = useQuery<List>({
    queryKey: ['list', id],
    queryFn: () => api.get(`/api/lists/${id}`),
  });

  if (isLoading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#FF6347" />;
  }

  if (isError || !list) {
    return <Text style={styles.errorText}>Erro ao carregar o relatório.</Text>;
  }

  const totalSpent = list.items.reduce((acc, item) => acc + item.value * item.quantity, 0);
  const totalItems = list.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Relatório da Lista' }} />
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Gastos</Text>
        <Text style={styles.summaryValue}>{totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
      </View>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total de Itens</Text>
        <Text style={styles.summaryValue}>{totalItems} Itens</Text>
      </View>

      <Text style={styles.itemsTitle}>Resumo dos Itens</Text>
      <FlatList
        data={list.items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text>{item.quantity}x {item.name}</Text>
            <Text>{(item.value * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
          </View>
        )}
        style={{ width: '100%' }}
      />

      <TouchableOpacity style={styles.exportButton} onPress={() => Alert.alert('Exportar', 'Funcionalidade de exportação a ser implementada.')}>
        <Text style={styles.exportButtonText}>Exportar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF0E5', padding: 20 },
  errorText: { flex: 1, textAlign: 'center', textAlignVertical: 'center', fontSize: 18, color: 'red' },
  summaryCard: { backgroundColor: '#EAEAEA', borderRadius: 8, padding: 20, marginBottom: 15 },
  summaryLabel: { fontSize: 16, color: '#555' },
  summaryValue: { fontSize: 28, fontWeight: 'bold', color: '#FF6347', marginTop: 5 },
  itemsTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 20, marginBottom: 10 },
  itemContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  exportButton: { backgroundColor: '#FF6347', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  exportButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
