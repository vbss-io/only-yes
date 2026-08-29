import { ChartBar, Copy, ShareNetwork } from "@phosphor-icons/react";
import { useState } from "react";
import { useTranslator } from "vbss-translator";
import { Input } from "vbss-ui";
import * as S from "./styles";

interface ShareProps {
  code: string;
  statsKey?: string;
}

export const Share = ({ code, statsKey }: ShareProps) => {
  const { t } = useTranslator();
  const publicLink = `${window.location.origin}/${code}`;
  const statsLink = statsKey
    ? `${window.location.origin}/stats/${code}#${statsKey}`
    : "";
  const [publicValue, setPublicValue] = useState(publicLink);
  const [statsValue, setStatsValue] = useState(statsLink);
  const canNativeShare = typeof navigator.share === "function";

  const copyToClipboard = (value: string): void => {
    navigator.clipboard.writeText(value);
  };

  const handleNativeShare = async (): Promise<void> => {
    try {
      await navigator.share({
        title: "Only Yes",
        text: t("Tenho uma pergunta importante pra você…"),
        url: publicLink,
      });
    } catch {
      return;
    }
  };

  return (
    <S.Container>
      <div>
        <S.Label>{t("Link público pra compartilhar")}</S.Label>
        <Input
          rounded="full"
          value={publicValue}
          buttonProps={{
            children: <Copy color="white" width="1.3rem" height="1.3rem" />,
            onClick: () => {
              copyToClipboard(publicLink);
              setPublicValue(t("Copiado!"));
            },
          }}
        />
      </div>
      {canNativeShare && (
        <S.ShareButton rounded="full" onClick={handleNativeShare}>
          <ShareNetwork color="white" width="1.2rem" height="1.2rem" />
          {t("Compartilhar")}
        </S.ShareButton>
      )}
      {statsKey && (
        <div>
          <S.Label>
            <ChartBar width="1rem" height="1rem" />
            {t("Link secreto: acompanhe as respostas")}
          </S.Label>
          <Input
            rounded="full"
            value={statsValue}
            buttonProps={{
              children: <Copy color="white" width="1.3rem" height="1.3rem" />,
              onClick: () => {
                copyToClipboard(statsLink);
                setStatsValue(t("Copiado!"));
              },
            }}
          />
          <S.Hint>
            {t("Guarde este link — sem ele não dá pra recuperar os stats.")}
          </S.Hint>
        </div>
      )}
    </S.Container>
  );
};
