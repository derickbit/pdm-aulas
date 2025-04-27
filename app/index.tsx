/* eslint-disable react-hooks/exhaustive-deps */
import { AuthContext } from "@/context/AuthProvider";
import { router } from "expo-router";
import { useContext, useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import LogoTemaDark from "@/components/logo1";
import * as Animatable from "react-native-animatable";

export default function PreloadScreen() {
  const theme = useTheme();
  const { recuperaCredencialdaCache, signIn } = useContext<any>(AuthContext);

  useEffect(() => {
    //ao montar o componente tenta logar com as credenciais da cache
    logar();
  }, []);

  async function logar() {
    const credencial = await recuperaCredencialdaCache("credencial");
    if (credencial) {
      const mensagem = await signIn({
        email: credencial.email,
        senha: credencial.senha,
      });

      if (mensagem === "ok") {
        router.replace("/home");
      } else {
        router.replace("/signIn");
      }
    } else {
      // If no credentials are found, redirect to the sign-in screen
      router.replace("/signIn");
    }
  }

  return (
    <View
      style={{ ...styles.container, backgroundColor: theme.colors.background }}
    >
      <View style={styles.image}>
        <Animatable.View animation="tada" duration={1500}>
          <LogoTemaDark />
        </Animatable.View>
      </View>
      {/* <Image
        style={styles.imagem}
        source={require("../assets/images/blackjack2.2.svg")}
        accessibilityLabel="logo do app"
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    justifyContent: "center", // Center vertically
    alignItems: "center", // Center horizontally
    width: 250,
    height: 250,
  },
});
