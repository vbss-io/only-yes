import { GithubLogo, Globe, LinkedinLogo } from "@phosphor-icons/react";
import { useTranslator } from "vbss-translator";
import { Button } from "vbss-ui";
import * as S from "./styles";

export const Footer = () => {
  const { t } = useTranslator();
  return (
    <S.Container>
      <S.CreatedBy>
        {t("Criado por")}
        <a href="https://vbss.io" target="_blank">
          Vitor Bastos
        </a>
      </S.CreatedBy>
      <S.ContactContainer>
        <Button
          size="icon-md"
          rounded="full"
          onClick={() => window.open("https://vbss.io", "_blank")}
        >
          <Globe color="white" width="1.3rem" height="1.3rem" />
        </Button>
        <Button
          size="icon-md"
          rounded="full"
          onClick={() => window.open("https://github.com/vbss-io", "_blank")}
        >
          <GithubLogo color="white" width="1.3rem" height="1.3rem" />
        </Button>
        <Button
          size="icon-md"
          rounded="full"
          onClick={() =>
            window.open("https://www.linkedin.com/in/vbss-io", "_blank")
          }
        >
          <LinkedinLogo color="white" width="1.25rem" height="1.25rem" />
        </Button>
      </S.ContactContainer>
    </S.Container>
  );
};
