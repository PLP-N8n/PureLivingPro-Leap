import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Sparkles, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard } from "./ProductCard";
import { LoadingSpinner } from "./LoadingSpinner";
import backend from "~backend/client";

export function ProductRecommendations() {
  const [userInput, setUserInput] = useState("");
  const [budget, setBudget] = useState("");
  const [category, setCategory] = useState("");

  const recommendationMutation = useMutation({
    mutationFn: (data: { userInput: string; preferences?: any }) => 
      backend.ai.getProductRecommendations(data),
  });

  const handleGetRecommendations = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const preferences: any = {};
    if (budget) preferences.budget = budget;
    if (category) preferences.category = category;

    recommendationMutation.mutate({
      userInput,
      preferences: Object.keys(preferences).length > 0 ? preferences : undefined
    });
  };

  const handleAffiliateClick = (productId: number) => {
    // Track affiliate click for analytics
    console.log(`Affiliate click tracked for product ${productId}`);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-green-600" />
          AI Product Recommendations
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={handleGetRecommendations} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">What are your health goals?</label>
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="e.g., lose weight, build muscle, improve sleep, boost energy..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Budget Range</label>
              <Select value={budget} onValueChange={setBudget}>
                <SelectTrigger>
                  <SelectValue placeholder="Select budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Budget</SelectItem>
                  <SelectItem value="low">Under $50</SelectItem>
                  <SelectItem value="medium">$50 - $150</SelectItem>
                  <SelectItem value="high">$150+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="supplements">Supplements</SelectItem>
                  <SelectItem value="fitness">Fitness Equipment</SelectItem>
                  <SelectItem value="nutrition">Nutrition</SelectItem>
                  <SelectItem value="wellness">Wellness</SelectItem>
                  <SelectItem value="skincare">Skincare</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={recommendationMutation.isPending}
          >
            <Search className="h-4 w-4 mr-2" />
            Get Personalized Recommendations
          </Button>
        </form>

        {recommendationMutation.isPending && (
          <div className="text-center py-8">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Finding the best products for you...</p>
          </div>
        )}

        {recommendationMutation.data && (
          <div className="space-y-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800">{recommendationMutation.data.explanation}</p>
            </div>

            {recommendationMutation.data.recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendationMutation.data.recommendations.map((rec) => (
                  <ProductCard
                    key={rec.product.id}
                    product={rec.product}
                    reason={rec.reason}
                    confidenceScore={rec.confidenceScore}
                    onAffiliateClick={handleAffiliateClick}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  No specific recommendations found. Try adjusting your search or browse our categories.
                </p>
              </div>
            )}
          </div>
        )}

        {recommendationMutation.error && (
          <div className="text-center py-8">
            <p className="text-red-600">
              Sorry, we couldn't generate recommendations right now. Please try again later.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
