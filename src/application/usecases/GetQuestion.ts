import {
  GetQuestionInput,
  GetQuestionOutput,
} from "@/application/usecases/dtos/GetQuestion.dto";
import { HttpClient } from "@/domain/http/HttpClient";
import { Registry } from "@/infra/dependency-injection/Registry";

export class GetQuestion {
  protected url = `${import.meta.env.VITE_ONLY_YES_API}/question`;
  httpClient: HttpClient;

  constructor() {
    this.httpClient = Registry.getInstance().inject("httpClient");
  }

  async execute(params: GetQuestionInput): Promise<GetQuestionOutput> {
    const response = await this.httpClient.get({
      url: this.url,
      params: params,
    });
    return response.data;
  }
}
