import { useDarkMode } from "@/presentation/hooks/use-dark-mode";
import { CheckCircle } from "@phosphor-icons/react";
import { Switch } from "vbss-ui";
import * as S from "./styles";

export const Header = () => {
  const { darkMode, setDarkMode } = useDarkMode();

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
          <S.Button as="a" href="/create" />
        </S.Actions>
      </S.Container>
    </S.Nav>
  );
};
