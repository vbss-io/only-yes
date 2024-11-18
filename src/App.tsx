import { registerDependencies } from "@/infra/dependency-injection/Register";
import { Footer } from "@/presentation/components/Footer";
import { Header } from "@/presentation/components/Header";
import { Loading } from "@/presentation/components/Loading";
import { Root } from "@/presentation/config/stitches.config";
import { DarkModeProvider } from "@/presentation/contexts/dark-mode-context.tsx";
import { Create } from "@/presentation/pages/Create";
import { Home } from "@/presentation/pages/Home";
import { Redirect } from "@/presentation/pages/Redirect";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

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
      <Root>
        <Header />
        <RouterProvider router={router} fallbackElement={<Loading />} />
        <Footer />
      </Root>
    </DarkModeProvider>
  );
}

export default App;
