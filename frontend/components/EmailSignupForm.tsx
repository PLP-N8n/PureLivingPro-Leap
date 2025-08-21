import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import backend from '~backend/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Mail, ArrowRight } from 'lucide-react';

export function EmailSignupForm() {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (newEmail: string) => backend.newsletter.subscribe({ email: newEmail }),
    onSuccess: () => {
      toast({
        title: "Subscribed!",
        description: "Thanks for joining the Wellness Circle. Look out for updates in your inbox.",
      });
      setEmail('');
    },
    onError: (error: any) => {
      toast({
        title: "Subscription failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      mutation.mutate(email);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
      <div className="relative flex-1">
        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="pl-12 h-16 text-lg rounded-2xl border-2 border-slate-200 focus:border-green-500 bg-white/80 backdrop-blur-sm"
        />
      </div>
      <Button 
        type="submit" 
        disabled={mutation.isPending} 
        size="lg" 
        className="h-16 px-8 text-lg rounded-2xl bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
      >
        {mutation.isPending ? 'Subscribing...' : (
          <>
            Join Circle
            <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </>
        )}
      </Button>
    </form>
  );
}
