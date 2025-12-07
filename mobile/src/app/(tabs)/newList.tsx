import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/infra/api';
import { List } from '@/types';

export default function NewListScreen() {
  const [budget, setBudget] = useState('');
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate: createList, isPending } = useMutation({
    mutationFn: (newBudget: number) => {
      return api.post<List>('/api/lists', { budget: newBudget });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      router.push(`/list/${data.id}`);
    },
    onError: (error) => {
      console.error('Failed to create list:', error);
      Alert.alert('Erro', 'Não foi possível criar a lista.');
    },
  });

  const handleStartList = () => {
    const budgetValue = parseFloat(budget.replace(/[^\d,]/g, '').replace(',', '.'));
    if (isNaN(budgetValue) || budgetValue <= 0) {
      Alert.alert('Orçamento Inválido', 'Por favor, insira um valor de orçamento válido.');
      return;
    }
    createList(budgetValue);
  };

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    const floatValue = parseFloat(numericValue) / 100;
    return floatValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Qual o seu orçamento?</Text>

      <TextInput
        style={styles.input}
        placeholder="R$ 0,00"
        placeholderTextColor="#A9A9A9"
        value={formatCurrency(budget)}
        onChangeText={(text) => setBudget(text.replace(/\D/g, ''))}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={handleStartList} disabled={isPending}>
        {isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Iniciar Lista de Compras →</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0E5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#EAEAEA',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  button: {
    width: '100%',
    backgroundColor: '#FF6347',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
