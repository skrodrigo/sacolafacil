import { useState } from 'react';
import {
  View,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listService } from '@/infra/services';
import { offlineListService } from '@/infra/services/offline';
import { useConnectivity } from '@/context/ConnectivityContext';
import { List, ListItem } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';
import * as Haptics from 'expo-haptics';
import CurrencyInput from 'react-native-currency-input';

export default function ListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isOffline } = useConnectivity();

  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [newItemValue, setNewItemValue] = useState<number | null>(null);
  const [isFormVisible, setFormVisible] = useState(false);
  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
  const [step, setStep] = useState(1);

  const {
    data: list,
    isLoading,
    isError,
  } = useQuery<List | null>({
    queryKey: ['list', id],
    queryFn: () => {
      if (isOffline || id?.startsWith('offline-')) {
        return offlineListService.getById(id!);
      }
      return listService.getById(id!);
    },
  });

  const addItemMutation = useMutation({
    mutationFn: async (newItem: Omit<ListItem, 'id' | 'createdAt' | 'updatedAt' | 'listId'>) => {
      if (isOffline || id?.startsWith('offline-')) {
        const currentList = await offlineListService.getById(id!);
        if (currentList) {
          const itemToAdd: ListItem = {
            ...newItem,
            id: `offline-item-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            listId: id!,
          };
          currentList.items.push(itemToAdd);
          return offlineListService.update(id!, currentList);
        }
      } else {
        return listService.addItem(id!, newItem.name, newItem.quantity, newItem.value);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['list', id] });
      setNewItemName('');
      setNewItemQty('1');
      setNewItemValue(null);
      setFormVisible(false);
      setStep(1);
    },
    onError: () => toast.error('Erro', { description: 'Não foi possível adicionar o item.' }),
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      if (isOffline || id?.startsWith('offline-')) {
        const currentList = await offlineListService.getById(id!);
        if (currentList) {
          currentList.items = currentList.items.filter((item) => item.id !== itemId);
          return offlineListService.update(id!, currentList);
        }
      } else {
        return listService.deleteItem(id!, itemId);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['list', id] }),
    onError: () => toast.error('Erro', { description: 'Não foi possível remover o item.' }),
  });

  const handleAddItem = () => {
    const value = newItemValue ?? 0;
    const quantity = parseInt(newItemQty, 10) || 0;

    if (!newItemName || value <= 0 || quantity <= 0) {
      toast.error('Dados Inválidos', {
        description: 'Por favor, preencha o nome, quantidade e valor do item.',
      });
      return;
    }
    const newTotal = totalSpent + value * quantity;

    if (newTotal > (list?.budget ?? 0)) {
      toast.error('Orçamento excedido', {
        description: 'Este item ultrapassa o orçamento definido para a lista.',
      });
      return;
    }

    const budget = list?.budget ?? 0;
    if (budget > 0) {
      const ratio = newTotal / budget;
      if (ratio >= 0.95) {
        toast.error('Muito próximo do limite', {
          description: 'Você está praticamente estourando o orçamento.',
        });
      } else if (ratio >= 0.7) {
        toast.warning('Atenção ao orçamento', {
          description: 'Você já utilizou boa parte do orçamento desta lista.',
        });
      }
    }

    addItemMutation.mutate({ name: newItemName, quantity: parseInt(newItemQty, 10), value });
  };

  const handleFinalize = () => {
    setConfirmModalVisible(false);
    router.replace(`/report/${id}`);
  };


  const totalSpent = list?.items.reduce((acc, item) => acc + item.value * item.quantity, 0) ?? 0;

  const budget = list?.budget ?? 0;
  const ratio = budget > 0 ? totalSpent / budget : 0;
  const budgetColor =
    ratio < 0.7 ? '#18C260' : ratio < 0.95 ? '#92400E' : '#7F1D1D';

  if (isLoading) {
    return <ActivityIndicator className="flex-1" size="large" color="#18C260" />;
  }

  if (isError || !list) {
    return (
      <Text style={styles.errorText}>Erro ao carregar a lista.</Text>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>

        <Modal
          animationType="fade"
          transparent={true}
          visible={isFormVisible}
          onRequestClose={() => {
            setFormVisible(false);
            setStep(1);
          }}>
          <TouchableWithoutFeedback onPress={() => { setFormVisible(false); setStep(1); }}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalView}>
                  {step === 1 && (
                    <>
                      <Text style={styles.cardTitle}>Quantidade</Text>
                      <View style={styles.stepperContainer}>
                        <TouchableOpacity style={styles.stepperButton} onPress={() => setNewItemQty((q) => String(Math.max(1, parseInt(q) - 1)))}>
                          <Ionicons name="remove" size={24} color="#1f2937" />
                        </TouchableOpacity>
                        <Text style={styles.stepperValue}>{newItemQty}</Text>
                        <TouchableOpacity style={styles.stepperButton} onPress={() => setNewItemQty((q) => String(parseInt(q) + 1))}>
                          <Ionicons name="add" size={24} color="#1f2937" />
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity style={styles.nextButton} onPress={() => {
                        if (parseInt(newItemQty) > 0) {
                          setStep(2);
                        } else {
                          toast.error('Quantidade inválida', { description: 'A quantidade deve ser maior que zero.' });
                        }
                      }}>
                        <Text style={styles.nextButtonText}>Próximo</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <Text style={styles.cardTitle}>Nome do Item</Text>
                      <TextInput
                        style={styles.nameInput}
                        placeholder="Ex: Arroz, Feijão..."
                        placeholderTextColor="#9CA3AF"
                        value={newItemName}
                        onChangeText={setNewItemName}
                      />
                      <View style={styles.confirmButtonContainer}>
                        <TouchableOpacity style={[styles.confirmButton, styles.cancelButton]} onPress={() => setStep(1)}>
                          <Text style={styles.confirmButtonText}>Voltar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.confirmButton, styles.finishButton]} onPress={() => {
                          if (newItemName.trim()) {
                            setStep(3);
                          } else {
                            toast.error('Nome inválido', { description: 'Por favor, insira o nome do item.' });
                          }
                        }}>
                          <Text style={styles.confirmButtonText}>Próximo</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                  {step === 3 && (
                    <>
                      <Text style={styles.cardTitle}>Valor Unitário</Text>
                      <CurrencyInput
                        value={newItemValue}
                        onChangeValue={(value) => {
                          setNewItemValue(value);
                          Haptics.selectionAsync();
                        }}
                        style={styles.valueInput}
                        prefix="R$ "
                        delimiter="."
                        separator=","
                        precision={2}
                        placeholder="R$ 0,00"
                        placeholderTextColor="#9CA3AF"
                      />
                      <View style={styles.confirmButtonContainer}>
                        <TouchableOpacity style={[styles.confirmButton, styles.cancelButton]} onPress={() => setStep(2)}>
                          <Text style={styles.confirmButtonText}>Voltar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.confirmButton, styles.finishButton]}
                          onPress={handleAddItem}
                          disabled={addItemMutation.isPending}>
                          {addItemMutation.isPending ? (
                            <ActivityIndicator color="#fff" />
                          ) : (
                            <Text style={styles.confirmButtonText}>Adicionar</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <Modal
          animationType="fade"
          transparent={true}
          visible={isConfirmModalVisible}
          onRequestClose={() => setConfirmModalVisible(false)}>
          <TouchableWithoutFeedback onPress={() => setConfirmModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalView}>
                  <Text style={styles.cardTitle}>Finalizar Lista</Text>
                  <Text style={styles.confirmText}>Deseja realmente finalizar a lista?</Text>
                  <View style={styles.confirmButtonContainer}>
                    <TouchableOpacity
                      style={[styles.confirmButton, styles.cancelButton]}
                      onPress={() => setConfirmModalVisible(false)}>
                      <Text style={styles.confirmButtonText}>Voltar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.confirmButton, styles.finishButton]}
                      onPress={handleFinalize}>
                      <Text style={styles.confirmButtonText}>Finalizar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>


        <FlatList
          data={list.items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.listItemContainer}>
              <Text style={styles.listItemQty}>{item.quantity}x</Text>
              <Text style={styles.listItemName}>{item.name}</Text>
              <Text style={styles.listItemValue}>
                {(item.value * item.quantity).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </Text>
              <TouchableOpacity
                onPress={() => deleteItemMutation.mutate(item.id)}
                style={styles.deleteButton}>
                <Ionicons name="trash" size={24} color="#FF3300" />
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />

        <View style={styles.addButtonContainer}>
          <TouchableOpacity style={styles.fab} onPress={() => setFormVisible(true)}>
            <Ionicons name="add" size={32} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.footerButton}
            onPress={() => setConfirmModalVisible(true)}>
            <Text style={styles.footerButtonText}>Finalizar</Text>
          </TouchableOpacity>
          <View className='flex-row justify-center items-center gap-2'>
            <Text style={[styles.footerBudgetText]}>
              {totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </Text>
            <Text className='text-[#D1D5DB]'>/</Text>
            <Text style={[styles.footerBudgetText, { color: budgetColor }]}>
              {list.budget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  errorText: {
    flex: 1,
    textAlign: 'center',
    alignSelf: 'center',
    fontSize: 18,
    color: '#DC2626',
  },
  card: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#E5E5E5',
    padding: 20,
    marginBottom: 12,
  },
  addButtonContainer: {
    alignItems: 'flex-end',
    paddingBottom: 8,
  },
  fab: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#18C260',
    borderRadius: 28,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    minHeight: 220,
    backgroundColor: '#E5E5E5',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  cardTitle: {
    marginBottom: 16,
    fontSize: 22,
    color: '#1f2937',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  qtyContainer: {
    width: 96,
  },
  nameContainer: {
    flex: 1,
  },
  label: {
    marginBottom: 4,
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  qtyInput: {
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    textAlign: 'center',
    fontSize: 18,
  },
  nameInput: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    marginBottom: 20,
  },
  valueContainer: {
    marginBottom: 16,
  },
  valueInput: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    marginBottom: 20,
  },
  addButton: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#18C260',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 18,
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 12,
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    backgroundColor: '#E5E5E5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  listItemQty: {
    fontSize: 16,
    fontWeight: '600',
  },
  listItemName: {
    marginLeft: 8,
    flex: 1,
    fontSize: 16,
  },
  listItemValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  deleteButton: {
    marginLeft: 8,
  },
  footer: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#f6f6f6',
    paddingTop: 10,
    paddingBottom: 12,
  },
  footerBudgetText: {
    fontSize: 20,
    color: "#1f2937"
  },
  footerButton: {
    borderRadius: 10,
    backgroundColor: '#6b7280',
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  footerButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  confirmText: {
    marginBottom: 20,
    fontSize: 18,
    textAlign: 'center',
    color: '#1f2937',
  },
  confirmButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#6b7280',
  },
  finishButton: {
    backgroundColor: '#18C260',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepperButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f6f6f6',
  },
  stepperValue: {
    fontSize: 24,
    marginHorizontal: 20,
    color: '#1f2937',
  },
  nextButton: {
    width: '100%',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#18C260',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});
