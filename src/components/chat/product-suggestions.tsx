
"use client";

import type { Product } from "@/lib/products";
import { Card } from "../ui/card";

interface ProductSuggestionsProps {
  suggestions: Product[];
  onSuggestionClick: (productName: string) => void;
}

export function ProductSuggestions({
  suggestions,
  onSuggestionClick,
}: ProductSuggestionsProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="absolute bottom-full mb-2 w-full p-2 shadow-lg">
      <p className="mb-2 text-sm font-medium text-muted-foreground">
        Suggestions
      </p>
      <ul className="space-y-1">
        {suggestions.map((product) => (
          <li key={product.id}>
            <button
              onClick={() => onSuggestionClick(product.name)}
              className="w-full rounded-md p-2 text-left text-sm hover:bg-accent"
            >
              {product.name}
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
