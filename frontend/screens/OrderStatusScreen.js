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

const STATUS_STEPS = [
  { key: 'PENDING', label: 'Pending', icon: '⏳' },
  { key: 'SENT_TO_KITCHEN', label: 'Sent to Kitchen', icon: '👨‍🍳' },
  { key: 'PREPARING', label: 'Preparing', icon: '🍳' },
  { key: 'READY', label: 'Ready', icon: '✅' },
  { key: 'SERVED', label: 'Served', icon: '🍽️' },
  { key: 'COMPLETED', label: 'Completed', icon: '🎉' }
];

export default function OrderStatusScreen({ route, navigation }) {
  const { orderId, orderNumber, tableId } = route.params;
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrderStatus();
    // Poll every 3 seconds for updates
    const interval = setInterval(fetchOrderStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrderStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(
        `${API_URL}/orders/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setOrder(response.data.order);
        setNotifications(response.data.order.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching order status:', error);
      if (!loading) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to fetch order status'
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusIndex = (status) => {
    return STATUS_STEPS.findIndex(s => s.key === status);
  };

  const handleCreateNewOrder = () => {
    navigation.navigate('MenuUpload');
  };

  const renderStatusTimeline = () => {
    const currentStatusIndex = getStatusIndex(order?.status);

    return (
      <View style={styles.timelineContainer}>
        {STATUS_STEPS.map((step, index) => {
          const isCompleted = index <= currentStatusIndex;
          const isCurrent = index === currentStatusIndex;

          return (
            <View key={step.key} style={styles.timelineStep}>
              <View style={styles.stepContent}>
                <View
                  style={[
                    styles.stepCircle,
                    isCompleted && styles.stepCircleCompleted,
                    isCurrent && styles.stepCircleCurrent
                  ]}
                >
                  <Text style={styles.stepIcon}>{step.icon}</Text>
                </View>
                <View style={styles.stepTextContainer}>
                  <Text
                    style={[
                      styles.stepLabel,
                      isCompleted && styles.stepLabelCompleted
                    ]}
                  >
                    {step.label}
                  </Text>
                  {isCurrent && (
                    <Text style={styles.stepTime}>In progress</Text>
                  )}
                </View>
              </View>

              {index < STATUS_STEPS.length - 1 && (
                <View
                  style={[
                    styles.stepConnector,
                    isCompleted && styles.stepConnectorCompleted
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const renderNotification = ({ item }) => (
    <View style={styles.notificationItem}>
      <Text style={styles.notificationTime}>
        {new Date(item.sentAt).toLocaleTimeString()}
      </Text>
      <Text style={styles.notificationType}>{item.type.replace(/_/g, ' ')}</Text>
      <Text style={styles.notificationMessage}>{item.message}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading order status...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Order not found</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={handleCreateNewOrder}
        >
          <Text style={styles.errorButtonText}>Create New Order</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={{
        onRefresh: fetchOrderStatus,
        refreshing: refreshing
      }}
    >
      <View style={styles.headerSection}>
        <Text style={styles.orderNumber}>{orderNumber}</Text>
        <Text style={styles.tableInfo}>Table {tableId}</Text>
      </View>

      <View style={styles.summarySection}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Current Status</Text>
          <Text style={styles.statusBadge}>
            {STATUS_STEPS.find(s => s.key === order.status)?.label}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Amount</Text>
          <Text style={styles.summaryAmount}>₹{order.total.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.timelineSection}>
        <Text style={styles.sectionTitle}>Order Progress</Text>
        {renderStatusTimeline()}
      </View>

      {notifications.length > 0 && (
        <View style={styles.notificationsSection}>
          <Text style={styles.sectionTitle}>Activity Log</Text>
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
          />
        </View>
      )}

      <View style={styles.actionSection}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleCreateNewOrder}
        >
          <Text style={styles.actionButtonText}>+ New Order</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6'
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20
  },
  errorButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  errorButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#1f2937'
  },
  orderNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4
  },
  tableInfo: {
    fontSize: 14,
    color: '#d1d5db'
  },
  summarySection: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 16,
    alignItems: 'center'
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8
  },
  statusBadge: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981'
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  timelineSection: {
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16
  },
  timelineContainer: {
    gap: 0
  },
  timelineStep: {
    marginBottom: 12
  },
  stepContent: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  stepCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  stepCircleCompleted: {
    backgroundColor: '#d1fae5'
  },
  stepCircleCurrent: {
    backgroundColor: '#dbeafe',
    borderWidth: 2,
    borderColor: '#3b82f6'
  },
  stepIcon: {
    fontSize: 24
  },
  stepTextContainer: {
    flex: 1,
    paddingTop: 4
  },
  stepLabel: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500'
  },
  stepLabelCompleted: {
    color: '#10b981'
  },
  stepTime: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4
  },
  stepConnector: {
    height: 24,
    marginLeft: 23,
    borderLeftWidth: 2,
    borderColor: '#e5e7eb'
  },
  stepConnectorCompleted: {
    borderColor: '#10b981'
  },
  notificationsSection: {
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16
  },
  notificationItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  notificationTime: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 4
  },
  notificationType: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4
  },
  notificationMessage: {
    fontSize: 12,
    color: '#6b7280'
  },
  actionSection: {
    paddingHorizontal: 16,
    paddingVertical: 20
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold'
  }
});
