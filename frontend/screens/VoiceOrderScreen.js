import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import * as Speech from 'expo-speech';
import Toast from 'react-native-toast-message';

export default function VoiceOrderScreen({ route, navigation }) {
  const { restaurantId, tableId } = route.params;
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const startVoiceRecording = async () => {
    try {
      setIsListening(true);
      // In production, integrate with expo-voice or React Native Voice
      // This is a mock implementation

      Toast.show({
        type: 'info',
        text1: 'Voice Recording',
        text2: 'Say your order now...'
      });

      // Simulate recording for 5 seconds
      setTimeout(() => {
        setIsListening(false);
        // Mock transcription result
        setVoiceText('Butter chicken with rice and naan, 2 cokes');
        Toast.show({
          type: 'success',
          text1: 'Recorded',
          text2: 'Order text captured'
        });
      }, 3000);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Recording Failed',
        text2: error.message
      });
      setIsListening(false);
    }
  };

  const handleConfirmVoiceOrder = () => {
    if (!voiceText.trim()) {
      Toast.show({
        type: 'error',
        text1: 'No Order',
        text2: 'Please record an order first'
      });
      return;
    }

    setIsProcessing(true);
    // Navigate to confirmation screen
    setTimeout(() => {
      setIsProcessing(false);
      navigation.navigate('OrderConfirmation', {
        voiceOrder: voiceText,
        tableId,
        restaurantId,
        isVoiceOrder: true
      });
    }, 1000);
  };

  const handleRetry = () => {
    setVoiceText('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>Voice Order</Text>
        <Text style={styles.subtitle}>Speak your order clearly</Text>
      </View>

      <View style={styles.contentSection}>
        {!voiceText ? (
          <>
            <View style={styles.statusBox}>
              {isListening ? (
                <>
                  <View style={styles.recordingAnimation}>
                    <View style={[styles.pulse, styles.pulse1]} />
                    <View style={[styles.pulse, styles.pulse2]} />
                    <View style={[styles.pulse, styles.pulse3]} />
                  </View>
                  <Text style={styles.statusText}>Listening...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.statusIcon}>🎤</Text>
                  <Text style={styles.statusText}>Ready to record</Text>
                </>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.recordButton,
                isListening && styles.recordButtonActive
              ]}
              onPress={startVoiceRecording}
              disabled={isListening}
            >
              {isListening ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.recordButtonText}>🎙️ Start Recording</Text>
              )}
            </TouchableOpacity>

            <View style={styles.tipsBox}>
              <Text style={styles.tipsTitle}>Recording Tips:</Text>
              <Text style={styles.tipItem}>✓ Speak clearly and naturally</Text>
              <Text style={styles.tipItem}>✓ Include item names and quantities</Text>
              <Text style={styles.tipItem}>✓ Example: "2 butter chicken, 1 rice, 1 naan"</Text>
              <Text style={styles.tipItem}>✓ No background noise</Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.transcriptBox}>
              <Text style={styles.transcriptLabel}>Your Order:</Text>
              <Text style={styles.transcriptText}>{voiceText}</Text>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmVoiceOrder}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>✓ Confirm Order</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRetry}
                disabled={isProcessing}
              >
                <Text style={styles.retryButtonText}>🔄 Record Again</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      <View style={styles.footerSection}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.skipText}>← Skip to Manual Entry</Text>
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
  contentSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 32,
    justifyContent: 'center'
  },
  statusBox: {
    alignItems: 'center',
    marginBottom: 32
  },
  statusIcon: {
    fontSize: 64,
    marginBottom: 12
  },
  recordingAnimation: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  pulse: {
    position: 'absolute',
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#3b82f6'
  },
  pulse1: {
    width: 120,
    height: 120,
    opacity: 0.7,
    backgroundColor: 'transparent'
  },
  pulse2: {
    width: 100,
    height: 100,
    opacity: 0.4,
    backgroundColor: 'transparent'
  },
  pulse3: {
    width: 80,
    height: 80,
    opacity: 0.2,
    backgroundColor: 'transparent'
  },
  statusText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500'
  },
  recordButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32
  },
  recordButtonActive: {
    backgroundColor: '#991b1b'
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  tipsBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b'
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10
  },
  tipItem: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 6
  },
  transcriptBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#10b981'
  },
  transcriptLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8
  },
  transcriptText: {
    fontSize: 15,
    color: '#1f2937',
    lineHeight: 22,
    fontWeight: '500'
  },
  actionButtons: {
    gap: 10
  },
  confirmButton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold'
  },
  retryButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  retryButtonText: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '600'
  },
  footerSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center'
  },
  skipText: {
    color: '#3b82f6',
    fontSize: 13,
    fontWeight: '600'
  }
});
