
"use client";

import { useState, useRef, useEffect } from "react";
import { ChatInput } from "./chat-input";
import { ChatMessage, type Message } from "./chat-message";
import { generateInvoice } from "@/ai/flows/generate-invoice";
import { addProduct, AddProductOutput } from "@/ai/flows/add-product";
import { extractProductsFromFile, ExtractProductsOutput } from "@/ai/flows/extract-products-from-file";
import { type Product } from "@/lib/products";
import { useToast } from "@/hooks/use-toast";
import { InvoiceDialog } from "./invoice-dialog";
import { Logo } from "../icons/logo";
import { ScrollArea } from "../ui/scroll-area";
import { useUser } from "@/lib/auth";
import { Button } from "../ui/button";
import { FileText, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { Bot } from "lucide-react";
import { type OrderItem, type Slip } from "@/lib/slips";
import * as XLSX from 'xlsx';
import { ConfirmImportDialog } from "./confirm-import-dialog";


type ConversationState = 
  | { type: 'idle' }
  | { type: 'awaiting_quantity'; product: Product };

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [invoiceContent, setInvoiceContent] = useState("");
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [conversationState, setConversationState] = useState<ConversationState>({ type: 'idle' });
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);

  const [productsToConfirm, setProductsToConfirm] = useState<Product[]>([]);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);


  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const user = useUser();
  const userRole = user?.role;
  const [isClient, setIsClient] = useState(false);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
      addBotMessage("Sorry, I'm having trouble fetching the product list right now.");
    }
  };

  useEffect(() => {
    setIsClient(true);
    fetchProducts();
  }, []);


  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const addBotMessage = (content: string) => {
    const botMessage: Message = { role: "assistant", content };
    setMessages((prev) => [...prev, botMessage]);
  }

  const generateOrderSummary = (order: OrderItem[]) => {
      if (order.length === 0) {
        return "Your order is currently empty. Add a product to get started.";
      }
      const items = order.map(item => `- ${item.quantity} x ${item.product.name} @ ₹${item.product.price.toFixed(2)}`).join('\n');
      const total = order.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      return `**Current Order:**\n${items}\n\n**Total: ₹${total.toFixed(2)}**`;
  }

  const handleGenerateSlip = async () => {
     if (currentOrder.length === 0) {
        toast({
            variant: "destructive",
            title: "Cannot Generate Slip",
            description: "Your order is empty. Please add some products first.",
        });
        return;
    }
    setIsLoading(true);
    const orderDescription = currentOrder.map(item => `${item.quantity} ${item.product.name.trim()} at ${item.product.price} each`).join(', ');
    try {
        const invoiceResponse = await generateInvoice({ voiceCommand: `Generate invoice for ${orderDescription}` });
        if (invoiceResponse.invoice) {
            const newSlip: Slip = {
              id: crypto.randomUUID(),
              date: new Date().toISOString(),
              items: currentOrder,
              total: currentOrder.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
              invoiceContent: invoiceResponse.invoice,
              staffName: user?.name || "Unknown Staff",
            };
            
            const saveResponse = await fetch('/api/slips', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSlip),
            });

            if (!saveResponse.ok) {
                throw new Error("Failed to save the slip to the backend.");
            }

            setInvoiceContent(invoiceResponse.invoice);
            setIsInvoiceDialogOpen(true);
            addBotMessage("I've generated the slip for you. You can review and print it now. The slip has been saved.");
            setCurrentOrder([]); 
        } else {
            throw new Error("Failed to generate invoice from AI.");
        }
    } catch(error) {
        console.error("Slip Generation/Saving Error:", error);
        addBotMessage(`Sorry, I had trouble generating or saving the slip. Please try again. Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
        setIsLoading(false);
    }
  }

  const handleSendMessage = async (text: string) => {
    if (isLoading || !text.trim()) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      if (userRole === 'admin') {
        await handleAdminMessage(text);
      } else { // Staff Role
        await handleStaffMessage(text);
      }
    } catch (error: any) {
      console.error("API/AI Error:", error);
      const errorMessage = error.message || "An unexpected error occurred. Please try again.";
      addBotMessage(`Sorry, I ran into a problem: ${errorMessage}`);
       toast({
        variant: "destructive",
        title: "An error occurred",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendFile = async (file: File) => {
    if (isLoading || userRole !== 'admin') return;
  
    const userMessage: Message = { role: "user", content: `Processing file: ${file.name}` };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    addBotMessage("Analyzing file content with AI. This might take a moment...");
  
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const binaryStr = event.target?.result;
          const workbook = XLSX.read(binaryStr, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const textContent = XLSX.utils.sheet_to_csv(worksheet);
  
          if (!textContent.trim()) {
            addBotMessage("The file seems to be empty or in an unreadable format.");
            setIsLoading(false);
            return;
          }
  
          const aiResponse = await extractProductsFromFile({ fileContent: textContent });
          
          if (aiResponse.products && aiResponse.products.length > 0) {
            setProductsToConfirm(aiResponse.products);
            setIsConfirmDialogOpen(true);
            addBotMessage(`I found ${aiResponse.products.length} products in the file. Please review and confirm the import.`);
          } else {
            addBotMessage("I couldn't find any valid product information in the file. Please ensure the file contains columns for Name, ID, Hidden Cost, and Price.");
          }
        } catch (e) {
          throw new Error(`Error processing file: ${e instanceof Error ? e.message : String(e)}`);
        } finally {
          setIsLoading(false);
        }
      };
      reader.onerror = () => {
        throw new Error('Error reading the file.');
      };
      reader.readAsBinaryString(file);
    } catch (error: any) {
      console.error("File Upload Error:", error);
      const errorMessage = error.message || "An unexpected error occurred during file upload.";
      addBotMessage(`Sorry, I ran into a problem: ${errorMessage}`);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: errorMessage,
      });
      setIsLoading(false);
    }
  };

  const handleConfirmImport = async (productsToImport: Product[]) => {
    setIsLoading(true);
    setIsConfirmDialogOpen(false);
    addBotMessage(`Importing ${productsToImport.length} products...`);
    await handleAdminBulkAdd(productsToImport);
    setProductsToConfirm([]);
  };

  const handleAdminBulkAdd = async (productsToAdd: AddProductOutput[]) => {
      const responses: string[] = [];
      let successCount = 0;
      let errorCount = 0;
  
      for (const product of productsToAdd) {
          try {
              const response = await fetch('/api/products', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify([product]),
              });
  
              const result = await response.json();
              if (!response.ok) {
                  throw new Error(result.message || `Failed to process ${product.name}`);
              }
  
              if (result.updated > 0) {
                  responses.push(`🔄 Updated **${product.name.trim()}**.`);
              } else if (result.added > 0) {
                  responses.push(`✅ Added **${product.name.trim()}**.`);
              }
              successCount++;
          } catch (e) {
              responses.push(`❌ Error adding **${product.name}**: ${e instanceof Error ? e.message : 'Unknown error'}`);
              errorCount++;
          }
      }
      
      const summary = `**Import Complete:**\n- ${successCount} products processed successfully.\n- ${errorCount} errors.\n\n${responses.join('\n')}`;
      addBotMessage(summary);
  
      if (successCount > 0) {
          await fetchProducts(); // Refresh product list
      }
      setIsLoading(false);
  }

  const handleAdminMessage = async (text: string) => {
      const productStrings = text.trim().split('\n').filter(s => s.trim());
      const parsedProducts : AddProductOutput[] = [];

      for(const productString of productStrings) {
          try {
              const parsedProduct = await addProduct({ productString });
              if (!parsedProduct || !parsedProduct.id || !parsedProduct.name) {
                  throw new Error(`Could not parse: ${productString}`);
              }
              parsedProducts.push(parsedProduct);
          } catch(e) {
               addBotMessage(`❌ Error parsing **${productString}**: ${e instanceof Error ? e.message : 'Unknown error'}`);
          }
      }

      if (parsedProducts.length > 0) {
        await handleAdminBulkAdd(parsedProducts);
      } else {
        setIsLoading(false);
      }
  }

  const handleStaffMessage = async (text: string) => {
    if (conversationState.type === 'awaiting_quantity') {
        const quantity = parseInt(text.trim(), 10);
        if (!isNaN(quantity) && quantity > 0) {
            const newItem = { product: conversationState.product, quantity };
            const updatedOrder = [...currentOrder, newItem];
            setCurrentOrder(updatedOrder);
            const summary = generateOrderSummary(updatedOrder);
            addBotMessage(summary);
            setConversationState({ type: 'idle' });
        } else {
            addBotMessage("That doesn't seem like a valid quantity. Please enter a number (e.g., 2).");
        }
    } else {
        const foundProduct = products.find((p) => p.name.trim().toLowerCase() === text.trim().toLowerCase());
        
        if (foundProduct) {
            setConversationState({ type: 'awaiting_quantity', product: foundProduct });
            addBotMessage(`How many **${foundProduct.name.trim()}** would you like to add?`);
        } else {
            addBotMessage("I couldn't find that product in our inventory. Please check the name and try again, or select one from the suggestions.");
        }
    }
  }


  const AdminWelcomeMessage = () => (
     <Alert className="mb-4">
        <Bot className="h-4 w-4" />
        <AlertDescription>
          Welcome, Admin! Please enter the product details you want to add. For example: "BED SWITCH 2527 56 38". You can also switch to bulk or file upload.
        </AlertDescription>
      </Alert>
  )

  const StaffWelcomeMessage = () => (
      <div className="flex flex-col items-center justify-center text-center text-muted-foreground pt-20">
        <Logo className="h-16 w-16 opacity-50"/>
        <p className="mt-4 text-lg">Start building a slip</p>
        <p className="text-sm">Type a product name to begin.</p>
      </div>
  )
  
  if (!isClient) {
    return (
       <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
       </div>
    );
  }

  return (
    <>
      <div className="flex h-screen w-full flex-col items-center bg-background">
        <div className="flex h-full w-full max-w-4xl flex-col p-4">
          
          <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
            <div className="space-y-4 pr-0">
              {userRole === 'admin' && messages.length === 0 && <AdminWelcomeMessage />}
              
              {messages.length === 0 && userRole === 'staff' && (
                  <StaffWelcomeMessage />
              )}
              {messages.map((msg, index) => (
                <ChatMessage key={index} message={msg} />
              ))}
              {isLoading && (
                <ChatMessage
                  message={{ role: "assistant", content: "" }}
                  isLoading
                />
              )}
               {userRole === 'staff' && currentOrder.length > 0 && conversationState.type === 'idle' && (
                 <div className="flex justify-center py-4">
                    <Button onClick={handleGenerateSlip} disabled={isLoading}>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Slip
                    </Button>
                  </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="mt-auto">
            <ChatInput 
              onSendMessage={handleSendMessage} 
              onSendFile={handleSendFile}
              isLoading={isLoading} 
              products={products}
              conversationState={conversationState}
            />
          </div>
        </div>
      </div>
      <InvoiceDialog
        isOpen={isInvoiceDialogOpen}
        onOpenChange={setIsInvoiceDialogOpen}
        invoiceContent={invoiceContent}
      />
      <ConfirmImportDialog
        isOpen={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        products={productsToConfirm}
        onConfirm={handleConfirmImport}
        onCancel={() => {
          setProductsToConfirm([]);
          addBotMessage("Import canceled.");
        }}
      />
    </>
  );
}
