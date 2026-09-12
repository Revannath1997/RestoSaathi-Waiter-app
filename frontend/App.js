import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

// Screens
import SignupScreen from './screens/SignupScreen';
import LoginScreen from './screens/LoginScreen';
import MenuUploadScreen from './screens/MenuUploadScreen';
import MenuProcessingScreen from './screens/MenuProcessingScreen';
import OrderEntryScreen from './screens/OrderEntryScreen';
import VoiceOrderScreen from './screens/VoiceOrderScreen';
import OrderConfirmationScreen from './screens/OrderConfirmationScreen';
import OrderStatusScreen from './screens/OrderStatusScreen';

const Stack = createStackNavigator();

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: '#fff' }
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
  </Stack.Navigator>
);

const AppStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerTitleAlign: 'center',
      headerStyle: { backgroundColor: '#1f2937', elevation: 4 },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold', fontSize: 18 }
    }}
  >
    <Stack.Screen
      name="MenuUpload"
      component={MenuUploadScreen}
      options={{
        title: 'Upload Menu Card',
        headerBackVisible: false
      }}
    />
    <Stack.Screen
      name="MenuProcessing"
      component={MenuProcessingScreen}
      options={{ title: 'Processing Menu...' }}
    />
    <Stack.Screen
      name="OrderEntry"
      component={OrderEntryScreen}
      options={{ title: 'Take Order' }}
    />
    <Stack.Screen
      name="VoiceOrder"
      component={VoiceOrderScreen}
      options={{ title: 'Voice Order' }}
    />
    <Stack.Screen
      name="OrderConfirmation"
      component={OrderConfirmationScreen}
      options={{ title: 'Confirm Order' }}
    />
    <Stack.Screen
      name="OrderStatus"
      component={OrderStatusScreen}
      options={{
        title: 'Order Status',
        headerBackVisible: false
      }}
    />
  </Stack.Navigator>
);

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      // Restore token
      const token = await AsyncStorage.getItem('userToken');
      const restaurantId = await AsyncStorage.getItem('restaurantId');
      const branchId = await AsyncStorage.getItem('branchId');

      if (token && restaurantId && branchId) {
        setUserToken(token);
      }
    } catch (e) {
      console.error('Failed to restore token:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const authContext = React.useMemo(
    () => ({
      signIn: async (credentials) => {
        setUserToken(credentials.token);
      },
      signUp: async (credentials) => {
        setUserToken(credentials.token);
      },
      signOut: async () => {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('restaurantId');
        await AsyncStorage.removeItem('branchId');
        await AsyncStorage.removeItem('waiterId');
        setUserToken(null);
      }
    }),
    []
  );

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      {userToken == null ? <AuthStack /> : <AppStack />}
      <Toast />
    </NavigationContainer>
  );
}
