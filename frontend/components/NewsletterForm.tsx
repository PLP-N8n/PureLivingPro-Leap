import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import backend from '~backend/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ButtonMovingBorder } from '@/components/ui/moving-border';
import { useToast } from '@/components/ui/use-toast';
import { Mail, ArrowRight } from 'lucide-react';

export function NewsletterForm() {
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
      <ButtonMovingBorder
        type="submit"
        disabled={mutation.isPending}
        className="bg-gradient-to-r from-green-600 to-lime-600 text-white font-bold"
        borderClassName="bg-[radial-gradient(var(--lime-500)_40%,transparent_60%)]"
      >
        {mutation.isPending ? 'Subscribing...' : (
          <div className="flex items-center gap-2 text-lg">
            Join Circle
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        )}
      </ButtonMovingBorder>
    </form>
  );
}
