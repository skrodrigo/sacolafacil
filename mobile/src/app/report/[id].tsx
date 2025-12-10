import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Modal, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listService } from '@/infra/services';
import { offlineListService } from '@/infra/services/offline';
import { List } from '@/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

export default function ReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: list,
    isLoading,
    isError,
  } = useQuery<List | null>({
    queryKey: ['list', id],
    queryFn: () => {
      if (id?.startsWith('offline-')) {
        return offlineListService.getById(id);
      }
      return listService.getById(id!);
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: async () => {
      if (id?.startsWith('offline-')) {
        // Delete from offline storage
        await offlineListService.deleteList(id);
      } else {
        // Delete from API
        await listService.delete(id!);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      toast.success('Lista deletada com sucesso');
      router.replace('/(tabs)/history');
    },
    onError: () => {
      toast.error('Erro ao deletar lista');
    },
  });

  const handleDeleteList = () => {
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    setDeleteModalVisible(false);
    deleteListMutation.mutate();
  };

  if (isLoading) {
    return <ActivityIndicator className="flex-1" size="large" color="#18C260" />;
  }

  if (isError || !list) {
    return (
      <Text className="flex-1 self-center text-center text-lg text-[#18C260]">
        Erro ao carregar o relatório.
      </Text>
    );
  }

  const totalSpent = list.items.reduce((acc, item) => acc + item.value * item.quantity, 0);
  const totalItems = list.items.reduce((acc, item) => acc + item.quantity, 0);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const itemsHtml = list.items.map(item => `
        <div style="border-bottom: 1px solid #eee; padding: 10px; display: flex; justify-content: space-between;">
          <span>${item.quantity}x ${item.name}</span>
          <span>${(item.value * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        </div>
      `).join('');

      const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          </head>
          <body style="font-family: Arial, sans-serif; text-align: center;">
            <h1 style="color: #18C260;">${list.name || 'Lista de Compras'}</h1>
            <div style="margin-top: 20px;">${itemsHtml}</div>
            <div style="margin-top: 20px; ; font-size: 1.2em;">
              Total: ${totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} className="flex-1 bg-[#f6f6f6] p-5">
      <Modal
        animationType="fade"
        transparent={true}
        visible={isDeleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setDeleteModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalView}>
                <Text style={styles.cardTitle}>Deletar Lista</Text>
                <Text style={styles.confirmText}>Tem certeza que deseja deletar esta lista? Esta ação não pode ser desfeita.</Text>
                <View style={styles.confirmButtonContainer}>
                  <TouchableOpacity
                    style={[styles.confirmButton, styles.cancelButton]}
                    onPress={() => setDeleteModalVisible(false)}>
                    <Text style={styles.confirmButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.confirmButton, styles.deleteButton]}
                    onPress={handleConfirmDelete}
                    disabled={deleteListMutation.isPending}>
                    {deleteListMutation.isPending ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.confirmButtonText}>Deletar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <View className="mb-4 rounded-lg bg-gray-200 p-5">
        <Text className=" text-gray-600">Total Gastos</Text>
        <Text className="mt-1 text-3xl  text-[#18C260]">
          {totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </Text>
      </View>
      <View className="mb-4 rounded-lg bg-gray-200 p-5">
        <Text className=" text-gray-600">Total de Itens</Text>
        <Text className="mt-1 text-3xl  text-[#18C260]">{totalItems} Itens</Text>
      </View>

      <Text className="mb-5 text-center text-3xl  text-gray-800">Resumo dos Itens</Text>
      <FlatList
        data={list.items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="mb-2 flex-row items-center justify-between rounded-md bg-gray-200 p-4">
            <Text className="text-gray-800">
              {item.quantity}x {item.name}
            </Text>
            <Text className="text-gray-800">
              {(item.value * item.quantity).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </Text>
          </View>
        )}
        className="w-full"
      />

      <View className="mt-5 gap-3">
        <TouchableOpacity
          className="items-center rounded-lg bg-red-500 p-4"
          onPress={handleDeleteList}
        >
          <View className='flex-row gap-2 justify-center items-center'>
            <Ionicons name='trash' size={16} color='#fff' />
            <Text className="text-xl text-white">Deletar Lista</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className="items-center rounded-lg bg-[#18C260] p-4"
          onPress={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <ActivityIndicator color="#1f2937" />
          ) : (
            <View className='flex-row gap-2 justify-center items-center'>
              <Ionicons name='document-text' size={16} color='#1f2937' />
              <Text className="text-xl text-gray-800">Exportar</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="items-center rounded-lg bg-[#6b7280] p-4"
          onPress={() => router.push(`/list/${id}`)}
        >
          <View className='flex-row gap-2 justify-center items-center'>
            <Ionicons name='pencil' size={16} color='#fff' />
            <Text className="text-xl text-white">Editar Lista</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  deleteButton: {
    backgroundColor: '#DC2626',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});
