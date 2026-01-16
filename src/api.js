export async function submitToAirtable(data, config) {
  const { apiKey, baseId, tableName, fieldMapping } = config.airtable;

  if (!apiKey || !baseId) {
    throw new Error('Airtable API key and Base ID are required');
  }

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;

  const fields = {};
  fields[fieldMapping.model] = data.model;
  fields[fieldMapping.size] = data.size;
  fields[fieldMapping.rim] = data.rim;
  fields[fieldMapping.interiorFinish] = data.interior_finish;
  fields[fieldMapping.exteriorFinish] = data.exterior_finish;
  fields[fieldMapping.color] = data.color;
  fields[fieldMapping.firstName] = data.firstname;
  fields[fieldMapping.lastName] = data.lastname;
  fields[fieldMapping.email] = data.email;
  fields[fieldMapping.phone] = data.phone;
  fields[fieldMapping.installationDate] = data.installation_date;
  fields[fieldMapping.submittedAt] = data.submitted_at;
  fields[fieldMapping.sourceUrl] = data.source;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ records: [{ fields }] })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Airtable submission failed');
  }

  return response.json();
}

export async function submitToWebhook(data, config) {
  const { url, headers } = config.webhook;

  if (!url) throw new Error('Webhook URL is required');

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error(`Webhook submission failed: ${response.status}`);
  }

  try {
    return await response.json();
  } catch {
    return { success: true };
  }
}

export async function submit(data, config) {
  if (config.airtable.enabled && config.airtable.apiKey) {
    return submitToAirtable(data, config);
  }
  if (config.webhook.enabled && config.webhook.url) {
    return submitToWebhook(data, config);
  }
  console.warn('No submission endpoint configured. Data:', data);
  return { success: true, demo: true };
}