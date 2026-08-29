import { RecordAnswerInput } from "@/application/usecases/dtos/RecordAnswer.dto";
import { HttpClient } from "@/domain/http/HttpClient";
import { Registry } from "@/infra/dependency-injection/Registry";

export class RecordAnswer {
  protected url = `${import.meta.env.VITE_ONLY_YES_API}/answer`;
  httpClient: HttpClient;

  constructor() {
    this.httpClient = Registry.getInstance().inject("httpClient");
  }

  async execute(params: RecordAnswerInput): Promise<void> {
    await this.httpClient.post({
      url: this.url,
      body: params,
    });
  }
}
