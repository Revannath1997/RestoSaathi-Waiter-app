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

export default function SignupScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [signupCode, setSignupCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = async () => {
    if (!signupCode || !fullName || !phone || !password) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill all fields'
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Password Mismatch',
        text2: 'Passwords do not match'
      });
      return;
    }

    if (password.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Weak Password',
        text2: 'Password must be at least 6 characters'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
        signup_code: signupCode,
        full_name: fullName,
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
          text1: 'Account Created',
          text2: 'Welcome to RestoSaathi!'
        });

        navigation.reset({
          index: 0,
          routes: [{ name: 'MenuUpload' }]
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Signup failed. Please try again.';
      Toast.show({
        type: 'error',
        text1: 'Signup Failed',
        text2: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join RestoSaathi Waiter Network</Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>Manager Signup Code *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter 8-digit code"
          value={signupCode}
          onChangeText={setSignupCode}
          editable={!loading}
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Your full name"
          value={fullName}
          onChangeText={setFullName}
          editable={!loading}
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Phone Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="10-digit phone number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          editable={!loading}
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Password *</Text>
        <TextInput
          style={styles.input}
          placeholder="At least 6 characters"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Confirm Password *</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          editable={!loading}
          placeholderTextColor="#999"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <View style={styles.loginLink}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLinkText}>Login here</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 20
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: '#1f2937',
    marginBottom: 20
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8
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
    marginTop: 12
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16
  },
  loginText: {
    color: '#6b7280',
    fontSize: 14
  },
  loginLinkText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: 'bold'
  }
});
