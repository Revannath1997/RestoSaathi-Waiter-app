import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const API_URL = process.env.API_V1_URL || 'http://localhost:3000/api/v1';

export default function LoginScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!phone || !password) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please enter phone and password'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        phone,
        password
      });

      if (response.data.success) {
        const { token, waiter } = response.data;
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('waiterId', waiter.id);
        await AsyncStorage.setItem('branchId', waiter.branchId);
        await AsyncStorage.setItem('waiterName', waiter.fullName);

        Toast.show({
          type: 'success',
          text1: 'Welcome Back!',
          text2: `Hello ${waiter.fullName}`
        });

        navigation.reset({
          index: 0,
          routes: [{ name: 'MenuUpload' }]
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.logo}>RestoSaathi</Text>
        <Text style={styles.tagline}>Waiter App</Text>
        <Text style={styles.subtitle}>Manage Orders & Menu</Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>Phone Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your phone number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          editable={!loading}
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Password *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
          placeholderTextColor="#999"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <View style={styles.signupLink}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.signupLinkText}>Sign up here</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          For first-time signup, contact your restaurant manager for a signup code
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f3f4f6',
    justifyContent: 'space-between'
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingVertical: 60,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    marginBottom: 30
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8
  },
  tagline: {
    fontSize: 18,
    color: '#60a5fa',
    fontWeight: '600',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: '#d1d5db'
  },
  formSection: {
    paddingHorizontal: 20,
    paddingVertical: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    marginTop: 16
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    color: '#1f2937'
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 24,
    alignItems: 'center'
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  signupLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16
  },
  signupText: {
    color: '#6b7280',
    fontSize: 14
  },
  signupLinkText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: 'bold'
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center'
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18
  }
});
