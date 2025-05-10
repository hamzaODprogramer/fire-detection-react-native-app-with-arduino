import { ScrollView, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Stack, useNavigation, usePathname } from 'expo-router';
import FilterButton from '@/components/home/FilterButton';
import ItemAlert from '@/components/home/ItemAlert';
import { getHistorics } from '@/db/actions';

interface HistoricRecord {
  date: string;
  time: string;
  temperature: number;
  gaz: number;
  state: boolean;
  createdAt?: string;
}

// Skeleton component for loading state
const SkeletonItem = () => (
  <View style={{ height: 80 }} className="w-[90%] bg-gray-200 rounded-md flex flex-col justify-center px-4 animate-pulse">
    <View className="w-3/4 h-11 bg-gray-300 rounded mb-2" />
    <View className="w-1/2 h-3 bg-gray-300 rounded mb-2" />
    <View className="w-1/3 h-3 bg-gray-300 rounded" />
  </View>
);

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (`0${date.getMonth() + 1}`).slice(-2);
  const day = (`0${date.getDate()}`).slice(-2);
  const hours = (`0${date.getHours()}`).slice(-2);
  const minutes = (`0${date.getMinutes()}`).slice(-2);
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export default function Historic() {
  const [histories, setHistories] = useState<HistoricRecord[]>([]);
  const [filter, setFilter] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHistoric = async () => {
      setLoading(true);
      try {
        const historicList = await getHistorics();
        setHistories(historicList.histories as []);
      } catch (error) {
        console.error("Failed to fetch historic data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistoric();
  }, []);

  return (
    <>
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
          style={{ height: '500' }}
          className='mt-5 w-full'
          contentContainerStyle={{
            paddingHorizontal: 2,
            alignItems: 'center',
            flexDirection: 'col',
            gap: 14,
          }}
          showsHorizontalScrollIndicator={false}
        >
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <SkeletonItem key={`skeleton-${index}`} />
            ))
          ) : (
            histories
              .filter((item) => {
                if (filter === 1) return true;
                if (filter === 2) return item.temperature > item.gaz;
                if (filter === 3) return item.gaz > item.temperature;
                return true;
              })
              .map((item, index) => (
                <ItemAlert
                  key={index}
                  title={item.state ? 'No danger detected' : 'A person in danger has been discovered'}
                  date={formatDateTime(item.date)}
                  alert={item.temperature >= item.gaz ? 
                    ("Temperature : " + item.temperature + "°C detected") : 
                    ("Gas : " + item.gaz + "ppm detected")}
                  type={item.state ? 'normal' : 'danger'}
                />
              ))
          )}

          {!loading && histories.length === 0 && (
            <View className="w-[90%] py-8 flex items-center justify-center">
              <Text className="text-gray-500 text-lg">No records found</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}