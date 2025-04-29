import { Tabs, usePathname } from 'expo-router';
import React from 'react';
import { Platform, Text, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarActiveTintColor: '#1E6091',
          headerShown: true,
          headerTitle: 'FireBot Guardian',  
          headerStyle : {
            backgroundColor: '#1E6091',
            borderColor: '#1E6091',
          },
          headerTitleStyle : {
            color: '#FFFFFF',
            fontWeight: 'bold',
          },
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={pathname == "/" ? `#1E6091` : color} />
          ),
        }}
      />
      <Tabs.Screen
        name="online"
        options={{
          headerShown: true,
          headerTitle: 'Live Camera',
          headerStyle : {
            backgroundColor: '#1E6091',
            borderColor: '#1E6091',
          },
          headerTitleStyle : {
            color: '#FFFFFF',
            fontWeight: 'bold',
          },
          tabBarActiveTintColor: '#1E6091',
          title: 'Online',
          tabBarIcon: ({ color }) => (<IconSymbol size={28} name="online-prediction.fill" color={pathname == "/online" ? `#1E6091` : color} />),
        }}
      />
      
      <Tabs.Screen
        name="historic"
        options={{
          headerShown:true,
          headerStyle : {
            backgroundColor: '#1E6091',
            borderColor: '#1E6091',
          },
          headerTitleStyle : {
            color: '#FFFFFF',
            fontWeight: 'bold',
          },
          headerTitle: 'Alert history',
          tabBarActiveTintColor: '#1E6091',
          title: 'Historic',
          tabBarIcon: ({ color }) => (<IconSymbol size={28} name="history.fill" color={pathname == "/historic" ? `#1E6091` : color} />),
        }}
      />
      <Tabs.Screen
        name="testFireBase"
        options={{
          headerShown:true,
          headerStyle : {
            backgroundColor: '#1E6091',
            borderColor: '#1E6091',
          },
          headerTitleStyle : {
            color: '#FFFFFF',
            fontWeight: 'bold',
          },
          headerTitle: 'FireBase Test',
          tabBarActiveTintColor: '#1E6091',
          title: 'FireBase Test',
          tabBarIcon: ({ color }) => (<IconSymbol size={28} name="history.fill" color={pathname == "/historic" ? `#1E6091` : color} />),
        }}
      />
    </Tabs>
  );
}
