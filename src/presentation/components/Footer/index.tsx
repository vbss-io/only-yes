import { GithubLogo, Globe, LinkedinLogo } from "@phosphor-icons/react";
import { useTranslator } from "vbss-translator";
import { Button } from "vbss-ui";
import * as S from "./styles";

export const Footer = () => {
  const { t, language } = useTranslator();

  return (
    <S.Container>
      <S.Text>
        {"Only Yes"}. {t("A")}{" "}
        {language === "pt" ? (
          <>
            {t("project")}{" "}
            <S.Link
              href="https://vbss.io"
              target="_blank"
              rel="noopener noreferrer"
            >
              vbss.io
            </S.Link>
            .
          </>
        ) : (
          <>
            <S.Link
              href="https://vbss.io"
              target="_blank"
              rel="noopener noreferrer"
            >
              vbss.io
            </S.Link>{" "}
            {t("project")}.
          </>
        )}
      </S.Text>
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
