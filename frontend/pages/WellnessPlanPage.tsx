import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import backend from "~backend/client";
import { SEOHead } from "../components/SEOHead";
import { ProductCard } from "../components/ProductCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Sparkles, Calendar, Target, Heart } from "lucide-react";

interface WellnessPlan {
  title: string;
  weeklyFocus: string;
  days: Array<{
    day: number;
    theme: string;
    morningActivity: string;
    afternoonActivity: string;
    eveningAffirmation: string;
  }>;
}

export function WellnessPlanPage() {
  const [currentPlan, setCurrentPlan] = useState<WellnessPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState(1);

  const { data: suggestedProducts } = useQuery({
    queryKey: ["wellness-products"],
    queryFn: () => backend.affiliate.listAffiliateProducts({ 
      category: "wellness",
      limit: 6 
    }),
  });

  const generatePlanMutation = useMutation({
    mutationFn: () => backend.ai.chatAssistant({
      message: "Generate a 7-day wellness plan with daily themes, activities, and affirmations focused on balance and mindful living.",
      sessionId: "wellness-plan-" + Date.now(),
    }),
    onSuccess: (response) => {
      // Parse AI response into structured plan
      const plan = parseWellnessPlan(response.response);
      setCurrentPlan(plan);
    },
  });

  const handleGeneratePlan = () => {
    generatePlanMutation.mutate();
  };

  const handleAffiliateClick = (productId: number) => {
    console.log(`Affiliate click tracked for product ${productId} from wellness plan`);
  };

  // Default plan if AI is not available
  const defaultPlan: WellnessPlan = {
    title: "7-Day Balance & Mindfulness Plan",
    weeklyFocus: "Finding Balance in Daily Life",
    days: [
      {
        day: 1,
        theme: "Mindful Morning",
        morningActivity: "5-minute meditation and gratitude journaling",
        afternoonActivity: "Take a mindful walk in nature",
        eveningAffirmation: "I am present and grateful for this moment"
      },
      {
        day: 2,
        theme: "Nourish Your Body",
        morningActivity: "Prepare a colorful, nutrient-rich breakfast",
        afternoonActivity: "Try a new healthy recipe for lunch",
        eveningAffirmation: "I nourish my body with love and intention"
      },
      {
        day: 3,
        theme: "Movement & Energy",
        morningActivity: "20-minute yoga or stretching routine",
        afternoonActivity: "Dance to your favorite music",
        eveningAffirmation: "My body is strong and capable"
      },
      {
        day: 4,
        theme: "Digital Detox",
        morningActivity: "Start the day without checking your phone",
        afternoonActivity: "Read a book or practice a hobby",
        eveningAffirmation: "I am in control of my relationship with technology"
      },
      {
        day: 5,
        theme: "Connection & Community",
        morningActivity: "Call or text someone you care about",
        afternoonActivity: "Practice active listening in conversations",
        eveningAffirmation: "I am connected to others and myself"
      },
      {
        day: 6,
        theme: "Creative Expression",
        morningActivity: "Write, draw, or create something for 15 minutes",
        afternoonActivity: "Try a new creative activity",
        eveningAffirmation: "I express my authentic self with confidence"
      },
      {
        day: 7,
        theme: "Rest & Reflection",
        morningActivity: "Sleep in and enjoy a slow morning",
        afternoonActivity: "Reflect on the week's experiences",
        eveningAffirmation: "I honor my need for rest and renewal"
      }
    ]
  };

  const activePlan = currentPlan || defaultPlan;
  const selectedDayData = activePlan.days.find(d => d.day === selectedDay) || activePlan.days[0];

  return (
    <>
      <SEOHead
        title="AI Wellness Plan - Personalized 7-Day Journey"
        description="Get your personalized 7-day wellness plan powered by AI. Daily activities, mindfulness practices, and product recommendations for balanced living."
        keywords={["wellness plan", "AI wellness", "7-day plan", "mindfulness", "healthy living", "balance"]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Your AI Wellness Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Personalized 7-day wellness journey designed to bring balance and mindfulness to your daily life
          </p>
          <Button 
            onClick={handleGeneratePlan}
            disabled={generatePlanMutation.isPending}
            size="lg"
            className="bg-green-600 hover:bg-green-700"
          >
            {generatePlanMutation.isPending ? (
              <>
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                {currentPlan ? "Regenerate Plan" : "Generate New Plan"}
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Plan Content */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  {activePlan.title}
                </CardTitle>
                <p className="text-gray-600">Weekly Focus: {activePlan.weeklyFocus}</p>
              </CardHeader>
            </Card>

            {/* Day Tabs */}
            <Tabs value={selectedDay.toString()} onValueChange={(value) => setSelectedDay(parseInt(value))}>
              <TabsList className="grid w-full grid-cols-7 mb-6">
                {activePlan.days.map((day) => (
                  <TabsTrigger key={day.day} value={day.day.toString()}>
                    Day {day.day}
                  </TabsTrigger>
                ))}
              </TabsList>

              {activePlan.days.map((day) => (
                <TabsContent key={day.day} value={day.day.toString()}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        Day {day.day}: {day.theme}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                          Morning Activity
                        </h4>
                        <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg">
                          {day.morningActivity}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                          Afternoon Activity
                        </h4>
                        <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
                          {day.afternoonActivity}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Heart className="h-4 w-4 text-purple-600" />
                          Evening Affirmation
                        </h4>
                        <p className="text-gray-700 bg-purple-50 p-3 rounded-lg italic">
                          "{day.eveningAffirmation}"
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Suggested Products Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Suggested Products</CardTitle>
                <p className="text-sm text-gray-600">
                  Curated wellness products to support your journey
                </p>
              </CardHeader>
              <CardContent>
                {suggestedProducts?.products ? (
                  <div className="space-y-4">
                    {suggestedProducts.products.slice(0, 3).map((product) => (
                      <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-32 object-cover rounded-md mb-3"
                          />
                        )}
                        <h4 className="font-medium text-gray-900 mb-2">{product.name}</h4>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          {product.price && (
                            <span className="font-semibold text-green-600">
                              ${product.price.toFixed(2)}
                            </span>
                          )}
                          <Button
                            size="sm"
                            onClick={() => handleAffiliateClick(product.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <LoadingSpinner />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

// Helper function to parse AI response into structured plan
function parseWellnessPlan(aiResponse: string): WellnessPlan {
  // This is a simplified parser - in a real implementation, you'd want more robust parsing
  return {
    title: "AI-Generated 7-Day Wellness Plan",
    weeklyFocus: "Personalized Balance & Growth",
    days: Array.from({ length: 7 }, (_, i) => ({
      day: i + 1,
      theme: `Day ${i + 1} Focus`,
      morningActivity: "AI-suggested morning activity",
      afternoonActivity: "AI-suggested afternoon activity",
      eveningAffirmation: "AI-generated affirmation for the day"
    }))
  };
}
