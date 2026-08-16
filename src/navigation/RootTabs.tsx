import React, { useCallback, useRef } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Activity, Home, Settings } from 'lucide-react-native';
import { AppTopBar } from '../components/AppTopBar';
import { FloatingAssistant } from '../components/FloatingAssistant';
import { useSession } from '../context/SessionContext';
import { HomeScreen } from '../screens/HomeScreen';
import { MetaTraderScreen } from '../screens/MetaTraderScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useTheme } from '../context/ThemeContext';

export type RootTabParamList = {
  Home: undefined;
  MetaTrader: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const TRIPLE_CLICK_WINDOW_MS = 450;

export function RootTabs() {
  const { colors } = useTheme();
  const { enterAdmin } = useSession();
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, Platform.OS === 'web' ? 10 : 8);
  const tabHeight = 56 + bottomPad;

  const settingsClicks = useRef<{
    count: number;
    timer: ReturnType<typeof setTimeout> | null;
  }>({
    count: 0,
    timer: null,
  });

  const handleSettingsTabPress = useCallback(
    (navigate: () => void) => {
      const state = settingsClicks.current;
      state.count += 1;

      if (state.timer) clearTimeout(state.timer);

      if (state.count >= 3) {
        state.count = 0;
        state.timer = null;
        enterAdmin();
        return;
      }

      state.timer = setTimeout(() => {
        state.count = 0;
        state.timer = null;
      }, TRIPLE_CLICK_WINDOW_MS);

      navigate();
    },
    [enterAdmin],
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppTopBar />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: tabHeight,
            paddingTop: 8,
            paddingBottom: bottomPad,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.glassBorder,
            backgroundColor: colors.surfaceSolid,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarItemStyle: {
            paddingTop: 2,
          },
          tabBarLabelStyle: styles.label,
          tabBarIcon: ({ color, focused }) => {
            const stroke = focused ? 2.4 : 2;
            if (route.name === 'Home') {
              return <Home color={color} size={22} strokeWidth={stroke} />;
            }
            if (route.name === 'MetaTrader') {
              return <Activity color={color} size={22} strokeWidth={stroke} />;
            }
            return <Settings color={color} size={22} strokeWidth={stroke} />;
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Home',
            tabBarLabel: ({ color }) => (
              <Text style={[styles.label, { color }]}>Home</Text>
            ),
          }}
        />
        <Tab.Screen
          name="MetaTrader"
          component={MetaTraderScreen}
          options={{
            title: 'Scanner',
            tabBarLabel: ({ color }) => (
              <Text style={[styles.label, { color }]}>Scanner</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
            tabBarLabel: ({ color }) => (
              <Text style={[styles.label, { color }]}>Settings</Text>
            ),
            tabBarButton: (props) => {
              const { onPress, style, accessibilityState, children } = props;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={accessibilityState}
                  accessibilityLabel="Settings"
                  onPress={(e) => {
                    handleSettingsTabPress(() => {
                      onPress?.(e);
                    });
                  }}
                  style={style}
                >
                  {children}
                </Pressable>
              );
            },
          }}
        />
      </Tab.Navigator>
      <FloatingAssistant bottomOffset={tabHeight + 12} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.15,
    marginTop: 2,
  },
});
