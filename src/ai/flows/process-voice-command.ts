'use server';

/**
 * @fileOverview A Genkit flow to process voice commands for product entry.
 *
 * - processVoiceCommand - Processes the voice command and returns structured order details.
 * - VoiceCommandInput - The input type for the processVoiceCommand function.
 * - VoiceCommandOutput - The return type for the processVoiceCommand function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VoiceCommandInputSchema = z.object({
  voiceCommand: z.string().describe('The voice command from the user.'),
});
export type VoiceCommandInput = z.infer<typeof VoiceCommandInputSchema>;

const VoiceCommandOutputSchema = z.object({
  order: z.array(
    z.object({
      productName: z.string().describe('The name of the product.'),
      quantity: z.number().describe('The quantity of the product.'),
    })
  ).describe('The structured order details.'),
});
export type VoiceCommandOutput = z.infer<typeof VoiceCommandOutputSchema>;

export async function processVoiceCommand(input: VoiceCommandInput): Promise<VoiceCommandOutput> {
  return processVoiceCommandFlow(input);
}

const processVoiceCommandPrompt = ai.definePrompt({
  name: 'processVoiceCommandPrompt',
  input: {schema: VoiceCommandInputSchema},
  output: {schema: VoiceCommandOutputSchema},
  prompt: `You are an AI assistant that structures voice commands into a list of products and quantities.

  The user will provide a voice command such as "Two light bulbs and one switch".
  You will return a structured order with the product name and quantity for each item.

  Voice Command: {{{voiceCommand}}}
  `,
});

const processVoiceCommandFlow = ai.defineFlow(
  {
    name: 'processVoiceCommandFlow',
    inputSchema: VoiceCommandInputSchema,
    outputSchema: VoiceCommandOutputSchema,
  },
  async input => {
    const {output} = await processVoiceCommandPrompt(input);
    return output!;
  }
);
