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
    reset, // Obter a função reset do useForm
  } = useForm<Report>({
    // defaultValues serão setadas no useEffect abaixo quando parsedReportParam estiver pronto
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
    if (parsedReportParam) {
      console.log("ReportParam carregado:", parsedReportParam);
      reset({
        // Popula os campos do formulário
        assunto: parsedReportParam.assunto || "",
        texto: parsedReportParam.texto || "",
      });
      // Define a urlDevice com a urlFoto do relatório, ou undefined se não houver
      // Isso garante que se urlFoto for null/undefined, urlDevice será undefined, não ""
      setUrlDevice(parsedReportParam.urlFoto ?? undefined);
    } else {
      // Se não houver parsedReportParam (ex: criando novo), reseta o formulário e urlDevice
      reset({ assunto: "", texto: "" });
      setUrlDevice(undefined);
    }
  }, [parsedReportParam, reset]); // Executa quando parsedReportParam ou reset mudam

  async function salvar(value: Pick<Report, "assunto" | "texto">) {
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
        id: parsedReportParam?.id || null,
        uid: userFirebase.uid,
        assunto: value.assunto,
        texto: value.texto,
        // Salva a urlDevice (que pode ser uma nova URL ou a original).
        // Se urlDevice for undefined (nenhuma imagem nova ou original), salva uma string vazia.
        urlFoto: urlDevice ?? "",
      };

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

      if (newUrl) {
        setUrlDevice(newUrl); // Atualiza urlDevice com a nova URL da imagem enviada
      } else {
        alert("Erro ao enviar a imagem. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      alert("Erro ao enviar imagem. Tente novamente.");
    }
  }

  // ... (restante das suas funções: excluirReport, avisarDaExclusaoPermanenteDoRegistro, buscaNaGaleria, tiraFoto) ...
  // Essas funções não precisam de alteração para este problema específico.

  return (
    <SafeAreaView
      style={{ ...styles.container, backgroundColor: theme.colors.background }}
    >
      <ScrollView>
        <>
          <Image
            style={styles.image}
            source={
              // Se urlDevice tiver uma URL válida (não undefined, não null, não string vazia), usa ela.
              // Caso contrário, usa a imagem placeholder.
              urlDevice && urlDevice.trim() !== ""
                ? { uri: urlDevice }
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
