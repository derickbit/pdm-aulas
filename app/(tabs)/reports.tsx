import { ReportContext } from "@/context/ReportProvider";
import { Report } from "@/model/Report";
import { router } from "expo-router";
import { useContext, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import {
  Avatar,
  Card,
  FAB,
  List,
  Searchbar,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Reports() {
  const theme = useTheme();
  const { reports, getReportsByAssunto } = useContext<any>(ReportContext);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [reportsSearch, setReportsSearch] = useState<Report[]>([]);

  function irParaTelaReport(report: Report | null) {
    router.push({
      pathname: "/report",
      params: { report: JSON.stringify(report) },
    });
  }

  async function SearchQuery(): Promise<void> {
    const result = await getReportsByAssunto(searchQuery);
    if (result.length > 0) {
      setReportsSearch(result);
    }
  }

  function clearSearch() {
    setSearchQuery("");
    setReportsSearch([]);
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
          onSubmitEditing={SearchQuery}
          onClearIconPress={clearSearch}
          value={searchQuery}
          placeholder="Buscar por assunto"
        />
        <ScrollView>
          {reportsSearch.length > 0
            ? reportsSearch.map((report: Report, key: number) => (
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
                        source={{ uri: report.urlFoto }}
                      />
                    )}
                  />
                </Card>
              ))
            : reports.map((report: Report, key: number) => (
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
                        source={{ uri: report.urlFoto }}
                      />
                    )}
                  />
                </Card>
              ))}
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
});
