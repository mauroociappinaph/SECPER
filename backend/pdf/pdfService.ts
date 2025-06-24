import pdfParse from 'pdf-parse';
import { Mistral } from '@mistralai/mistralai';

export const readPdfText = async (buffer: Buffer): Promise<string> => {
  const data = await pdfParse(buffer);
  return data.text;
};

export const analyzePdfWithMistral = async (buffer: Buffer) => {
  const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
  console.log('MISTRAL_API_KEY:', MISTRAL_API_KEY);
  if (!MISTRAL_API_KEY) throw new Error('MISTRAL_API_KEY no definida en variables de entorno');
  const client = new Mistral();
  const base64Pdf = buffer.toString('base64');
  const ocrResponse = await client.ocr.process({
    model: 'mistral-ocr-latest',
    document: {
      type: 'document_url',
      documentUrl: 'data:application/pdf;base64,' + base64Pdf,
    },
    includeImageBase64: false,
  });
  return ocrResponse;
};
