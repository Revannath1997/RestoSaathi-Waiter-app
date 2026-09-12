import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Camera from 'expo-camera';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const API_URL = process.env.API_V1_URL || 'http://localhost:3000/api/v1';

export default function MenuUploadScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    return status === 'granted';
  };

  const requestLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  };

  const handleCameraCapture = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Toast.show({
        type: 'error',
        text1: 'Camera Permission',
        text2: 'Please enable camera access in settings'
      });
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleGalleryPicker = async () => {
    const hasPermission = await requestLibraryPermission();
    if (!hasPermission) {
      Toast.show({
        type: 'error',
        text1: 'Library Permission',
        text2: 'Please enable photo library access in settings'
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleUploadAndProcess = async () => {
    if (!selectedImage) {
      Toast.show({
        type: 'error',
        text1: 'No Image Selected',
        text2: 'Please capture or select a menu card image'
      });
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const restaurantId = await AsyncStorage.getItem('restaurantId') || 'default-restaurant';
      const branchId = await AsyncStorage.getItem('branchId') || 'default-branch';

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('menu_card', {
        uri: selectedImage,
        type: 'image/jpeg',
        name: `menu-${Date.now()}.jpg`
      });
      formData.append('restaurant_id', restaurantId);
      formData.append('branch_id', branchId);

      // Upload menu card
      const uploadResponse = await axios.post(
        `${API_URL}/menu/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (uploadResponse.data.success) {
        const uploadId = uploadResponse.data.uploadId;
        setProcessingId(uploadId);

        // Start processing
        const processingResponse = await axios.post(
          `${API_URL}/menu/process/${uploadId}`,
          { restaurant_id: restaurantId },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (processingResponse.data.success) {
          Toast.show({
            type: 'success',
            text1: 'Menu Processed',
            text2: `${processingResponse.data.itemsExtracted} items extracted`
          });

          navigation.navigate('MenuProcessing', {
            processingId: processingResponse.data.processingId,
            items: processingResponse.data.items,
            restaurantId
          });
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to upload menu. Please try again.';
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>Upload Menu Card</Text>
        <Text style={styles.subtitle}>Take a photo of your restaurant's menu card</Text>
      </View>

      <View style={styles.contentSection}>
        {selectedImage ? (
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: selectedImage }}
              style={styles.previewImage}
            />
            <TouchableOpacity
              style={styles.changeButton}
              onPress={() => setSelectedImage(null)}
            >
              <Text style={styles.changeButtonText}>Change Image</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderIcon}>📸</Text>
            <Text style={styles.placeholderText}>No image selected</Text>
          </View>
        )}

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.actionButton, styles.cameraButton]}
            onPress={handleCameraCapture}
            disabled={loading}
          >
            <Text style={styles.buttonText}>📷 Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.galleryButton]}
            onPress={handleGalleryPicker}
            disabled={loading}
          >
            <Text style={styles.buttonText}>🖼️ Choose from Gallery</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.uploadButton, loading && styles.buttonDisabled]}
          onPress={handleUploadAndProcess}
          disabled={loading || !selectedImage}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.uploadButtonText}>Process Menu 📝</Text>
          )}
        </TouchableOpacity>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Tips for best results:</Text>
          <Text style={styles.infoText}>✓ Capture entire menu card clearly</Text>
          <Text style={styles.infoText}>✓ Ensure good lighting and no shadows</Text>
          <Text style={styles.infoText}>✓ Hold camera straight and steady</Text>
          <Text style={styles.infoText}>✓ Text should be readable</Text>
        </View>
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
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: '#d1d5db'
  },
  contentSection: {
    paddingHorizontal: 20,
    paddingVertical: 20
  },
  previewContainer: {
    marginBottom: 20
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 12
  },
  changeButton: {
    paddingVertical: 10,
    alignItems: 'center'
  },
  changeButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600'
  },
  placeholderContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    paddingVertical: 40,
    alignItems: 'center',
    marginBottom: 20
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 12
  },
  placeholderText: {
    fontSize: 14,
    color: '#6b7280'
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2
  },
  cameraButton: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6'
  },
  galleryButton: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b'
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600'
  },
  uploadButton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  buttonDisabled: {
    opacity: 0.5
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10
  },
  infoText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 6
  }
});
