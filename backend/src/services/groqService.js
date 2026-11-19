const getFetch = require('../utils/fetch');

const DEFAULT_GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const DEFAULT_GROQ_MODEL = 'qwen/qwen3.6-27b';
const FALLBACK_GROQ_MODELS = ['qwen/qwen3.6-27b', 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'];
const DEFAULT_TIMEOUT_MS = 5000;

function groqConfig() {
  return {
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL,
    baseUrl: process.env.GROQ_BASE_URL || DEFAULT_GROQ_BASE_URL,
    timeoutMs: Math.min(Number(process.env.GROQ_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS, 5000),
  };
}

async function createChatCompletion({
  messages,
  temperature = 0.35,
  maxTokens = 800,
  responseFormat,
  reasoningEffort,
}) {
  const { apiKey, model: configuredModel, baseUrl, timeoutMs } = groqConfig();

  if (!apiKey) {
    const error = new Error('GROQ_API_KEY is not configured');
    error.code = 'GROQ_MISSING_KEY';
    throw error;
  }

  const candidateModels = Array.from(new Set([configuredModel, ...FALLBACK_GROQ_MODELS].filter(Boolean)));
  const fetchImpl = await getFetch();
  let lastError = null;

  for (const modelToTry of candidateModels) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetchImpl(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelToTry,
          messages,
          temperature,
          max_tokens: Math.min(maxTokens || 4000, 4000),
          ...(responseFormat ? { response_format: responseFormat } : {}),
          ...(reasoningEffort && reasoningEffort !== 'none' ? { reasoning_effort: reasoningEffort } : {}),
        }),
        signal: controller.signal,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = data?.error?.message || `Groq request failed with status ${response.status}`;
        const error = new Error(message);
        error.code = 'GROQ_API_ERROR';
        error.statusCode = response.status;
        lastError = error;
        console.warn(`[groq] Model ${modelToTry} failed (${response.status}): ${message}.`);
        if (response.status === 401 || response.status === 403 || response.status === 404 || data?.error?.code === 'invalid_api_key') {
          break;
        }
        continue;
      }

      const content = data?.choices?.[0]?.message?.content;
      if (!content) {
        const error = new Error('Groq returned an empty response');
        error.code = 'GROQ_EMPTY_RESPONSE';
        lastError = error;
        continue;
      }

      return content;
    } catch (err) {
      if (err.name === 'AbortError') {
        lastError = new Error(`Groq request timed out after ${timeoutMs}ms`);
      } else {
        lastError = err;
      }
      console.warn(`[groq] Error with model ${modelToTry}: ${err.message}.`);
      break;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError || new Error('All Groq models failed');
}

module.exports = { createChatCompletion, groqConfig };
