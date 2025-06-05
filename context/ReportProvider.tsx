// ReportProvider.tsx

import { firestore } from "@/firebase/firebaseinit";
import { Report } from "@/model/Report";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  endAt,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  startAt,
  where, // Importar 'where'
} from "firebase/firestore";
import React, { createContext, useEffect, useState, useContext } from "react"; // Importar useContext
import { UserContext } from "./UserProvider"; // Importar UserContext para pegar o usuário logado

export const ReportContext = createContext({});

export const ReportProvider = ({ children }: any) => {
  const [reports, setReports] = useState<Report[]>([]);
  const { userFirebase } = useContext<any>(UserContext); // Obter userFirebase do UserContext

  useEffect(() => {
    // Se não houver usuário logado (ou UID), não faz a busca e limpa a lista de relatórios
    if (!userFirebase?.uid) {
      setReports([]);
      return; // Retorna undefined, que é o esperado para a limpeza do listener
    }

    // Cria a query para buscar relatórios do usuário logado (userFirebase.uid), ordenados por assunto
    const q = query(
      collection(firestore, "reports"),
      where("uid", "==", userFirebase.uid), // <<==== FILTRO POR UID DO USUÁRIO
      orderBy("assunto")
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        if (querySnapshot) {
          let data: Report[] = [];
          querySnapshot.forEach((doc) => {
            data.push(
              new Report(
                doc.id,
                doc.data().uid,
                doc.data().assunto,
                doc.data().texto,
                doc.data().urlFoto
              )
            );
          });
          setReports(data);
        }
      },
      (error) => {
        // Adicionar tratamento de erro para o listener
        console.error("Erro ao buscar relatórios (onSnapshot):", error);
        setReports([]); // Limpar relatórios em caso de erro
      }
    );

    // Função de limpeza para desinscrever o listener quando o componente desmontar ou userFirebase.uid mudar
    return () => {
      unsubscribe();
    };
  }, [userFirebase?.uid]); // Dependência: refaz a query se o UID do usuário mudar

  async function save(report: Report): Promise<string> {
    try {
      // Certifica que o UID está no objeto report.
      // ReportDetalhe.tsx já deve estar garantindo isso ao usar userFirebase.uid.
      if (!report.uid) {
        console.error("Report UID está nulo na função save.");
        return "Erro: UID do usuário não fornecido para salvar o relatório.";
      }

      if (report.id) {
        // Atualizar documento existente
        await setDoc(doc(firestore, "reports", report.id), {
          uid: report.uid,
          assunto: report.assunto,
          texto: report.texto,
          urlFoto: report.urlFoto,
        });
      } else {
        // Adicionar novo documento
        await addDoc(collection(firestore, "reports"), {
          uid: report.uid,
          assunto: report.assunto,
          texto: report.texto,
          urlFoto: report.urlFoto,
        });
      }
      return "ok";
    } catch (error) {
      console.error("Erro em ReportProvider, save: ", error);
      return "Erro ao salvar relatório. Contate o administrador.";
    }
  }

  async function del(id: string): Promise<string> {
    try {
      await deleteDoc(doc(firestore, "reports", id));
      return "ok";
    } catch (error) {
      console.error("Erro em ReportProvider, del: ", error);
      return "Erro ao excluir relatório. Contate o administrador.";
    }
  }

  // ATENÇÃO: Esta função `getReportsByAssunto` ainda faz uma busca GLOBAL por assunto.
  // Se você precisar que ela busque apenas nos relatórios DO USUÁRIO LOGADO por assunto,
  // você precisará adicionar a condição `where("uid", "==", userFirebase.uid)` aqui também.
  async function getReportsByAssunto(assunto: string): Promise<Report[]> {
    // Exemplo de como seria se fosse para filtrar por usuário também:
    // if (!userFirebase?.uid) {
    //   return [];
    // }
    try {
      let data: Report[] = [];
      const ref = collection(firestore, "reports");
      const q = query(
        ref,
        // Se for para filtrar por usuário: where("uid", "==", userFirebase.uid),
        orderBy("assunto"),
        startAt(assunto),
        endAt(assunto + "\uf8ff")
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        data.push(
          new Report(
            doc.id,
            doc.data().uid,
            doc.data().assunto,
            doc.data().texto,
            doc.data().urlFoto
          )
        );
      });
      return data;
    } catch (error) {
      console.error("Erro em ReportProvider, getReportsByAssunto: ", error);
      return [];
    }
  }

  return (
    <ReportContext.Provider value={{ save, del, reports, getReportsByAssunto }}>
      {children}
    </ReportContext.Provider>
  );
};
