/* eslint-disable react-hooks/exhaustive-deps */
import { firestore } from "@/firebase/firebaseinit";
import { Usuario } from "@/model/Usuario";
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthContext, AuthContextType } from "./AuthProvider";
import { updatePassword } from "firebase/auth";

export const UserContext = createContext({});

export const UserProvider = ({ children }: any) => {
  const { userAuth, delAccount } = useContext(AuthContext) as AuthContextType;
  const [userFirebase, setUserFirebase] = useState<Usuario | null>(null);

  useEffect(() => {
    if (userAuth) {
      getUser();
    }
  }, [userAuth]);

  //busca os detalhes do usuário
  async function getUser(): Promise<void> {
    try {
      if (!userAuth.user) {
        return;
      }
      const docSnap = await getDoc(
        doc(firestore, "usuarios", userAuth.user.uid)
      );
      if (docSnap.exists()) {
        let userData = docSnap.data();
        const usuario: Usuario = {
          uid: docSnap.id,
          email: userData.email,
          nome: userData.nome,
          urlFoto: userData.urlFoto,
          curso: userData.curso,
          perfil: userData.perfil,
        };
        setUserFirebase(usuario);
      }
    } catch (e) {
      console.error("UserProvider, getUser: " + e);
    }
  }

  async function update(usuario: Usuario): Promise<string> {
    try {
      await setDoc(doc(firestore, "usuarios", usuario.uid), {
        curso: usuario.curso,
        email: usuario.email,
        nome: usuario.nome,
        perfil: usuario.perfil,
        urlFoto: usuario.urlFoto,
      });
      setUserFirebase(usuario);
      return "ok";
    } catch (e) {
      console.error(e);
      return "Erro ao atualizar o usuário. Contate o suporte.";
    }
  }

  async function del(uid: string): Promise<string> {
    try {
      await deleteDoc(doc(firestore, "usuarios", uid));
      await delAccount(); //TODO: garantir que o login seja recente, menor que 5 minutos, segundo especificação do serviço Authentication
      return "ok";
    } catch (e) {
      console.error(e);
      return "Erro ao excluir a conta. Contate o suporte.";
    }
  }

  async function changePassword(newPassword: string): Promise<string> {
    try {
      if (!userAuth.user) {
        return "Usuário não autenticado.";
      }
      await updatePassword(userAuth.user, newPassword);
      return "Senha alterada com sucesso!";
    } catch (e) {
      console.error("Erro ao alterar senha:", e);
      return "Erro ao alterar a senha. Certifique-se de que o login é recente.";
    }
  }

  return (
    <UserContext.Provider value={{ userFirebase, update, del, changePassword }}>
      {children}
    </UserContext.Provider>
  );
};
