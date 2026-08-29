import { ChaseDemo } from "@/presentation/components/ChaseDemo";
import { OccasionIcon } from "@/presentation/components/OccasionIcon";
import {
  OCCASION_PAGE_COPY,
  findOccasionBySlug,
  galleryPath,
  occasionCopy,
  occasionPath,
  relatedOccasions,
} from "@/presentation/config/occasions";
import { Navigate, useParams } from "react-router-dom";
import * as S from "./styles";

export const Occasion = () => {
  const { slug } = useParams<{ slug: string }>();
  const match = findOccasionBySlug(slug ?? null);

  if (!match) return <Navigate to="/" replace />;

  const { occasion, lang } = match;
  const copy = occasionCopy(occasion, lang);
  const pageCopy = OCCASION_PAGE_COPY[lang];
  const createHref = `/create?template=${occasion.slug[lang]}`;

  return (
    <S.Container>
      <title>Only Yes - {copy.title}</title>
      <S.Breadcrumb href={galleryPath(lang)}>
        ← {pageCopy.backToGallery}
      </S.Breadcrumb>
      <S.Header>
        <S.IconBadge>
          <OccasionIcon name={occasion.icon} />
        </S.IconBadge>
        <S.Title>{copy.h1}</S.Title>
        {copy.intro.map((paragraph) => (
          <S.Paragraph key={paragraph.slice(0, 24)}>{paragraph}</S.Paragraph>
        ))}
      </S.Header>
      <S.Section>
        <S.SectionTitle>{pageCopy.tryIt}</S.SectionTitle>
        <ChaseDemo
          question={copy.question}
          yesText={copy.yesText}
          noText={copy.noText}
          result={copy.answer}
          dodgeSuffix={pageCopy.dodgeSuffix}
        />
        <S.CtaButton href={createHref}>{pageCopy.useTemplate}</S.CtaButton>
      </S.Section>
      <S.Section>
        <S.SectionTitle>{pageCopy.faqTitle}</S.SectionTitle>
        <S.FaqList>
          {copy.faq.map((item) => (
            <S.FaqItem key={item.q}>
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </S.FaqItem>
          ))}
        </S.FaqList>
      </S.Section>
      <S.Section>
        <S.SectionTitle>{pageCopy.relatedTitle}</S.SectionTitle>
        <S.RelatedList>
          {relatedOccasions(occasion).map((related) => (
            <S.RelatedLink
              key={related.slug.pt}
              href={occasionPath(related, lang)}
            >
              {occasionCopy(related, lang).label}
            </S.RelatedLink>
          ))}
        </S.RelatedList>
      </S.Section>
    </S.Container>
  );
};
