import { StyleSheet, Text, View } from "react-native";
import * as Animatable from "react-native-animatable";
import Logo from "@/components/logo3";
import { Button } from "react-native-paper";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text>Apresentamos: Blackjack2.0</Text>
      <Text>Clique na imagem para jogar</Text>
      <View style={styles.image}>
        <Animatable.View
          animation="pulse"
          easing="ease-out"
          iterationCount="infinite"
        >
          <Button
            onPress={() =>
              alert("Aqui rola o jogo, mas ainda não está implementado")
            }
          >
            <Logo />{" "}
          </Button>
        </Animatable.View>
      </View>
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
    alignSelf: "center",
    borderRadius: 200 / 2,
    marginTop: 100,
    marginBottom: 40,
  },
});
