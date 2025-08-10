// This file uses server-side code.
'use server';

/**
 * @fileOverview Generates an invoice from a voice command describing an order.
 *
 * - generateInvoice - A function that takes a voice command as input and returns a formatted invoice.
 * - GenerateInvoiceInput - The input type for the generateInvoice function.
 * - GenerateInvoiceOutput - The return type for the generateInvoice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInvoiceInputSchema = z.object({
  voiceCommand: z
    .string()
    .describe(
      'A voice command describing the order. For example: Calculate total and generate invoice for 2 hammers at $10 each and 1 saw at $20.'
    ),
});
export type GenerateInvoiceInput = z.infer<typeof GenerateInvoiceInputSchema>;

const GenerateInvoiceOutputSchema = z.object({
  invoice: z.string().describe('The generated invoice in a readable format.'),
});
export type GenerateInvoiceOutput = z.infer<typeof GenerateInvoiceOutputSchema>;

export async function generateInvoice(input: GenerateInvoiceInput): Promise<GenerateInvoiceOutput> {
  if (!process.env.GEMINI_API_KEY) {
    console.error('CRITICAL: GEMINI_API_KEY is not set in the environment.');
    throw new Error(
      'The AI service is not configured. Please ensure the GEMINI_API_KEY is set in your deployment environment variables.'
    );
  }
  return generateInvoiceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInvoicePrompt',
  input: {schema: GenerateInvoiceInputSchema},
  output: {schema: GenerateInvoiceOutputSchema},
  prompt: `You are an invoicing system. The user will provide a description of an order, and you must generate a plain text invoice that looks like a table.

  **Format Instructions:**
  - Create a header row with the following columns: PRODUCT NAME, CODE, QTY, EACH, TOTAL.
  - Each product in the order should be a new row in the table.
  - The 'EACH' column is the price of a single item.
  - The 'TOTAL' column is the quantity multiplied by the price.
  - The product name, code, quantity, and price for each item will be in the user's command. You need to extract this information and place it in the correct columns.
  - You must calculate the line item total (QTY * EACH).
  - You must calculate the final total of all items.
  - Include an item for "DILEVERY CHARGES" and a final "TOTAL".
  - Use spaces to align the columns to create a clean, table-like appearance.

  **Example Output Structure:**
  PRODUCT NAME      CODE    QTY   EACH   TOTAL
  ------------------------------------------------
  1 WAY SWITCH      21011     1    100     100
  REGULATOR         21496     1    120     120
  1M PLATE          111111    2     50     100
  ... more items ...
  ------------------------------------------------
  DILEVERY CHARGES                         250
  ------------------------------------------------
  TOTAL                                    830

  **User's Order:**
  {{{voiceCommand}}}
  `,
});

const generateInvoiceFlow = ai.defineFlow(
  {
    name: 'generateInvoiceFlow',
    inputSchema: GenerateInvoiceInputSchema,
    outputSchema: GenerateInvoiceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
