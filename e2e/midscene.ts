import 'dotenv/config';
import type { Page } from '@playwright/test';
import { PlaywrightAgent } from '@midscene/web/playwright';

export function hasMidsceneEnv() {
  return Boolean(
    process.env.MIDSCENE_MODEL_NAME &&
      (process.env.MIDSCENE_MODEL_API_KEY || process.env.OPENAI_API_KEY),
  );
}

export function createMidsceneAgent(page: Page) {
  if (!hasMidsceneEnv()) {
    return null;
  }

  return new PlaywrightAgent(page);
}
