import { CreateQuestion } from "@/application/usecases/CreateQuestion";
import { Editor } from "@/presentation/components/Editor";
import { Loading } from "@/presentation/components/Loading";
import { Share } from "@/presentation/components/Share";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Pen } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslator } from "vbss-translator";
import { Input } from "vbss-ui";
import { z } from "zod";
import * as S from "./styles";

const createQuestionForm = z.object({
  question: z
    .string({
      required_error: "A Pergunta é obrigatória.",
    })
    .min(5, {
      message: "A Pergunta é obrigatória.",
    })
    .superRefine((value, ctx) => {
      if (value === "<p></p>") {
        return ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "A Pergunta é obrigatória.",
        });
      }
    }),
  yesText: z
    .string({
      required_error: "A Reposta Positiva é obrigatória.",
    })
    .min(3, {
      message: "A Reposta Positiva é obrigatória.",
    })
    .max(15, {
      message: "A Reposta Positiva deve ter até 15 caracteres.",
    }),
  noText: z
    .string({
      required_error: "A Reposta Negativa é obrigatória.",
    })
    .min(3, {
      message: "A Reposta Negativa é obrigatória.",
    })
    .max(15, {
      message: "A Reposta Negativa deve ter até 15 caracteres.",
    }),
  answerType: z.string().min(1, {
    message: "O tipo de Feedback é obrigatório.",
  }),
  answer: z.string().min(1, {
    message: "O Feedback é obrigatório.",
  }),
});

type CreateQuestionForm = z.infer<typeof createQuestionForm>;

export const Create = () => {
  const { t } = useTranslator();
  const [questionContent, setQuestionContent] = useState<string>("");
  const [answerType, setAnswerType] = useState<string>("text");
  const [answerContent, setAnswerContent] = useState<string>("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [questionCode, setQuestionCode] = useState<string>("");
  const { register, handleSubmit, formState, reset, setValue } =
    useForm<CreateQuestionForm>({
      resolver: zodResolver(createQuestionForm),
      defaultValues: {
        yesText: t("Sim"),
        noText: t("Não"),
      },
    });

  useEffect(() => {
    setValue("question", questionContent);
  }, [questionContent]);

  useEffect(() => {
    setValue("answer", answerContent);
  }, [answerContent]);

  const handleSubmitForm = async (data: CreateQuestionForm): Promise<void> => {
    setQuestionCode("");
    setError("");
    try {
      setIsLoading(true);
      const createQuestionUsecase = new CreateQuestion();
      const { code } = await createQuestionUsecase.execute(data);
      if (code) {
        setQuestionCode(code);
        reset();
      }
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setError(t("* Erro ao criar a pergunta. Tente novamente."));
    }
  };

  const typeValues = [
    { label: t("Texto"), value: "text" },
    { label: "Link", value: "link" },
    { label: "Youtube", value: "video" },
  ];

  return (
    <S.Container>
      <title>Only Yes - Create</title>
      <S.Card>
        <S.Header>
          <Pen />
          <h1>{t("Crie Sua Pergunta")}</h1>
        </S.Header>
        <S.Form onSubmit={handleSubmit(handleSubmitForm)}>
          <div>
            <Editor
              content={questionContent}
              setContent={setQuestionContent}
              label={t("Pergunta:")}
              placeholder={t("Digite a Pergunta")}
              error={
                formState.errors.question?.message &&
                t(formState.errors.question?.message)
              }
            />
          </div>
          <S.Answers>
            <Input
              label={t("Resposta Positiva:")}
              {...register("yesText")}
              placeholder={t("Digite a Resposta")}
              error={
                formState.errors.yesText?.message &&
                t(formState.errors.yesText?.message)
              }
            />
            <Input
              label={t("Resposta Negativa:")}
              {...register("noText")}
              placeholder={t("Digite a Resposta")}
              error={
                formState.errors.noText?.message &&
                t(formState.errors.noText?.message)
              }
            />
          </S.Answers>
          <div>
            <S.SelectContainer>
              <S.SelectLabel htmlFor="answerType">
                {t("Tipo do Feedback:")}
              </S.SelectLabel>
              <S.Select
                id="answerType"
                disabled={isLoading}
                {...register("answerType")}
                onChange={(e) => {
                  setAnswerType(e.target.value);
                  setAnswerContent("");
                }}
              >
                <option value="" disabled>
                  {t("Tipo do Feedback")}
                </option>
                {typeValues.map((value, index) => (
                  <option
                    key={value.value}
                    value={value.value}
                    defaultChecked={index === 0}
                  >
                    {value.label}
                  </option>
                ))}
              </S.Select>
            </S.SelectContainer>
          </div>
          {answerType === "text" && (
            <div>
              <Editor
                content={answerContent}
                setContent={setAnswerContent}
                label={t("Texto do Feedback:")}
                placeholder={t("Digite o Feedback")}
                error={
                  formState.errors.answer?.message &&
                  t(formState.errors.answer?.message)
                }
              />
            </div>
          )}
          {answerType === "link" && (
            <S.LinkContainer>
              <Input
                label={t("Link do Feedback:")}
                placeholder={t("Digite um Link https")}
                rounded="full"
                value={answerContent}
                onChange={(e) =>
                  setAnswerContent(
                    `https://${e.target.value.replace("https://", "")}`
                  )
                }
                buttonProps={{
                  children: (
                    <>
                      <Link color="white" width="1.3rem" height="1.3rem" />
                      {t("Testar")}
                    </>
                  ),
                  disabled: !answerContent,
                  onClick: () => {
                    window.open(answerContent, "_blank");
                  },
                }}
              />
            </S.LinkContainer>
          )}
          {answerType === "video" && (
            <S.LinkContainer>
              <Input
                label={t("Link do Youtube:")}
                placeholder={t("Digite um Link do Youtube")}
                rounded="full"
                value={answerContent}
                onChange={(e) =>
                  setAnswerContent(
                    `https://${e.target.value.replace("https://", "")}`
                  )
                }
              />
              <div>
                {answerContent && answerContent !== "https://" && (
                  <Editor videoUrl={answerContent} viewMode />
                )}
              </div>
            </S.LinkContainer>
          )}
          <S.SubmitContainer questionCreatedOrError={!!questionCode || !!error}>
            {error && <S.SubmitErrorMessage>{error}</S.SubmitErrorMessage>}
            {questionCode && <Share code={questionCode} />}
            <S.SubmitButton type="submit" rounded="full">
              {isLoading ? <Loading /> : t("Criar Pergunta")}
            </S.SubmitButton>
          </S.SubmitContainer>
        </S.Form>
      </S.Card>
    </S.Container>
  );
};
