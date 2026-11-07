import { config } from "../config";
import type { Answers } from "../risk/types";
import { apiFetch } from "./client";

/**
 * Sends the finished answers to the NCSR backend.
 * TODO: match the payload to what the Laravel controller validates.
 */
export async function submitRiskAssessment(answers: Answers): Promise<void> {
  await apiFetch<unknown>(config.riskAssessmentPath, {
    method: "POST",
    body: { answers },
  });
}
