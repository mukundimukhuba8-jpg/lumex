import React, { useCallback, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Activity, Home, Settings } from 'lucide-react-native';
import { useSession } from '../context/SessionContext';
import { useTheme } from '../context/ThemeContext';
import { HomeScreen } from '../screens/HomeScreen';
import { MetaTraderScreen } from '../screens/MetaTraderScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

export type RootTabParamList = {
  Home: undefined;
  MetaTrader: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const TRIPLE_MS = 450;

/** Client app only — never mounts Super Admin UI */
export function ClientTabs() {
  const { colors } = useTheme();
  const { enterAdmin } = useSession();
  const clicks = useRef({ count: 0, timer: null as ReturnType<typeof setTimeout> | null });

  const onSettingsPress = useCallback(
    (navigate: () => void) => {
      const state = clicks.current;
      state.count += 1;
      if (state.timer) clearTimeout(state.timer);

      if (state.count >= 3) {
        state.count = 0;
        state.timer = null;
        // Leave client app session completely
        enterAdmin();
        return;
      }

      state.timer = setTimeout(() => {
        state.count = 0;
        state.timer = null;
      }, TRIPLE_MS);
      navigate();
    },
    [enterAdmin],
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: 'rgba(245,247,250,0.45)',
          tabBarStyle: [
            styles.tabBar,
            { shadowColor: colors.shadow, borderColor: colors.glassBorder },
          ],
          tabBarBackground: () => (
            <View style={[styles.tabBg, { backgroundColor: colors.surfaceSolid }]}>
              <BlurView intensity={45} tint="dark" style={StyleSheet.absoluteFill} />
              <View style={[styles.tabStroke, { borderColor: colors.border }]} />
            </View>
          ),
          tabBarIcon: ({ color, focused }) => {
            const size = 21;
            if (route.name === 'Home') return <Home color={color} size={size} strokeWidth={focused ? 2.5 : 2} />;
            if (route.name === 'MetaTrader') return <Activity color={color} size={size} strokeWidth={focused ? 2.5 : 2} />;
            return <Settings color={color} size={size} strokeWidth={focused ? 2.5 : 2} />;
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: ({ color }) => <Text style={[styles.label, { color }]}>HOME</Text>,
          }}
        />
        <Tab.Screen
          name="MetaTrader"
          component={MetaTraderScreen}
          options={{
            title: 'Scanner',
            tabBarLabel: ({ color }) => <Text style={[styles.label, { color }]}>SCANNER</Text>,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: ({ color }) => <Text style={[styles.label, { color }]}>SETTINGS</Text>,
            tabBarButton: (props) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Settings"
                accessibilityState={props.accessibilityState}
                onPress={(e) => onSettingsPress(() => props.onPress?.(e))}
                style={props.style}
              >
                {props.children}
              </Pressable>
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  tabBar: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 16,
    height: 74,
    borderRadius: 30,
    borderTopWidth: 0,
    borderWidth: 1,
    backgroundColor: 'transparent',
    elevation: 0,
    paddingTop: 8,
    paddingBottom: 10,
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  tabBg: {
    ...StyleSheet.absoluteFill,
    borderRadius: 30,
    overflow: 'hidden',
    opacity: 0.94,
  },
  tabStroke: {
    ...StyleSheet.absoluteFill,
    borderRadius: 30,
    borderWidth: 1,
  },
  label: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 2,
  },
});
