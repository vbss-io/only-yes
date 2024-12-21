import { EN } from "@/presentation/assets/en";
import { PT } from "@/presentation/assets/pt";
import { useDarkMode } from "@/presentation/hooks/use-dark-mode";
import { CheckCircle } from "@phosphor-icons/react";
import { ReactNode } from "react";
import { useTranslator } from "vbss-translator";
import { Switch } from "vbss-ui";
import * as S from "./styles";

interface LanguageOptions {
  value: string;
  svg: ReactNode;
}

export const Header = () => {
  const { t, language, setLanguage } = useTranslator();
  const { darkMode, setDarkMode } = useDarkMode();

  const languageOptions: LanguageOptions[] = [
    {
      value: "pt",
      svg: <PT />,
    },
    {
      value: "en",
      svg: <EN />,
    },
  ];

  return (
    <S.Nav>
      <S.Container>
        <S.Brand href="/">
          <CheckCircle width="2rem" height="2rem" />
          <span>Only Yes</span>
        </S.Brand>
        <S.Actions>
          <Switch
            variant="primary"
            iconOn="moon"
            iconOff="sun"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />
          <S.DropdownMenu
            trigger={
              <S.Language>
                {languageOptions.find((lang) => lang.value === language)?.svg}
              </S.Language>
            }
            menus={languageOptions
              .filter((lang) => lang.value !== language)
              .map((lang) => ({
                item: (
                  <S.Language onClick={() => setLanguage(lang.value)}>
                    {lang.svg}
                  </S.Language>
                ),
              }))}
          />
          <S.DesktopButton as="a" href="/create">
            {t("Criar Pergunta")}
          </S.DesktopButton>
          <S.MobileButton as="a" href="/create">
            {t("Criar")}
          </S.MobileButton>
        </S.Actions>
      </S.Container>
    </S.Nav>
  );
};
