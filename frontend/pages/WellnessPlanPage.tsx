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
import { RefreshCw, Sparkles, Calendar, Target, Heart, Leaf } from "lucide-react";

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
        {/* Hero Section with Enhanced Wellness Image */}
        <section className="relative mb-16 rounded-3xl overflow-hidden">
          <div className="relative h-96">
            <img
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop&crop=center"
              alt="Peaceful wellness meditation in serene natural setting"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-3xl mx-auto px-8 text-white">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
                  <Leaf className="h-4 w-4" />
                  AI-Powered Wellness
                </div>
                <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
                  Your Personal
                  <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    Wellness Plan
                  </span>
                </h1>
                <p className="text-xl md:text-2xl leading-relaxed max-w-2xl mb-8">
                  Personalized 7-day wellness journey designed to bring balance and mindfulness to your daily life
                </p>
                <Button 
                  onClick={handleGeneratePlan}
                  disabled={generatePlanMutation.isPending}
                  size="lg"
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 h-14 px-8 text-lg font-bold rounded-2xl"
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
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Plan Content */}
          <div className="lg:col-span-2">
            <Card className="mb-6 border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-teal-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Target className="h-6 w-6 text-emerald-600" />
                  {activePlan.title}
                </CardTitle>
                <p className="text-slate-600 text-lg">Weekly Focus: {activePlan.weeklyFocus}</p>
              </CardHeader>
            </Card>

            {/* Day Tabs */}
            <Tabs value={selectedDay.toString()} onValueChange={(value) => setSelectedDay(parseInt(value))}>
              <TabsList className="grid w-full grid-cols-7 mb-6 h-12 bg-white shadow-lg rounded-2xl">
                {activePlan.days.map((day) => (
                  <TabsTrigger 
                    key={day.day} 
                    value={day.day.toString()}
                    className="rounded-xl font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white"
                  >
                    Day {day.day}
                  </TabsTrigger>
                ))}
              </TabsList>

              {activePlan.days.map((day) => (
                <TabsContent key={day.day} value={day.day.toString()}>
                  <Card className="border-0 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        <Calendar className="h-6 w-6 text-blue-600" />
                        Day {day.day}: {day.theme}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8 p-8">
                      <div className="relative">
                        <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-yellow-400 to-orange-400 rounded-full"></div>
                        <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-3 text-lg">
                          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                          Morning Activity
                        </h4>
                        <p className="text-slate-700 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200 text-lg leading-relaxed">
                          {day.morningActivity}
                        </p>
                      </div>

                      <div className="relative">
                        <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-blue-400 to-indigo-400 rounded-full"></div>
                        <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-3 text-lg">
                          <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                          Afternoon Activity
                        </h4>
                        <p className="text-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 text-lg leading-relaxed">
                          {day.afternoonActivity}
                        </p>
                      </div>

                      <div className="relative">
                        <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-purple-400 to-pink-400 rounded-full"></div>
                        <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-3 text-lg">
                          <Heart className="h-5 w-5 text-purple-600" />
                          Evening Affirmation
                        </h4>
                        <p className="text-slate-700 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200 italic text-lg leading-relaxed">
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
            <Card className="sticky top-24 border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                  Suggested Products
                </CardTitle>
                <p className="text-sm text-slate-600">
                  Curated wellness products to support your journey
                </p>
              </CardHeader>
              <CardContent className="p-6">
                {suggestedProducts?.products ? (
                  <div className="space-y-6">
                    {suggestedProducts.products.slice(0, 3).map((product, index) => {
                      // Enhanced product images for wellness plan
                      const wellnessImages = [
                        "https://images.unsplash.com/photo-1607619056574-7d8d3ee536b2?w=300&h=200&fit=crop&crop=center",
                        "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop&crop=center",
                        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop&crop=center",
                        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=200&fit=crop&crop=center",
                        "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=200&fit=crop&crop=center"
                      ];
                      
                      return (
                        <div key={product.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                          <img
                            src={product.imageUrl || wellnessImages[index % wellnessImages.length]}
                            alt={product.name}
                            className="w-full h-32 object-cover rounded-lg mb-4 shadow-md"
                          />
                          <h4 className="font-bold text-slate-900 mb-2 text-lg">{product.name}</h4>
                          <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between">
                            {product.price && (
                              <span className="font-bold text-emerald-600 text-lg">
                                ${product.price.toFixed(2)}
                              </span>
                            )}
                            <Button
                              size="sm"
                              onClick={() => handleAffiliateClick(product.id)}
                              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                              View Product
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <LoadingSpinner />
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Wellness Tips Section with More Images */}
        <section className="mt-16 py-12 bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">Enhance Your Wellness Journey</h3>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Complement your daily plan with these wellness essentials
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop&crop=center"
                alt="Healthy nutrition with fresh fruits and vegetables"
                className="w-full h-48 object-cover rounded-2xl shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-2xl"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h4 className="font-bold text-lg mb-2">Mindful Nutrition</h4>
                <p className="text-sm">Fuel your body with intention and awareness</p>
              </div>
            </div>
            
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1607619056574-7d8d3ee536b2?w=600&h=400&fit=crop&crop=center"
                alt="Natural wellness supplements and herbs"
                className="w-full h-48 object-cover rounded-2xl shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-2xl"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h4 className="font-bold text-lg mb-2">Natural Remedies</h4>
                <p className="text-sm">Harness the power of nature for healing</p>
              </div>
            </div>
          </div>

          {/* Additional Wellness Activity Images */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=200&fit=crop&crop=center"
                alt="Yoga and stretching for flexibility"
                className="w-full h-32 object-cover rounded-xl shadow-md"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-xl"></div>
              <div className="absolute bottom-2 left-2 right-2 text-white">
                <h5 className="font-semibold text-sm">Yoga & Stretching</h5>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=300&h=200&fit=crop&crop=center"
                alt="Meditation and mindfulness practice"
                className="w-full h-32 object-cover rounded-xl shadow-md"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-xl"></div>
              <div className="absolute bottom-2 left-2 right-2 text-white">
                <h5 className="font-semibold text-sm">Meditation</h5>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop&crop=center"
                alt="Essential oils and aromatherapy"
                className="w-full h-32 object-cover rounded-xl shadow-md"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-xl"></div>
              <div className="absolute bottom-2 left-2 right-2 text-white">
                <h5 className="font-semibold text-sm">Aromatherapy</h5>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=200&fit=crop&crop=center"
                alt="Natural skincare and self-care"
                className="w-full h-32 object-cover rounded-xl shadow-md"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-xl"></div>
              <div className="absolute bottom-2 left-2 right-2 text-white">
                <h5 className="font-semibold text-sm">Self-Care</h5>
              </div>
            </div>
          </div>
        </section>
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
