import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Learning: undefined;
  Test: undefined;
  League: undefined;
  Community: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
};
