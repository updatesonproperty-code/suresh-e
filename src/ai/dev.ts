import { config } from 'dotenv';
config();

import '@/ai/flows/generate-invoice.ts';
import '@/ai/flows/process-voice-command.ts';
import '@/ai/flows/add-product.ts';
import '@/ai/flows/extract-products-from-file.ts';
