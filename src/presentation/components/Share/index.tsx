import { Copy } from "@phosphor-icons/react";
import { useState } from "react";
import { useTranslator } from "vbss-translator";
import { Input } from "vbss-ui";
import * as S from "./styles";

interface ShareProps {
  code: string;
}

export const Share = ({ code }: ShareProps) => {
  const { t } = useTranslator();
  const locationHref = window.location.href;
  const linkToShare = `${locationHref.replace("/create", "")}/${code}`;
  const [inputValue, setInputValue] = useState(linkToShare);

  const handleCopyQuestionLink = () => {
    navigator.clipboard.writeText(linkToShare);
  };

  return (
    <S.Container>
      <Input
        rounded="full"
        value={inputValue}
        buttonProps={{
          children: <Copy color="white" width="1.3rem" height="1.3rem" />,
          onClick: () => {
            handleCopyQuestionLink();
            setInputValue(t("Copiado!"));
          },
        }}
      />
    </S.Container>
  );
};
