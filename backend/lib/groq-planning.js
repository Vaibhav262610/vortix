const axios = require('axios');

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'openai/gpt-oss-120b';

function selectGroqKey(serverKey, browserKey) {
  return serverKey?.trim() || browserKey?.trim() || null;
}

function validatePlan(plan) {
  if (!plan || !Array.isArray(plan.steps) || plan.steps.length === 0 ||
      plan.steps.some(step => typeof step?.command !== 'string' || !step.command.trim())) {
    throw new Error('Groq returned an invalid command plan. Please try again.');
  }
  return plan;
}

async function generateGroqPlan(prompt, apiKey, client = axios) {
  try {
    const response = await client.post(GROQ_URL, {
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'command_plan',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              steps: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: { command: { type: 'string' } },
                  required: ['command'],
                  additionalProperties: false,
                },
              },
            },
            required: ['steps'],
            additionalProperties: false,
          },
        },
      },
    }, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 45000,
    });

    const content = response.data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string') {
      throw new Error('Groq returned no command plan. Please try again.');
    }
    return validatePlan(JSON.parse(content));
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const detail = error.response.data?.error?.message;
      console.error('Groq planning request failed:', status, detail || error.message);
      if (status === 401) throw new Error('Groq rejected the configured API key. Check GROQ_API_KEY on Render or your key in Settings.');
      if (status === 403) throw new Error('Groq denied access to the planning model for this account.');
      if (status === 404) throw new Error('Groq could not find the planning model. Redeploy the latest backend.');
      if (status === 429) throw new Error('Groq rate limit reached. Please wait and try again.');
      throw new Error(`Groq request failed (HTTP ${status}). ${detail || 'Please try again.'}`);
    }
    if (error.code === 'ECONNABORTED') {
      throw new Error('Groq timed out. Please try again.');
    }
    if (error instanceof SyntaxError) {
      throw new Error('Groq returned an unreadable command plan. Please try again.');
    }
    throw error;
  }
}

module.exports = { selectGroqKey, generateGroqPlan };
