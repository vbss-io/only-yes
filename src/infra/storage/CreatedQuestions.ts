export interface CreatedQuestion {
  code: string;
  statsKey: string;
  question: string;
  createdAt: string;
}

const STORAGE_KEY = "only-yes:created";
const MAX_ENTRIES = 20;

export const listCreatedQuestions = (): CreatedQuestion[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is CreatedQuestion =>
        typeof entry === "object" &&
        entry !== null &&
        typeof (entry as CreatedQuestion).code === "string" &&
        typeof (entry as CreatedQuestion).statsKey === "string"
    );
  } catch {
    return [];
  }
};

export const saveCreatedQuestion = (entry: CreatedQuestion): void => {
  try {
    const current = listCreatedQuestions().filter((q) => q.code !== entry.code);
    current.unshift(entry);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(current.slice(0, MAX_ENTRIES))
    );
  } catch {
    return;
  }
};
