import { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  StyleSheet,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { toast } from 'sonner-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { listService } from '@/infra/services';
import { offlineListService } from '@/infra/services/offline';
import { useConnectivity } from '@/context/ConnectivityContext';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import CurrencyInput from 'react-native-currency-input';

export default function NewListScreen() {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState<number | null>(null);
  const [newListId, setNewListId] = useState<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isOffline } = useConnectivity();

  const { mutate: createList, isPending } = useMutation({
    mutationFn: (data: { name: string; budget: number }) => {
      if (isOffline) {
        return offlineListService.create(data);
      }
      return listService.create(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      if (data?.id) {
        setNewListId(data.id);
      } else {
        toast.error('Erro de Navegação', { description: 'A API não retornou um ID para a lista.' });
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Não foi possível criar a lista.';
      toast.error('Erro ao Criar Lista', { description: errorMessage });
    },
  });

  useEffect(() => {
    if (newListId) {
      router.replace(`/list/${newListId}`);
    }
  }, [newListId]);

  const handleStartList = () => {
    const budgetValue = budget ?? 0;
    if (!name.trim() || budgetValue <= 0) {
      toast.error('Dados Inválidos', {
        description: 'Por favor, preencha o nome e o orçamento da lista.',
      });
      return;
    }
    createList({ name, budget: budgetValue });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={styles.title}>Crie uma nova lista</Text>

          <TextInput
            style={styles.input}
            placeholder="Nome da lista"
            placeholderTextColor="#A3A3A3"
            value={name}
            onChangeText={setName}
          />

          <CurrencyInput
            value={budget}
            onChangeValue={(value) => {
              setBudget(value);
              Haptics.selectionAsync();
            }}
            style={styles.input}
            prefix="R$ "
            delimiter="."
            separator=","
            precision={2}
            placeholder="R$ 0,00"
            placeholderTextColor="#A3A3A3"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleStartList}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.buttonText}>Iniciar Nova Lista</Text>
                <Ionicons name="arrow-forward" size={16} color="white" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f6f6f6',
    padding: 20,
  },
  title: {
    fontSize: 32,
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    backgroundColor: '#E5E5E5',
    color: '#1f2937',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    fontSize: 24,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#18C260',
    borderRadius: 8,
    padding: 16,
  },
  buttonText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginRight: 8,
  },
});
