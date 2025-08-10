
"use client";

import * as React from "react";
import { useEffect, useRef, useState, useMemo } from "react";
import { Mic, Send, CornerDownLeft, Upload, Box, Plus, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useVoiceRecognition } from "@/hooks/use-voice-recognition";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { useUser } from "@/lib/auth";
import type { Product } from "@/lib/products";
import { Card } from "../ui/card";
import { ProductSuggestions } from "./product-suggestions";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onSendFile: (file: File) => void;
  isLoading: boolean;
  products: Product[];
  conversationState: { type: string };
}

interface AdminInputProps {
    message: string;
    setMessage: (value: string) => void;
    handleKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
    isLoading: boolean;
    toggleListen: () => void;
    isListening: boolean;
    handleSend: () => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
    handleDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
    handleDrop: (event: React.DragEvent<HTMLDivElement>) => void;
    isDragOver: boolean;
    activeTab: string;
    setActiveTab: (value: string) => void;
}

const AdminInput = ({
    message,
    setMessage,
    handleKeyDown,
    isLoading,
    toggleListen,
    isListening,
    handleSend,
    fileInputRef,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    isDragOver,
    activeTab,
    setActiveTab,
} : AdminInputProps) => {
   
   const handleBulkKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && event.shiftKey) {
      // Allow new line on Shift+Enter
      return;
    }
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };


   return (
     <div className="relative w-full">
       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="single">Single Entry</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Entry</TabsTrigger>
          <TabsTrigger value="upload">File Upload</TabsTrigger>
        </TabsList>
        <TabsContent value="single">
           <div className="flex items-center gap-2 rounded-full border bg-card p-2 shadow-lg">
              <Button size="icon" variant="ghost" className="flex-shrink-0 rounded-full">
                  <Plus />
                  <span className="sr-only">Add attachment</span>
              </Button>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. BED SWITCH 2527 56 38"
                className="w-full border-none bg-transparent text-base shadow-none focus-visible:ring-0"
                disabled={isLoading}
              />
              <Button
                size="icon"
                variant="ghost"
                className={cn("flex-shrink-0 rounded-full", isListening ? "bg-destructive/20 text-destructive" : "")}
                onClick={toggleListen}
                disabled={isLoading}
              >
                <Mic className="h-4 w-4" />
                <span className="sr-only">Toggle Voice</span>
              </Button>
               <Button 
                  size="icon" 
                  className="flex-shrink-0 rounded-full" 
                  onClick={handleSend} 
                  disabled={isLoading || !message.trim()}
              >
                  <ArrowUp className="h-4 w-4" />
                  <span className="sr-only">Send</span>
              </Button>
            </div>
        </TabsContent>
         <TabsContent value="bulk">
            <div className="relative">
              <div className="flex items-end gap-2 rounded-xl border bg-card p-2 shadow-lg">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleBulkKeyDown}
                  placeholder={"Enter each product on a new line...\nIRON SOCKET 6335 103 69\nBED SWITCH 2527 56 38"}
                  className="flex-1 border-none bg-transparent text-base shadow-none focus-visible:ring-0 resize-none"
                  disabled={isLoading}
                  rows={4}
                />
                 <Button 
                    size="icon" 
                    className="flex-shrink-0 rounded-full self-end" 
                    onClick={handleSend} 
                    disabled={isLoading || !message.trim()}
                >
                    <ArrowUp className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                </Button>
              </div>
            </div>
        </TabsContent>
        <TabsContent value="upload">
             <div
                className={cn(
                  "relative flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-background p-10 shadow-lg transition-colors",
                  isDragOver && "border-primary bg-primary/10"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Drag and drop a CSV file here, or click to upload.</p>
                  <Button variant="outline" className="mt-4" disabled={isLoading}>
                    Upload File
                  </Button>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    disabled={isLoading}
                  />
                </div>
              </div>
        </TabsContent>
      </Tabs>
    </div>
   )
}


export function ChatInput({ onSendMessage, onSendFile, isLoading, products, conversationState }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const { transcript, isListening, startListening, stopListening, error } = useVoiceRecognition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = useUser();
  const userRole = user?.role;
  const [isClient, setIsClient] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState("single");

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (transcript) {
      setMessage(transcript);
    }
  }, [transcript]);
  
  useEffect(() => {
    if(error){
      console.error(error);
    }
  }, [error]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
      stopListening();
    }
  };

  const handleSuggestionClick = (productName: string) => {
    onSendMessage(productName);
    setMessage("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const toggleListen = () => {
    if (isListening) {
      stopListening();
    } else {
      setMessage("");
      startListening();
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onSendFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onSendFile(file);
    }
  };

  const suggestions = useMemo(() => {
    if (!message || userRole !== 'staff' || conversationState.type !== 'idle') return [];
    const searchTerm = message.toLowerCase().trim();
    if (!searchTerm) return [];
    return products.filter(p => p.name.trim().toLowerCase().includes(searchTerm)).slice(0, 5);
  }, [message, userRole, products, conversationState]);


  const StaffInput = () => (
     <div className="relative">
      <ProductSuggestions
        suggestions={suggestions}
        onSuggestionClick={handleSuggestionClick}
      />
      <div className="flex items-center gap-2 rounded-full border bg-card p-2 shadow-lg">
        <Button size="icon" variant="ghost" className="flex-shrink-0 rounded-full">
            <Plus />
            <span className="sr-only">Add attachment</span>
        </Button>
        <Input
          ref={textareaRef as any}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening..." : "Type a message..."}
          className="w-full border-none bg-transparent text-base shadow-none focus-visible:ring-0"
          disabled={isLoading}
          autoFocus
        />
        <Button
          size="icon"
          variant="ghost"
          className={cn("flex-shrink-0 rounded-full", isListening ? "bg-destructive/20 text-destructive" : "")}
          onClick={toggleListen}
          disabled={isLoading}
        >
          <Mic className="h-4 w-4" />
          <span className="sr-only">Toggle Voice</span>
        </Button>
         <Button 
            size="icon" 
            className="flex-shrink-0 rounded-full" 
            onClick={handleSend} 
            disabled={isLoading || !message.trim()}
        >
            <ArrowUp className="h-4 w-4" />
            <span className="sr-only">Send</span>
        </Button>
      </div>
    </div>
  );
  
  const MemoizedAdminInput = React.memo(AdminInput);


  if (!isClient) {
    return null;
  }

  return userRole === 'admin' ? <MemoizedAdminInput 
    message={message}
    setMessage={setMessage}
    handleKeyDown={handleKeyDown}
    isLoading={isLoading}
    toggleListen={toggleListen}
    isListening={isListening}
    handleSend={handleSend}
    fileInputRef={fileInputRef}
    handleFileChange={handleFileChange}
    handleDragOver={handleDragOver}
    handleDragLeave={handleDragLeave}
    handleDrop={handleDrop}
    isDragOver={isDragOver}
    activeTab={activeTab}
    setActiveTab={setActiveTab}
  /> : <StaffInput />;
}
