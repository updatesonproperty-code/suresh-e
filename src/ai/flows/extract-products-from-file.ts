'use server';

/**
 * @fileOverview A Genkit flow to extract product information from a file's text content.
 *
 * - extractProductsFromFile - Parses a string of text from a file and returns structured product details.
 * - ExtractProductsInput - The input type for the extractProductsFromFile function.
 * - ExtractProductsOutput - The return type for the extractProductsFromFile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractProductsInputSchema = z.object({
  fileContent: z.string().describe('The text content extracted from an uploaded file (CSV or Excel).'),
});
export type ExtractProductsInput = z.infer<typeof ExtractProductsInputSchema>;


const ProductSchema = z.object({
    id: z.string().describe('The product ID or code.'),
    name: z.string().describe('The name of the product.'),
    price: z.number().describe('The price of the product.'),
    hiddenCost: z.number().describe('The hidden cost of the product.'),
});

const ExtractProductsOutputSchema = z.object({
    products: z.array(ProductSchema).describe('An array of structured product objects found in the file.')
});
export type ExtractProductsOutput = z.infer<typeof ExtractProductsOutputSchema>;

export async function extractProductsFromFile(input: ExtractProductsInput): Promise<ExtractProductsOutput> {
  return extractProductsFromFileFlow(input);
}

const extractProductsPrompt = ai.definePrompt({
  name: 'extractProductsPrompt',
  input: {schema: ExtractProductsInputSchema},
  output: {schema: ExtractProductsOutputSchema},
  prompt: `You are an expert data extraction AI. Your task is to analyze the provided text content from a file and extract all product information.

  The file could be messy and contain irrelevant text, but you must find the rows that represent products.
  A product row will contain a name, an ID/code, a price, and a hidden cost. The order of these columns might vary.

  - Product Name: A descriptive string.
  - Product ID: A unique code, typically a number or alphanumeric string.
  - Hidden Cost: The internal cost of the product.
  - Price: The selling price of the product.

  Carefully parse the text below and return a structured list of all the products you can identify. Ignore any rows that are not valid products.

  File Content:
  {{{fileContent}}}
  `,
});

const extractProductsFromFileFlow = ai.defineFlow(
  {
    name: 'extractProductsFromFileFlow',
    inputSchema: ExtractProductsInputSchema,
    outputSchema: ExtractProductsOutputSchema,
  },
  async input => {
    const {output} = await extractProductsPrompt(input);
    return output!;
  }
);
