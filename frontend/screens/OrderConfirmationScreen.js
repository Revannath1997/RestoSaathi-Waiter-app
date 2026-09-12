import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  FlatList
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const API_URL = process.env.API_V1_URL || 'http://localhost:3000/api/v1';

export default function OrderConfirmationScreen({ route, navigation }) {
  const { orderItems = [], tableId, restaurantId, totalAmount = 0, voiceOrder, isVoiceOrder } = route.params;
  const [specialNotes, setSpecialNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirmOrder = async () => {
    if (!tableId) {
      Toast.show({
        type: 'error',
        text1: 'Table Required',
        text2: 'Table number is missing'
      });
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const waiterId = await AsyncStorage.getItem('waiterId');

      const orderData = {
        restaurant_id: restaurantId,
        table_id: tableId,
        items: orderItems,
        special_notes: specialNotes,
        voice_order_url: isVoiceOrder ? voiceOrder : null
      };

      const response = await axios.post(
        `${API_URL}/orders/create`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        const orderId = response.data.order.id;
        const orderNumber = response.data.order.orderNumber;

        Toast.show({
          type: 'success',
          text1: 'Order Created',
          text2: `Order ${orderNumber} sent to kitchen`
        });

        navigation.navigate('OrderStatus', {
          orderId,
          orderNumber,
          tableId
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to create order. Please try again.';
      Toast.show({
        type: 'error',
        text1: 'Order Failed',
        text2: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItemRow}>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name || 'Item'}</Text>
        <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
      </View>
      <Text style={styles.itemTotal}>₹{(item.price * item.quantity).toFixed(2)}</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>Confirm Order</Text>
        <Text style={styles.subtitle}>Review before sending to kitchen</Text>
      </View>

      <View style={styles.orderSummarySection}>
        <View style={styles.summaryHeader}>
          <View>
            <Text style={styles.tableLabel}>Table</Text>
            <Text style={styles.tableValue}>{tableId}</Text>
          </View>
          <View style={styles.divider} />
          <View>
            <Text style={styles.itemCountLabel}>Items</Text>
            <Text style={styles.itemCountValue}>{orderItems.length}</Text>
          </View>
        </View>

        {isVoiceOrder && voiceOrder && (
          <View style={styles.voiceOrderBox}>
            <Text style={styles.voiceOrderLabel}>Voice Order:</Text>
            <Text style={styles.voiceOrderText}>{voiceOrder}</Text>
          </View>
        )}

        <View style={styles.itemsList}>
          {orderItems.length > 0 ? (
            <FlatList
              data={orderItems}
              renderItem={renderOrderItem}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.emptyText}>No items in order</Text>
          )}
        </View>

        <View style={styles.calculationSection}>
          <View style={styles.calculationRow}>
            <Text style={styles.calcLabel}>Subtotal</Text>
            <Text style={styles.calcValue}>₹{totalAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.calculationRow}>
            <Text style={styles.calcLabel}>Tax (5%)</Text>
            <Text style={styles.calcValue}>₹{(totalAmount * 0.05).toFixed(2)}</Text>
          </View>
          <View style={[styles.calculationRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{(totalAmount * 1.05).toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.notesSection}>
        <Text style={styles.notesLabel}>Special Notes (Optional)</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="e.g., No onions, Extra spicy, etc."
          value={specialNotes}
          onChangeText={setSpecialNotes}
          multiline
          numberOfLines={3}
          placeholderTextColor="#999"
          editable={!loading}
        />
      </View>

      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={[styles.confirmButton, loading && styles.buttonDisabled]}
          onPress={handleConfirmOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>Send to Kitchen 📨</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.editButtonText}>← Edit Order</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f3f4f6'
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#1f2937'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: '#d1d5db'
  },
  orderSummarySection: {
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  tableLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 4
  },
  tableValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  divider: {
    flex: 1,
    height: 2,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 12
  },
  itemCountLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 4
  },
  itemCountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  voiceOrderBox: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b'
  },
  voiceOrderLabel: {
    fontSize: 11,
    color: '#92400e',
    marginBottom: 4
  },
  voiceOrderText: {
    fontSize: 13,
    color: '#78350f',
    fontWeight: '500',
    lineHeight: 18
  },
  itemsList: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10
  },
  itemDetails: {
    flex: 1
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4
  },
  itemQuantity: {
    fontSize: 12,
    color: '#6b7280'
  },
  itemTotal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10b981'
  },
  emptyText: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 16
  },
  calculationSection: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8
  },
  calcLabel: {
    fontSize: 12,
    color: '#6b7280'
  },
  calcValue: {
    fontSize: 12,
    color: '#1f2937',
    fontWeight: '600'
  },
  totalRow: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTopVertical: 4
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ef4444'
  },
  notesSection: {
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1f2937',
    textAlignVertical: 'top'
  },
  buttonSection: {
    marginHorizontal: 16,
    marginVertical: 16,
    marginBottom: 32
  },
  confirmButton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold'
  },
  editButton: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  editButtonText: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '600'
  },
  buttonDisabled: {
    opacity: 0.6
  }
});
