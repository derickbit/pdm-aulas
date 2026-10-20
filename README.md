# PDM Aulas

Aplicativo mobile feito em **React Native com Expo** durante a disciplina de Programação para Dispositivos Móveis (TADS, IFSul). O app tem cadastro e login de usuários, perfil com foto e um módulo de **reports** (relatos com assunto, texto e foto), tudo integrado ao **Firebase**.

## Funcionalidades

- **Autenticação** com Firebase Auth: cadastro, login, recuperação de senha por e-mail e troca de senha.
- **Perfil do usuário** com nome, curso (CSTSI ou CSBD), tipo de perfil (Aluno, Professor ou Empresa) e foto enviada ao Firebase Storage.
- **Reports**: criar, listar, editar e excluir relatos com assunto, texto e foto escolhida na galeria, salvos no Firestore.
- **Validação de formulários** com react-hook-form e yup, com mensagens de erro em português.
- **Tratamento dos erros do Firebase** traduzidos para mensagens que o usuário entende.
- **Navegação por abas** (Home, Reports e Menu) com rotas baseadas em arquivos.

A tela Home é um espaço reservado para o jogo Blackjack 2.0, ainda não integrado a este app. O jogo completo roda no [CardNest](https://card-nest.vercel.app).

## Tecnologias

- React Native 0.76, Expo 52 e Expo Router
- TypeScript
- Firebase: Authentication, Firestore e Storage
- react-hook-form, yup e React Native Paper
- Context API para o estado global (`AuthProvider`, `UserProvider` e `ReportProvider`)

## Estrutura

```
app/          # Telas e rotas (Expo Router)
components/   # Componentes reutilizáveis
context/      # Providers de autenticação, usuário e reports
model/        # Classes e enums (Usuario, Report, Curso, Perfil)
firebase/     # Inicialização do Firebase
```

## Como rodar

1. Clone o repositório e instale as dependências:

   ```bash
   git clone https://github.com/derickbit/pdm-aulas.git
   cd pdm-aulas
   npm install
   ```

2. Crie um projeto no [Firebase](https://console.firebase.google.com) e ative **Authentication** (e-mail e senha), **Firestore** e **Storage**.

3. Crie o arquivo `firebase/firebaseConfig.ts` com as credenciais do seu app web. Ele está no `.gitignore` e não é versionado:

   ```ts
   export const firebaseConfig = {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "...",
   };
   ```

4. Inicie o app:

   ```bash
   npx expo start
   ```

   Abra no Expo Go, no emulador Android ou no navegador.

## Autor

**Dérick Bitencourte da Silva** · [GitHub](https://github.com/derickbit) · [LinkedIn](https://www.linkedin.com/in/derick-bitencourte-da-silva/)
