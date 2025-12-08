import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { listService } from '@/infra/services';
import { offlineListService } from '@/infra/services/offline';
import { List } from '@/types';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isExporting, setIsExporting] = useState(false);

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

      <TouchableOpacity
        className="mt-5 items-center rounded-lg bg-[#18C260] p-4"
        onPress={handleExport}
        disabled={isExporting || list.isOffline}
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
    </SafeAreaView>
  );
}
