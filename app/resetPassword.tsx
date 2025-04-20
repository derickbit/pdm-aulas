import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useTheme, Button, Text, TextInput } from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useContext } from "react";
import { UserContext } from "@/context/UserProvider";
import LogoTemaDark from "@/components/logo1";
import LogoTemaLight from "@/components/logo2";

const requiredMessage = "Campo obrigatório";

const schema = yup.object().shape({
  senha: yup
    .string()
    .required(requiredMessage)
    .matches(
      /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[$*&@#])[0-9a-zA-Z$*&@#]{8,}$/,
      "A senha deve conter ao menos uma letra maiúscula, uma letra minúscula, um número, um caractere especial e um total de 8 caracteres"
    ),
});

export default function ResetPassword() {
  const theme = useTheme();
  const { changePassword } = useContext(UserContext);
  const [mensagem, setMensagem] = useState("");
  const [mensagemCor, setMensagemCor] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      senha: "",
    },
    resolver: yupResolver(schema),
  });

  async function handleResetPassword(data: { senha: string }) {
    try {
      const result = await changePassword(data.senha);
      setMensagem(result);
      setMensagemCor(
        result === "Senha alterada com sucesso!" ? "green" : theme.colors.error
      );
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      setMensagem("Erro ao redefinir senha. Tente novamente.");
      setMensagemCor(theme.colors.error);
    }
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {theme.dark ? <LogoTemaLight /> : <LogoTemaDark />}
      <Text style={[styles.title, { color: theme.colors.primary }]}>
        Alterar Senha
      </Text>
      <Controller
        control={control}
        name="senha"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Digite sua nova senha"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            secureTextEntry
            autoCapitalize="none"
            mode="outlined"
            label="Nova Senha"
            error={!!errors.senha}
          />
        )}
      />
      {errors.senha && (
        <Text style={{ color: theme.colors.error, marginBottom: 10 }}>
          {errors.senha.message}
        </Text>
      )}
      <Button
        mode="contained"
        onPress={handleSubmit(handleResetPassword)}
        style={{ backgroundColor: theme.colors.primary }}
      >
        <Text style={{ color: theme.colors.onPrimary }}>Alterar Senha</Text>
      </Button>
      {mensagem ? (
        <Text style={{ ...styles.mensagem, color: mensagemCor }}>
          {mensagem}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    color: "#000",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#000",
  },
  input: {
    width: "100%",
    marginBottom: 20,
    color: "#000",
  },
  mensagem: {
    marginTop: 20,
    fontSize: 16,
    color: "#000",
  },
});
