import {
  GetQuestionStatsInput,
  GetQuestionStatsOutput,
} from "@/application/usecases/dtos/GetQuestionStats.dto";
import { HttpClient } from "@/domain/http/HttpClient";
import { Registry } from "@/infra/dependency-injection/Registry";

export class GetQuestionStats {
  protected url = `${import.meta.env.VITE_ONLY_YES_API}/stats`;
  httpClient: HttpClient;

  constructor() {
    this.httpClient = Registry.getInstance().inject("httpClient");
  }

  async execute(params: GetQuestionStatsInput): Promise<GetQuestionStatsOutput> {
    const response = await this.httpClient.get({
      url: this.url,
      params: { code: params.code },
      headers: { "x-stats-key": params.key },
    });
    return { status: response.status, data: response.data };
  }
}
