// Reports.tsx

import { ReportContext } from "@/context/ReportProvider";
import { Report } from "@/model/Report";
import { router } from "expo-router";
import { useContext, useState } from "react";
import { ScrollView, StyleSheet, Text as RNText } from "react-native"; // Importe Text do react-native se for usar para a mensagem
import {
  Avatar,
  Card,
  FAB,
  List,
  Searchbar,
  useTheme,
  Text, // Ou use o Text do react-native-paper se preferir
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Reports() {
  const theme = useTheme();
  const { reports, getReportsByAssunto } = useContext<any>(ReportContext);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [reportsSearch, setReportsSearch] = useState<Report[]>([]);
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);

  function irParaTelaReport(report: Report | null) {
    router.push({
      pathname: "/report", // Certifique-se que este é o nome correto da rota para ReportDetalhe
      params: { report: JSON.stringify(report) },
    });
  }

  async function handleSearchSubmit(): Promise<void> {
    const trimmedQuery = searchQuery.trim().toLowerCase();
    if (!trimmedQuery) {
      clearSearch();
      return;
    }
    setIsSearchActive(true);
    // Busca todos os relatórios do usuário
    const allReports = reports; // já filtrados pelo usuário
    // Filtra no JS por substring
    const result = allReports.filter((report: Report) =>
      report.assunto.toLowerCase().includes(trimmedQuery)
    );
    setReportsSearch(result);
  }

  function clearSearch() {
    console.log("[Reports.tsx] clearSearch: Limpando busca.");
    setSearchQuery("");
    setReportsSearch([]);
    setIsSearchActive(false); // <<< IMPORTANTE: Resetar o estado de busca ativa
  }

  return (
    <SafeAreaView
      style={{ ...styles.container, backgroundColor: theme.colors.background }}
    >
      <List.Section
        style={{ ...styles.list, backgroundColor: theme.colors.background }}
      >
        <List.Subheader style={styles.subhearder}>
          Lista de Relatórios
        </List.Subheader>
        <Searchbar
          style={{
            ...styles.searchBar,
            backgroundColor: theme.colors.background,
          }}
          onChangeText={(query) => setSearchQuery(query)}
          onSubmitEditing={handleSearchSubmit}
          onClearIconPress={clearSearch} // Chamará a função corrigida
          value={searchQuery}
          placeholder="Buscar por assunto"
        />
        <ScrollView>
          {isSearchActive ? ( // Se uma busca está ativa
            reportsSearch.length > 0 ? ( // E há resultados para a busca
              reportsSearch.map((report: Report, key: number) => (
                <Card
                  key={key}
                  style={{
                    ...styles.card,
                    borderColor: theme.colors.secondary,
                  }}
                  onPress={() => irParaTelaReport(report)}
                >
                  <Card.Title
                    title={report.assunto}
                    subtitle={
                      report.texto.length > 50
                        ? `${report.texto.substring(0, 50)}...`
                        : report.texto
                    }
                    left={() => (
                      <Avatar.Image
                        size={40}
                        source={
                          report.urlFoto && report.urlFoto.trim() !== ""
                            ? { uri: report.urlFoto }
                            : require("../../assets/images/logo512.png")
                        }
                      />
                    )}
                  />
                </Card>
              ))
            ) : (
              // Busca ativa, mas sem resultados
              <Text style={styles.emptyMessage}>
                Nenhum relatório encontrado para "{searchQuery}".
              </Text>
            )
          ) : // Nenhuma busca ativa, mostrar a lista principal de relatórios do usuário
          reports.length > 0 ? (
            reports.map((report: Report, key: number) => (
              <Card
                key={key}
                style={{ ...styles.card, borderColor: theme.colors.secondary }}
                onPress={() => irParaTelaReport(report)}
              >
                <Card.Title
                  title={report.assunto}
                  subtitle={
                    report.texto.length > 50
                      ? `${report.texto.substring(0, 50)}...`
                      : report.texto
                  }
                  left={() => (
                    <Avatar.Image
                      size={40}
                      source={
                        report.urlFoto && report.urlFoto.trim() !== ""
                          ? { uri: report.urlFoto }
                          : require("../../assets/images/logo512.png")
                      }
                    />
                  )}
                />
              </Card>
            ))
          ) : (
            // Lista principal de relatórios do usuário está vazia
            <Text style={styles.emptyMessage}>
              Você ainda não possui relatórios.
            </Text>
          )}
        </ScrollView>
      </List.Section>
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => irParaTelaReport(null)}
      />
    </SafeAreaView>
  );
}

// Adicione o estilo para emptyMessage se ainda não o fez
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  subhearder: {
    fontSize: 20,
    alignSelf: "center",
  },
  list: {
    width: "95%",
  },
  card: {
    height: 100,
    width: "100%",
    borderWidth: 1,
    marginBottom: 10,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
  searchBar: {
    marginBottom: 10,
    borderWidth: 1,
  },
  emptyMessage: {
    // Estilo para mensagens de feedback
    textAlign: "center",
    paddingVertical: 20,
    fontSize: 16,
    color: "gray", // Ou use theme.colors.onSurfaceDisabled ou similar
  },
});
