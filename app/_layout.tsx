import { AuthProvider } from "@/context/AuthProvider";
import { UserProvider } from "@/context/UserProvider";
import { ReportProvider } from "@/context/ReportProvider";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import "react-native-reanimated";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

//Ampliando o tema padrão
const grayScale = {
  black: "#000000",
  darkGray: "#121212",
  gray: "#808080",
  lightGray: "#d3d3d3",
  white: "#ffffff",
};

// Updated themes with grayscale colors
const themeLight = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: grayScale.black,
    secondary: grayScale.gray,
    tertiary: grayScale.darkGray,
    background: grayScale.white,
    surface: grayScale.lightGray,
    error: "#b00020", // Keeping error color as is
    text: grayScale.black,
    onBackground: grayScale.black,
    onSurface: grayScale.black,
  },
};

const themeDark = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: grayScale.lightGray,
    secondary: grayScale.gray,
    tertiary: grayScale.white,
    background: grayScale.darkGray,
    surface: grayScale.darkGray,
    error: "#cf6679", // Keeping error color as is
    text: grayScale.white,
    onBackground: grayScale.white,
    onSurface: grayScale.white,
  },
};

const temaDoApp = true; //TODO: passar para Context para mudar o tema do app

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <PaperProvider theme={temaDoApp ? themeLight : themeDark}>
      <AuthProvider>
        <UserProvider>
          <ReportProvider>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="signIn" />
              <Stack.Screen name="signUp" />
              <Stack.Screen name="resetPassword" />
              <Stack.Screen name="perfil" />
            </Stack>
          </ReportProvider>
        </UserProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
