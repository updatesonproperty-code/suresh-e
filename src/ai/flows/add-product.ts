'use server';

/**
 * @fileOverview A Genkit flow to add a new product from a text string.
 *
 * - addProduct - Parses a string and returns structured product details.
 * - AddProductInput - The input type for the addProduct function.
 * - AddProductOutput - The return type for the addProduct function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AddProductInputSchema = z.object({
  productString: z.string().describe('The product string from the user, e.g., "IRON SOCKET 6335 103 69"'),
});
export type AddProductInput = z.infer<typeof AddProductInputSchema>;

const AddProductOutputSchema = z.object({
    id: z.string().describe('The product ID or code.'),
    name: z.string().describe('The name of the product.'),
    price: z.number().describe('The price of the product.'),
    hiddenCost: z.number().describe('The hidden cost of the product.'),
});
export type AddProductOutput = z.infer<typeof AddProductOutputSchema>;

export async function addProduct(input: AddProductInput): Promise<AddProductOutput> {
  return addProductFlow(input);
}

const addProductPrompt = ai.definePrompt({
  name: 'addProductPrompt',
  input: {schema: AddProductInputSchema},
  output: {schema: AddProductOutputSchema},
  prompt: `You are an AI assistant that structures product information from a single string.

  The user will provide a string like "BED SWITCH 2527 56 38" or "IRON SOCKET 6335 103 69".
  You will parse this string and extract the product name, its ID (which is the first number), its hidden cost (the second number), and its price (which is the last number).

  - The product name is everything before the first number.
  - The product ID is the first number.
  - The hidden cost is the second number.
  - The price is the last number.

  Product String: {{{productString}}}
  `,
});

const addProductFlow = ai.defineFlow(
  {
    name: 'addProductFlow',
    inputSchema: AddProductInputSchema,
    outputSchema: AddProductOutputSchema,
  },
  async input => {
    const {output} = await addProductPrompt(input);
    return output!;
  }
);
