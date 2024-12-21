import { registerDependencies } from "@/infra/dependency-injection/Register";
import translations from "@/presentation/assets/translations.json";
import { Footer } from "@/presentation/components/Footer";
import { Header } from "@/presentation/components/Header";
import { Loading } from "@/presentation/components/Loading";
import { Root } from "@/presentation/config/stitches.config";
import { DarkModeProvider } from "@/presentation/contexts/dark-mode-context.tsx";
import { Create } from "@/presentation/pages/Create";
import { Home } from "@/presentation/pages/Home";
import { Redirect } from "@/presentation/pages/Redirect";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { TranslatorProvider } from "vbss-translator";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/create",
    element: <Create />,
  },
  { path: "*", element: <Redirect /> },
]);

function App() {
  registerDependencies();

  return (
    <DarkModeProvider>
      <TranslatorProvider
        translations={translations}
        autoDetectLanguage
        persist
      >
        <Root>
          <Header />
          <RouterProvider router={router} fallbackElement={<Loading />} />
          <Footer />
        </Root>
      </TranslatorProvider>
    </DarkModeProvider>
  );
}

export default App;
