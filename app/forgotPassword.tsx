import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useTheme, Button, Text, TextInput } from "react-native-paper";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthProvider";
import LogoTemaDark from "@/components/logo1";
import LogoTemaLight from "@/components/logo2";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const requiredMessage = "Campo obrigatório";

const schema = yup.object().shape({
  email: yup
    .string()
    .required(requiredMessage)
    .matches(/\S+@\S+\.\S+/, "Email inválido"),
});

export default function ForgotPassword() {
  const theme = useTheme();
  const { recuperaSenha } = useContext<any>(AuthContext);
  const [mensagem, setMensagem] = useState("");
  const [mensagemCor, setMensagemCor] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
    },
    resolver: yupResolver(schema),
  });

  async function handleRecuperarSenha(data: { email: string }) {
    const response = await recuperaSenha(data.email);
    if (response === "Um email para redefinição de senha foi enviado.") {
      setMensagem(response);
      setMensagemCor("green"); // Mensagem em verde
    } else {
      setMensagem(response);
      setMensagemCor(theme.colors.error);
    }
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {theme.dark ? <LogoTemaLight /> : <LogoTemaDark />}
      <Text style={[styles.title, { color: theme.colors.primary }]}>
        Recuperação de senha
      </Text>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Digite seu email"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            keyboardType="email-address"
            autoCapitalize="none"
            mode="outlined"
            label="Email"
            error={!!errors.email}
          />
        )}
      />
      {errors.email && (
        <Text style={{ color: theme.colors.error, marginBottom: 10 }}>
          {errors.email.message}
        </Text>
      )}
      <Button
        mode="contained"
        onPress={handleSubmit(handleRecuperarSenha)}
        style={{ backgroundColor: theme.colors.primary }}
      >
        <Text style={{ color: theme.colors.onPrimary }}>Recuperar senha</Text>
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
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    marginBottom: 20,
  },
  mensagem: {
    marginTop: 20,
    fontSize: 16,
  },
});
