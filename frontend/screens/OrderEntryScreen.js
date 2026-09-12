import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Modal,
  TextInput,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

export default function OrderEntryScreen({ route, navigation }) {
  const { menuItems = [], restaurantId } = route.params;
  const [tableId, setTableId] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [showTableModal, setShowTableModal] = useState(false);
  const [showVoiceOption, setShowVoiceOption] = useState(false);

  const toggleItemSelection = (item) => {
    const isSelected = selectedItems.find(i => i.id === item.id);
    if (isSelected) {
      setSelectedItems(selectedItems.filter(i => i.id !== item.id));
      const newQuantities = { ...quantities };
      delete newQuantities[item.id];
      setQuantities(newQuantities);
    } else {
      setSelectedItems([...selectedItems, item]);
      setQuantities({ ...quantities, [item.id]: 1 });
    }
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity < 1) {
      setQuantities({ ...quantities, [itemId]: 1 });
    } else {
      setQuantities({ ...quantities, [itemId]: quantity });
    }
  };

  const getTotalAmount = () => {
    return selectedItems.reduce((total, item) => {
      return total + (item.price * (quantities[item.id] || 1));
    }, 0);
  };

  const handleConfirmOrder = () => {
    if (!tableId) {
      Toast.show({
        type: 'error',
        text1: 'Table Required',
        text2: 'Please enter table number'
      });
      return;
    }

    if (selectedItems.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No Items Selected',
        text2: 'Please select at least one item'
      });
      return;
    }

    const orderItems = selectedItems.map(item => ({
      menu_item_id: item.id,
      quantity: quantities[item.id] || 1,
      price: item.price,
      notes: ''
    }));

    navigation.navigate('OrderConfirmation', {
      orderItems,
      tableId,
      restaurantId,
      totalAmount: getTotalAmount()
    });
  };

  const groupedByCategory = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  const categories = Object.keys(groupedByCategory);

  const renderItem = ({ item }) => {
    const isSelected = selectedItems.find(i => i.id === item.id);
    const quantity = quantities[item.id] || 1;

    return (
      <TouchableOpacity
        style={[styles.itemCard, isSelected && styles.itemCardSelected]}
        onPress={() => toggleItemSelection(item)}
      >
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>₹{item.price}</Text>
        </View>

        {isSelected && (
          <View style={styles.quantityControl}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.id, quantity - 1)}
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.id, quantity + 1)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderCategory = (category) => (
    <View key={category} style={styles.categorySection}>
      <Text style={styles.categoryTitle}>{category}</Text>
      <FlatList
        data={groupedByCategory[category]}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        nestedScrollEnabled={true}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerSection}>
          <TouchableOpacity
            style={styles.tableInputButton}
            onPress={() => setShowTableModal(true)}
          >
            <Text style={styles.tableInputLabel}>Table Number</Text>
            <Text style={styles.tableInputValue}>{tableId || 'Select Table'}</Text>
          </TouchableOpacity>
        </View>

        {categories.map(renderCategory)}
      </ScrollView>

      <View style={styles.footerSection}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Items: {selectedItems.length}</Text>
          <Text style={styles.summaryTotal}>₹{getTotalAmount()}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedItems.length === 0 && styles.buttonDisabled
          ]}
          onPress={handleConfirmOrder}
          disabled={selectedItems.length === 0}
        >
          <Text style={styles.continueButtonText}>
            Continue to Confirm →
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.voiceOrderButton}
          onPress={() => navigation.navigate('VoiceOrder', { restaurantId, tableId })}
        >
          <Text style={styles.voiceOrderButtonText}>🎤 Add Voice Order</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showTableModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Table Number</Text>
            <TextInput
              style={styles.tableInput}
              placeholder="e.g., A1, B2, Table 1"
              value={tableId}
              onChangeText={setTableId}
              keyboardType="default"
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                if (tableId.trim()) {
                  setShowTableModal(false);
                } else {
                  Toast.show({
                    type: 'error',
                    text1: 'Required',
                    text2: 'Please enter table number'
                  });
                }
              }}
            >
              <Text style={styles.modalButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6'
  },
  scrollView: {
    flex: 1
  },
  headerSection: {
    padding: 16,
    backgroundColor: '#1f2937'
  },
  tableInputButton: {
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  tableInputLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4
  },
  tableInputValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff'
  },
  categorySection: {
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  itemCardSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff'
  },
  itemInfo: {
    flex: 1
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4
  },
  itemPrice: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '600'
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    marginLeft: 12
  },
  quantityButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center'
  },
  quantityButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: 'bold'
  },
  quantityValue: {
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#1f2937',
    minWidth: 30,
    textAlign: 'center'
  },
  footerSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb'
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280'
  },
  summaryTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  continueButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold'
  },
  voiceOrderButton: {
    borderWidth: 1,
    borderColor: '#f59e0b',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  voiceOrderButtonText: {
    color: '#d97706',
    fontSize: 13,
    fontWeight: '600'
  },
  buttonDisabled: {
    opacity: 0.5
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 40
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16
  },
  tableInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 16
  },
  modalButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
