import { bot, initBot } from '../server/bot';

// Aseguramos de que el bot y sus eventos se inicialicen solo una vez
let isInitialized = false;

export default async function handler(req: any, res: any) {
  // Aseguramos que CORS está habilitado para la ruta
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (!isInitialized) {
    initBot();
    isInitialized = true;
  }

  try {
    if (req.method === 'POST') {
      // Pasamos el cuerpo del mensaje de Telegram a nuestro bot
      bot.processUpdate(req.body);
      res.status(200).json({ status: 'ok' });
    } else {
      // Si hacen un GET, simplemente respondemos para verificar que el endpoint existe
      res.status(200).send('Prestige Finance - Telegram Webhook está funcionando.');
    }
  } catch (error) {
    console.error('Error procesando el update del webhook:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
