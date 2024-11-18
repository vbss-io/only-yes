import { AxiosAdapter } from "@/infra/http/HttpClient";
import { Registry } from "./Registry";

export const registerDependencies = () => {
  const httpClient = new AxiosAdapter();
  Registry.getInstance().provide("httpClient", httpClient);
};
