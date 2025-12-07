import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/infra/api';
import { List, ListItem } from '@/types';
import { Ionicons } from '@expo/vector-icons';

export default function ListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [newItemValue, setNewItemValue] = useState('');

  const { data: list, isLoading, isError } = useQuery<List>({
    queryKey: ['list', id],
    queryFn: () => api.get(`/api/lists/${id}`),
  });

  const addItemMutation = useMutation({
    mutationFn: (newItem: Omit<ListItem, 'id' | 'createdAt' | 'updatedAt' | 'listId'>) =>
      api.post(`/api/lists/${id}/items`, newItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['list', id] });
      setNewItemName('');
      setNewItemQty('1');
      setNewItemValue('');
    },
    onError: () => Alert.alert('Erro', 'Não foi possível adicionar o item.'),
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId: string) => api.delete(`/api/lists/${id}/items/${itemId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['list', id] }),
    onError: () => Alert.alert('Erro', 'Não foi possível remover o item.'),
  });

  const handleAddItem = () => {
    const value = parseFloat(newItemValue.replace(/[^\d,]/g, '').replace(',', '.'));
    if (!newItemName || isNaN(value) || value <= 0) {
      Alert.alert('Dados Inválidos', 'Preencha o nome e o valor do item.');
      return;
    }
    addItemMutation.mutate({ name: newItemName, quantity: parseInt(newItemQty, 10), value });
  };

  const totalSpent = list?.items.reduce((acc, item) => acc + item.value * item.quantity, 0) ?? 0;

  if (isLoading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#FF6347" />;
  }

  if (isError || !list) {
    return <Text style={styles.errorText}>Erro ao carregar a lista.</Text>;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Lista de Compras', headerBackTitle: 'Voltar' }} />
      <View style={styles.formContainer}>
        <TextInput style={[styles.input, styles.qtyInput]} value={newItemQty} onChangeText={setNewItemQty} keyboardType="numeric" />
        <TextInput style={[styles.input, styles.nameInput]} placeholder="Nome do item" value={newItemName} onChangeText={setNewItemName} />
        <TextInput style={[styles.input, styles.valueInput]} placeholder="Valor" value={newItemValue} onChangeText={setNewItemValue} keyboardType="numeric" />
        <TouchableOpacity onPress={handleAddItem} disabled={addItemMutation.isPending}>
          <Ionicons name="add-circle" size={32} color="#FF6347" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={list.items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text>{item.quantity}x</Text>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text>{(item.value * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
            <TouchableOpacity onPress={() => deleteItemMutation.mutate(item.id)}>
              <Ionicons name="trash-bin-outline" size={24} color="#FF6347" />
            </TouchableOpacity>
          </View>
        )}
        style={{ width: '100%' }}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>{totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / {list.budget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
        <TouchableOpacity style={styles.finishButton} onPress={() => router.push(`/report/${id}`)}>
          <Text style={styles.finishButtonText}>Finalizar lista</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF0E5', padding: 10 },
  errorText: { flex: 1, textAlign: 'center', textAlignVertical: 'center', fontSize: 18, color: 'red' },
  formContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 5 },
  input: { backgroundColor: '#fff', padding: 10, borderRadius: 5, borderWidth: 1, borderColor: '#ddd' },
  qtyInput: { flex: 1 },
  nameInput: { flex: 4 },
  valueInput: { flex: 2 },
  itemContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderRadius: 5, marginBottom: 10 },
  itemName: { flex: 1, marginLeft: 10 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderTopWidth: 1, borderColor: '#ddd', backgroundColor: '#FFF0E5' },
  footerText: { fontSize: 18, fontWeight: 'bold' },
  finishButton: { backgroundColor: '#FF6347', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5 },
  finishButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
