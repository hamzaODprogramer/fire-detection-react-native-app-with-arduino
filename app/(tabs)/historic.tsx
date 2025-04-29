import { ScrollView, Text, View } from 'react-native';
import React, { useState } from 'react';
import { Stack, useNavigation, usePathname } from 'expo-router';
import FilterButton from '@/components/home/FilterButton';
import ItemAlert from '@/components/home/ItemAlert';

export default function Historic() {
  const [filter,setFilter] = useState<number>(1)
  return <>
    <View className='pt-5 flex items-center'>
      <View className="flex flex-row items-center bg-white px-5 w-[90%] py-4 shadow-1 shadow-black/100 shadow-md rounded-md">
          <Text className='text-[17px] font-semibold text-gray-600'>Filter By : </Text>
          <ScrollView
            horizontal
            contentContainerStyle={{
              paddingHorizontal: 2,
              alignItems: 'center',
              flexDirection: 'row',
              gap: 8,
            }}
            showsHorizontalScrollIndicator={false}
          >
            <FilterButton setFilter={setFilter} state={filter == 1} text='all' />
            <FilterButton setFilter={setFilter} state={filter == 2} text='temperature' />
            <FilterButton setFilter={setFilter} state={filter == 3} text='smoke' />
          </ScrollView>
      </View> 
      <ScrollView
        style={{height:'500'}}
        className='mt-5 w-full'
        contentContainerStyle={{
          paddingHorizontal: 2,
          alignItems: 'center',
          flexDirection: 'col',
          gap: 14,
        }}
        showsHorizontalScrollIndicator={false}
      >
        <ItemAlert 
          title='Alert Température élevé' 
          date="14 Apr 2025,13:00"
          alert="52 détecter"
          type="danger"
        />
        <ItemAlert 
          title='Alert Température élevé' 
          date="14 Apr 2025,13:00"
          alert="52 détecter"
          type="normal"
        />
        <ItemAlert 
          title='Alert Température élevé' 
          date="14 Apr 2025,13:00"
          alert="52 détecter"
          type="warning"
        />
        <ItemAlert 
          title='Alert Température élevé' 
          date="14 Apr 2025,13:00"
          alert="52 détecter"
          type="normal"
        />
        <ItemAlert 
          title='Alert Température élevé' 
          date="14 Apr 2025,13:00"
          alert="52 détecter"
          type="normal"
        />
        <ItemAlert 
          title='Alert Température élevé' 
          date="14 Apr 2025,13:00"
          alert="52 détecter"
          type="normal"
        />
      </ScrollView>
    </View>
     
  </>
}

