import {
  CreateQuestionInput,
  CreateQuestionOutput,
} from "@/application/usecases/dtos/CreateQuestion.dto";
import { HttpClient } from "@/domain/http/HttpClient";
import { Registry } from "@/infra/dependency-injection/Registry";

export class CreateQuestion {
  protected url = `${import.meta.env.VITE_ONLY_YES_API}/question`;
  httpClient: HttpClient;

  constructor() {
    this.httpClient = Registry.getInstance().inject("httpClient");
  }

  async execute(params: CreateQuestionInput): Promise<CreateQuestionOutput> {
    const response = await this.httpClient.post({
      url: this.url,
      body: params,
    });
    return response.data;
  }
}
