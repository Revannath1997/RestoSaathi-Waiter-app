import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  FlatList
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const API_URL = process.env.API_V1_URL || 'http://localhost:3000/api/v1';

export default function MenuProcessingScreen({ route, navigation }) {
  const { processingId, items = [], restaurantId } = route.params;
  const [loading, setLoading] = useState(!items.length);
  const [menuItems, setMenuItems] = useState(items);
  const [selectedItems, setSelectedItems] = useState(new Set());

  useEffect(() => {
    if (!items.length) {
      fetchProcessingStatus();
    }
  }, []);

  const fetchProcessingStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(
        `${API_URL}/menu/processing/${processingId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setMenuItems(response.data.processing.items);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch processing status'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleItemSelection = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleContinueToOrder = () => {
    const selectedMenuItems = menuItems.filter(item => selectedItems.has(item.id));

    if (selectedMenuItems.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No Items Selected',
        text2: 'Please select at least one menu item'
      });
      return;
    }

    navigation.navigate('OrderEntry', {
      menuItems: selectedMenuItems,
      restaurantId
    });
  };

  const renderMenuItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.menuItem,
        selectedItems.has(item.id) && styles.menuItemSelected
      ]}
      onPress={() => toggleItemSelection(item.id)}
    >
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemCategory}>{item.category}</Text>
        <View style={styles.itemMeta}>
          <Text style={styles.itemPrice}>₹{item.price}</Text>
          <Text style={styles.confidence}>
            {item.confidence ? `${item.confidence.toFixed(0)}%` : 'N/A'}
          </Text>
        </View>
      </View>
      <View style={styles.checkbox}>
        {selectedItems.has(item.id) && (
          <Text style={styles.checkmark}>✓</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Processing menu...</Text>
      </View>
    );
  }

  const selectedCount = selectedItems.size;

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>Menu Items Extracted</Text>
        <Text style={styles.subtitle}>
          {menuItems.length} items found • {selectedCount} selected
        </Text>
      </View>

      <FlatList
        data={menuItems}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        scrollEnabled={true}
      />

      <View style={styles.footerSection}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedCount === 0 && styles.buttonDisabled
          ]}
          onPress={handleContinueToOrder}
          disabled={selectedCount === 0}
        >
          <Text style={styles.continueButtonText}>
            Continue with {selectedCount} Items →
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            setSelectedItems(new Set(menuItems.map(i => i.id)));
          }}
        >
          <Text style={styles.editButtonText}>Select All</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280'
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1f2937'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 13,
    color: '#d1d5db'
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12
  },
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb'
  },
  menuItemSelected: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4'
  },
  itemContent: {
    flex: 1
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4
  },
  itemCategory: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981'
  },
  confidence: {
    fontSize: 12,
    color: '#9ca3af'
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12
  },
  checkmark: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: 'bold'
  },
  footerSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb'
  },
  continueButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  editButton: {
    borderWidth: 1,
    borderColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  editButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600'
  },
  buttonDisabled: {
    opacity: 0.5
  }
});
