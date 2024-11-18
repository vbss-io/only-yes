import { Loading } from "@/presentation/components/Loading";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as S from "./styles";

export const Redirect = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const questionCode = location.pathname.split("/").pop();
    navigate(`/`, { state: { code: questionCode } });
  }, []);

  return (
    <S.Container>
      <Loading />
    </S.Container>
  );
};
