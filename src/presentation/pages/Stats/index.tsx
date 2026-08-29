import { GetQuestionStats } from "@/application/usecases/GetQuestionStats";
import { QuestionStats } from "@/domain/models/QuestionStats";
import {
  listCreatedQuestions,
  type CreatedQuestion,
} from "@/infra/storage/CreatedQuestions";
import { Loading } from "@/presentation/components/Loading";
import { useNoIndex } from "@/presentation/hooks/use-no-index";
import { htmlToText } from "@/presentation/utils/html-text";
import { ArrowsClockwise } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useTranslator } from "vbss-translator";
import * as S from "./styles";

type LoadState = "loading" | "ready" | "forbidden" | "not-found" | "error";

const formatRelative = (iso: string, nowLabel: string): string => {
  const elapsedMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(elapsedMs / 60000);
  if (minutes < 1) return nowLabel;
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
};

const formatSeconds = (ms: number): string =>
  `${Math.max(1, Math.round(ms / 1000))}s`;

export const Stats = () => {
  const { t } = useTranslator();
  const { code } = useParams<{ code: string }>();
  const location = useLocation();
  const key = location.hash.replace(/^#/, "");
  const [state, setState] = useState<LoadState>("loading");
  const [stats, setStats] = useState<QuestionStats | null>(null);
  const [mine] = useState<CreatedQuestion[]>(() => listCreatedQuestions());
  useNoIndex(true);

  const load = async (): Promise<void> => {
    if (!code || !key) {
      setState("forbidden");
      return;
    }
    setState("loading");
    try {
      const response = await new GetQuestionStats().execute({ code, key });
      if (response.status === 200) {
        setStats(response.data);
        setState("ready");
        return;
      }
      if (response.status === 403) setState("forbidden");
      else if (response.status === 404) setState("not-found");
      else setState("error");
    } catch {
      setState("error");
    }
  };

  useEffect(() => {
    load();
  }, [code, key]);

  const averageMs =
    stats && stats.stats.answersCount > 0
      ? stats.stats.totalDurationMs / stats.stats.answersCount
      : 0;

  return (
    <S.Container>
      <title>Only Yes - Stats</title>
      {state === "loading" && <Loading />}
      {state === "forbidden" && (
        <S.Message>
          {t(
            "Stats indisponíveis: link secreto inválido ou pergunta criada antes do painel existir."
          )}
        </S.Message>
      )}
      {state === "not-found" && (
        <S.Message>{t("Nenhuma pergunta encontrada.")}</S.Message>
      )}
      {state === "error" && (
        <S.Message>{t("Erro ao carregar. Tente novamente.")}</S.Message>
      )}
      {state === "ready" && stats && (
        <S.Card>
          <S.Header>
            <div>
              <S.Question>{htmlToText(stats.question.question)}</S.Question>
              <S.Subtitle>
                <a href={`/${stats.question.code}`}>
                  yes.vbss.io/{stats.question.code}
                </a>{" "}
                · {t("criada")} {formatRelative(stats.question.createdAt, t("agora"))}
              </S.Subtitle>
            </div>
            <S.RefreshButton size="icon-md" rounded="full" onClick={load}>
              <ArrowsClockwise color="white" width="1.2rem" height="1.2rem" />
            </S.RefreshButton>
          </S.Header>
          <S.StatGrid>
            <S.StatTile>
              <S.StatValue>{stats.stats.answersCount}</S.StatValue>
              <S.StatLabel>{t("Sims conquistados")}</S.StatLabel>
            </S.StatTile>
            <S.StatTile>
              <S.StatValue>{stats.stats.maxNoAttempts}</S.StatValue>
              <S.StatLabel>{t("Recorde de fugas")}</S.StatLabel>
            </S.StatTile>
            <S.StatTile>
              <S.StatValue>
                {stats.stats.answersCount > 0 ? formatSeconds(averageMs) : "—"}
              </S.StatValue>
              <S.StatLabel>{t("Tempo médio até o Sim")}</S.StatLabel>
            </S.StatTile>
            <S.StatTile>
              <S.StatValue>0 (0.000%)</S.StatValue>
              <S.StatLabel>{t("Nãos bem-sucedidos")}</S.StatLabel>
            </S.StatTile>
          </S.StatGrid>
          <div>
            <S.SectionTitle>{t("Últimas respostas")}</S.SectionTitle>
            {stats.answers.length === 0 && (
              <S.Message>
                {t("Ninguém respondeu ainda. Compartilhe o link!")}
              </S.Message>
            )}
            {stats.answers.length > 0 && (
              <S.Timeline>
                {stats.answers.slice(0, 20).map((answer, index) => (
                  <S.TimelineItem key={`${answer.answeredAt}-${index}`}>
                    <span>
                      {answer.noAttempts === 0
                        ? t("disse Sim de primeira")
                        : `${t("fugiu")} ${answer.noAttempts}x ${t(
                            "antes do Sim"
                          )}`}
                      {answer.yesVariant === "clone" &&
                        ` · ${t("clicou num clone")}`}
                      {` · ${formatSeconds(answer.durationMs)}`}
                    </span>
                    <S.TimelineWhen>
                      {formatRelative(answer.answeredAt, t("agora"))}
                    </S.TimelineWhen>
                  </S.TimelineItem>
                ))}
              </S.Timeline>
            )}
          </div>
        </S.Card>
      )}
      {mine.length > 0 && (
        <S.Card>
          <S.SectionTitle>{t("Minhas perguntas")}</S.SectionTitle>
          <S.Timeline>
            {mine.map((entry) => (
              <li key={entry.code}>
                <S.MyQuestionItem
                  href={`/stats/${entry.code}#${entry.statsKey}`}
                >
                  <span>{entry.question || entry.code}</span>
                  <S.TimelineWhen>
                    {formatRelative(entry.createdAt, t("agora"))}
                  </S.TimelineWhen>
                </S.MyQuestionItem>
              </li>
            ))}
          </S.Timeline>
        </S.Card>
      )}
    </S.Container>
  );
};
