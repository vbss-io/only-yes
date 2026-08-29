import { drawReceipt } from "@/presentation/chase/receipt";
import { DownloadSimple, ShareNetwork, Ticket } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useTranslator } from "vbss-translator";
import * as S from "./styles";

interface ReceiptProps {
  question: string;
  noAttempts: number;
  durationMs: number;
}

const titleForAttempts = (attempts: number): string => {
  if (attempts === 0) return "Sim de primeira";
  if (attempts <= 4) return "Resistência simbólica";
  if (attempts <= 14) return "Lutou mas caiu";
  if (attempts <= 29) return "Teimosia certificada";
  return "Recorde de fuga";
};

export const Receipt = ({ question, noAttempts, durationMs }: ReceiptProps) => {
  const { t } = useTranslator();
  const [imageUrl, setImageUrl] = useState("");
  const [canShare] = useState(
    () => typeof navigator.share === "function"
  );

  const seconds = Math.max(1, Math.round(durationMs / 1000));
  const attemptsLabel =
    noAttempts === 0
      ? t("Nem tentei fugir")
      : `${t("Tentei fugir")} ${noAttempts}x`;
  const durationLabel = `${seconds}s ${t("de resistência")}`;

  useEffect(() => {
    const canvas = document.createElement("canvas");
    drawReceipt(canvas, {
      brand: "Only Yes",
      question,
      title: t(titleForAttempts(noAttempts)),
      attemptsLabel,
      durationLabel,
      footer: t("crie a sua em"),
      site: "yes.vbss.io",
    });
    setImageUrl(canvas.toDataURL("image/png"));
  }, [question, noAttempts, durationMs]);

  const buildFile = async (): Promise<File> => {
    const blob = await (await fetch(imageUrl)).blob();
    return new File([blob], "only-yes-receipt.png", { type: "image/png" });
  };

  const handleShare = async (): Promise<void> => {
    try {
      const file = await buildFile();
      const payload = { files: [file], url: "https://www.yes.vbss.io" };
      if (navigator.canShare && !navigator.canShare(payload)) {
        await navigator.share({ url: "https://www.yes.vbss.io" });
        return;
      }
      await navigator.share(payload);
    } catch {
      return;
    }
  };

  const handleDownload = (): void => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "only-yes-receipt.png";
    link.click();
  };

  if (!imageUrl) return null;

  return (
    <S.Container>
      <S.Modal
        rounded="lg"
        title={t("Seu recibo do Sim")}
        trigger={
          <S.OpenButton>
            <Ticket width="1.1rem" height="1.1rem" />
            {t("Ver recibo do Sim")}
          </S.OpenButton>
        }
        footer={
          <S.Actions>
            {canShare && (
              <S.ActionButton rounded="full" onClick={handleShare}>
                <ShareNetwork width="1.1rem" height="1.1rem" />
                {t("Compartilhar")}
              </S.ActionButton>
            )}
            <S.ActionButton rounded="full" onClick={handleDownload}>
              <DownloadSimple width="1.1rem" height="1.1rem" />
              {t("Baixar")}
            </S.ActionButton>
          </S.Actions>
        }
      >
        <S.Image src={imageUrl} alt={t("Recibo do Sim")} />
      </S.Modal>
    </S.Container>
  );
};
