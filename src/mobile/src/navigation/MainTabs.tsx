import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import {
  Home as HomeIcon,
  BookOpen,
  PencilLine,
  Trophy,
  MessageCircle,
  User as UserIcon,
} from 'lucide-react-native';
import type { MainTabParamList } from './types';
import HomeScreen from '../screens/HomeScreen';
import LearningScreen from '../screens/LearningScreen';
import TestScreen from '../screens/TestScreen';
import LeagueScreen from '../screens/LeagueScreen';
import CommunityScreen from '../screens/CommunityScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarStyle: { borderTopColor: '#E5E7EB' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: t('nav.home'),
          tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} strokeWidth={1.9} />,
        }}
      />
      <Tab.Screen
        name="Learning"
        component={LearningScreen}
        options={{
          title: t('nav.learning'),
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} strokeWidth={1.9} />,
        }}
      />
      <Tab.Screen
        name="Test"
        component={TestScreen}
        options={{
          title: t('nav.test'),
          tabBarIcon: ({ color, size }) => <PencilLine color={color} size={size} strokeWidth={1.9} />,
        }}
      />
      <Tab.Screen
        name="League"
        component={LeagueScreen}
        options={{
          title: t('nav.league'),
          tabBarIcon: ({ color, size }) => <Trophy color={color} size={size} strokeWidth={1.9} />,
        }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{
          title: t('nav.community'),
          tabBarIcon: ({ color, size }) => (
            <MessageCircle color={color} size={size} strokeWidth={1.9} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: t('nav.profile'),
          tabBarIcon: ({ color, size }) => <UserIcon color={color} size={size} strokeWidth={1.9} />,
        }}
      />
    </Tab.Navigator>
  );
}
