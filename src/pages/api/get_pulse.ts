import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // In a real app, you'd get this from a secure config store
  const modalWebhookUrl = process.env.MODAL_GET_PULSE_WEBHOOK;

  if (!modalWebhookUrl) {
    return res.status(500).json({ error: 'Modal webhook URL not configured.' });
  }

  try {
    const response = await fetch(modalWebhookUrl);
    if (!response.ok) {
      throw new Error(`Modal webhook failed with status: ${response.status}`);
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}