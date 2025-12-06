import { SEOHead } from "../components/SEOHead";
import { Users, Target, Leaf, Sparkles } from "lucide-react";

export function AboutPage() {
  return (
    <>
      <SEOHead
        title="About Pure Living Pro"
        description="Learn about our mission to revolutionize wellness through AI-powered insights, expert content, and a commitment to natural, clean living."
        keywords={["about us", "wellness mission", "AI health", "natural living"]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6">
            Our Mission:
            <span className="block bg-gradient-to-r from-green-600 to-lime-600 bg-clip-text text-transparent">
              Wellness for All
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            We believe that everyone deserves to live a healthy, vibrant life. Pure Living Pro was founded to make holistic wellness accessible, understandable, and achievable for everyone, everywhere.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&h=600&fit=crop&crop=center"
              alt="Team working on wellness solutions"
              className="w-full h-auto object-cover rounded-3xl shadow-2xl"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-slate-900">Who We Are</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Pure Living Pro is a passionate team of wellness experts, technologists, writers, and creators dedicated to one simple goal: helping you live better. We combine the latest in AI technology with timeless wellness wisdom to create a platform that's both innovative and deeply human.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed">
              Our diverse team includes certified nutritionists, fitness trainers, mindfulness coaches, and data scientists, all working together to provide you with credible, personalized, and actionable wellness guidance.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-12 mb-20">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-12">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
              <Target className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Credibility</h3>
              <p className="text-slate-600">Evidence-based content and expert-vetted products you can trust.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
              <Leaf className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Natural Focus</h3>
              <p className="text-slate-600">A commitment to clean, natural, and sustainable wellness solutions.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
              <Sparkles className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Innovation</h3>
              <p className="text-slate-600">Using AI to personalize and enhance your wellness journey.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Community</h3>
              <p className="text-slate-600">Building a supportive space for everyone to thrive together.</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Join Us on Our Journey</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Whether you're just starting out or are well on your way, we're here to support you. Explore our content, try our wellness planner, and become part of the Pure Living Pro community today.
          </p>
        </div>
      </div>
    </>
  );
}
