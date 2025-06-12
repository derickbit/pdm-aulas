// ReportDetalhe.tsx

import { ReportContext } from "@/context/ReportProvider";
import { Report } from "@/model/Report";
import { yupResolver } from "@hookform/resolvers/yup";
import { router, useLocalSearchParams } from "expo-router";
import { useContext, useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { Button, Dialog, Text, TextInput, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import * as yup from "yup";
import * as ImagePicker from "expo-image-picker";
import { AuthContext } from "@/context/AuthProvider";
import { UserContext } from "@/context/UserProvider";

const requiredMessage = "Campo obrigatório";
const schema = yup.object().shape({
  assunto: yup
    .string()
    .required(requiredMessage)
    .min(2, "O assunto deve ter ao menos 2 caracteres"),
  texto: yup
    .string()
    .required(requiredMessage)
    .min(10, "O texto deve ter ao menos 10 caracteres"),
});

export default function ReportDetalhe() {
  const theme = useTheme();
  const { sendImageToStorage } = useContext<any>(AuthContext);
  const { userFirebase } = useContext<any>(UserContext);
  const { report: reportString } = useLocalSearchParams();

  // Parse reportParam uma vez para evitar múltiplas chamadas de JSON.parse
  const [parsedReportParam, setParsedReportParam] = useState<Report | null>(
    null
  );

  useEffect(() => {
    if (reportString) {
      try {
        setParsedReportParam(JSON.parse(reportString.toString()));
      } catch (e) {
        console.error("Erro ao parsear reportString:", e);
        setParsedReportParam(null);
      }
    } else {
      setParsedReportParam(null);
    }
  }, [reportString]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<{ assunto: string; texto: string }>({
    // <-- aqui
    defaultValues: {
      assunto: "",
      texto: "",
    },
    mode: "onSubmit",
    resolver: yupResolver(schema),
  });

  // Estado para a URL da imagem a ser exibida/salva
  // Inicializa com undefined, será populado no useEffect
  const [urlDevice, setUrlDevice] = useState<string | undefined>(undefined);

  const [requisitando, setRequisitando] = useState(false);
  const [atualizando, setAtualizando] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: "", mensagem: "" });
  const [dialogErroVisivel, setDialogErroVisivel] = useState(false);
  const [dialogExcluirVisivel, setDialogExcluirVisivel] = useState(false);
  const { save, del } = useContext<any>(ReportContext);
  const [excluindo, setExcluindo] = useState(false);

  // Efeito para popular o formulário e a urlDevice quando parsedReportParam estiver disponível
  useEffect(() => {
    reset({
      assunto: parsedReportParam?.assunto || "",
      texto: parsedReportParam?.texto || "",
    });
    // Só atualiza urlDevice se ainda não houver uma imagem selecionada (ex: ao abrir o form)
    setUrlDevice((prev) =>
      prev === undefined ? parsedReportParam?.urlFoto ?? undefined : prev
    );
  }, [parsedReportParam, reset]);

  async function salvar(value: Pick<Report, "assunto" | "texto">) {
    console.log("Função salvar chamada!", value);
    try {
      setRequisitando(true);
      setAtualizando(true);

      if (!userFirebase?.uid) {
        setMensagem({
          tipo: "erro",
          mensagem: "Usuário não identificado. Faça login novamente.",
        });
        setDialogErroVisivel(true);
        // Limpar estados de requisição
        setRequisitando(false);
        setAtualizando(false);
        return;
      }

      const reportData: Report = {
        id: parsedReportParam?.id ?? "", // nunca null, use string vazia se não houver
        uid: userFirebase.uid,
        assunto: value.assunto,
        texto: value.texto,
        urlFoto: urlDevice ?? "",
      };
      console.log("Salvando report:", reportData);

      const msg = await save(reportData);
      if (msg === "ok") {
        setMensagem({
          tipo: "ok",
          mensagem: "Relatório salvo com sucesso!",
        });
      } else {
        setMensagem({ tipo: "erro", mensagem: msg });
      }
      setDialogErroVisivel(true);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setMensagem({ tipo: "erro", mensagem: "Erro ao salvar relatório." });
      setDialogErroVisivel(true);
    } finally {
      setRequisitando(false);
      setAtualizando(false);
    }
  }

  async function handleImageUpload(localUri: string) {
    try {
      if (!userFirebase?.uid) {
        alert("Você precisa estar logado para enviar imagens");
        return;
      }
      const storagePath = `reports/${userFirebase.uid}/${Date.now()}`;
      const newUrl = await sendImageToStorage(localUri, storagePath);

      console.log("URL da imagem enviada:", newUrl); // <-- Adicione este log

      if (newUrl) {
        setUrlDevice(newUrl);
      } else {
        alert("Erro ao enviar a imagem. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      alert("Erro ao enviar imagem. Tente novamente.");
    }
  }

  async function excluirReport() {
    setDialogExcluirVisivel(false);
    setRequisitando(true);
    setExcluindo(true);
    try {
      // Usando parsedReportParam que já está no seu estado
      if (!parsedReportParam?.id) {
        setMensagem({
          tipo: "erro",
          mensagem: "ID do relatório não encontrado.",
        });
        setDialogErroVisivel(true);
        setRequisitando(false);
        setExcluindo(false);
        return;
      }

      const msg = await del(parsedReportParam.id);

      if (msg === "ok") {
        setMensagem({
          tipo: "ok",
          mensagem: "Relatório excluído com sucesso!",
        });
      } else {
        setMensagem({ tipo: "erro", mensagem: msg });
      }
      setDialogErroVisivel(true);
    } catch (error) {
      console.error("Erro ao excluir:", error);
      setMensagem({ tipo: "erro", mensagem: "Erro ao excluir relatório." });
      setDialogErroVisivel(true);
    } finally {
      setRequisitando(false);
      setExcluindo(false);
    }
  }

  function avisarDaExclusaoPermanenteDoRegistro() {
    setDialogExcluirVisivel(true);
  }

  async function buscaNaGaleria() {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Precisamos de permissão para acessar a galeria");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.canceled && result.assets && result.assets[0].uri) {
        await handleImageUpload(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Erro na galeria:", error);
      alert("Erro ao acessar a galeria");
    }
  }

  async function tiraFoto() {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        alert("Precisamos de permissão para acessar a câmera");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.canceled && result.assets && result.assets[0].uri) {
        await handleImageUpload(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Erro na câmera:", error);
      alert("Erro ao acessar a câmera");
    }
  }

  return (
    <SafeAreaView
      style={{ ...styles.container, backgroundColor: theme.colors.background }}
    >
      <ScrollView>
        <>
          <Image
            style={styles.image}
            source={
              urlDevice && urlDevice.trim() !== ""
                ? { uri: urlDevice + "?t=" + Date.now() }
                : require("../assets/images/logo512.png")
            }
          />
          {/* ... O restante do seu JSX (botões de imagem, inputs, etc.) ... */}
          <View style={styles.divButtonsImage}>
            <Button
              style={styles.buttonImage}
              mode="outlined"
              icon="image"
              onPress={buscaNaGaleria}
              disabled={requisitando}
            >
              Galeria
            </Button>
            <Button
              style={styles.buttonImage}
              mode="outlined"
              icon="camera"
              onPress={tiraFoto}
              disabled={requisitando}
            >
              Foto
            </Button>
          </View>

          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.textinput}
                label="Assunto"
                placeholder="Digite o assunto do relatório"
                mode="outlined"
                autoCapitalize="words"
                returnKeyType="next"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                right={<TextInput.Icon icon="text-box" />}
                disabled={requisitando}
              />
            )}
            name="assunto"
          />
          {errors.assunto && (
            <Text style={{ ...styles.textError, color: theme.colors.error }}>
              {errors.assunto?.message?.toString()}
            </Text>
          )}

          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.textinput, { height: 150 }]}
                label="Texto"
                placeholder="Descreva o relatório detalhadamente"
                mode="outlined"
                multiline
                numberOfLines={5}
                autoCapitalize="sentences"
                returnKeyType="next"
                keyboardType="default"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                right={<TextInput.Icon icon="pencil" />}
                disabled={requisitando}
              />
            )}
            name="texto"
          />
          {errors.texto && (
            <Text style={{ ...styles.textError, color: theme.colors.error }}>
              {errors.texto?.message?.toString()}
            </Text>
          )}

          <Button
            style={styles.button}
            mode="contained"
            onPress={handleSubmit(salvar as any)}
            loading={requisitando && atualizando}
            disabled={requisitando}
          >
            {!atualizando ? "Salvar" : "Salvando..."}
          </Button>

          {parsedReportParam?.id && (
            <Button
              style={styles.buttonOthers}
              mode="outlined"
              onPress={avisarDaExclusaoPermanenteDoRegistro}
              loading={requisitando && excluindo}
              disabled={requisitando}
              textColor={theme.colors.error}
            >
              {!excluindo ? "Excluir" : "Excluindo..."}
            </Button>
          )}
        </>
      </ScrollView>

      {/* ... (Seus Dialogs) ... */}
      <Dialog
        visible={dialogExcluirVisivel}
        onDismiss={() => setDialogExcluirVisivel(false)}
      >
        <Dialog.Icon icon="alert" size={48} />
        <Dialog.Title style={styles.textDialog}>Atenção!</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium" style={{ textAlign: "center" }}>
            Tem certeza que deseja excluir este relatório permanentemente?
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setDialogExcluirVisivel(false)}>
            Cancelar
          </Button>
          <Button onPress={excluirReport} textColor={theme.colors.error}>
            Excluir
          </Button>
        </Dialog.Actions>
      </Dialog>

      <Dialog
        visible={dialogErroVisivel}
        onDismiss={() => {
          setDialogErroVisivel(false);
          if (mensagem.tipo === "ok") {
            router.back();
          }
        }}
      >
        <Dialog.Icon
          icon={mensagem.tipo === "ok" ? "check-circle" : "alert-circle"}
          size={48}
          color={
            mensagem.tipo === "ok" ? theme.colors.primary : theme.colors.error
          }
        />
        <Dialog.Title style={styles.textDialog}>
          {mensagem.tipo === "ok" ? "Sucesso" : "Erro"}
        </Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium" style={{ textAlign: "center" }}>
            {mensagem.mensagem}
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button
            onPress={() => {
              setDialogErroVisivel(false);
              if (mensagem.tipo === "ok") {
                router.back();
              }
            }}
          >
            OK
          </Button>
        </Dialog.Actions>
      </Dialog>
    </SafeAreaView>
  );
}

// Seus estilos (styles) permanecem os mesmos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  image: {
    width: 180,
    height: 180,
    alignSelf: "center",
    borderRadius: 180 / 2,
    marginTop: 50,
    backgroundColor: "#e0e0e0",
  },
  textinput: {
    width: 350,
    marginTop: 20,
    backgroundColor: "transparent",
  },
  textError: {
    width: 350,
    marginTop: 5,
    marginLeft: 10,
  },
  button: {
    marginTop: 40,
    width: 350,
  },
  divButtonsImage: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: 350,
    alignSelf: "center",
    marginTop: 15,
    marginBottom: 20,
  },
  buttonImage: {
    width: "48%",
  },
  textDialog: {
    textAlign: "center",
  },
  buttonOthers: {
    marginTop: 20,
    marginBottom: 30,
    width: 350,
  },
});
