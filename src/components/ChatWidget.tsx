import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: number;
  text: string;
  from: 'user' | 'bot';
}

const BOT_RESPONSES: Record<string, string> = {
  hello: "Hello! Welcome to Algiers Tourism. How can I help you today? 🌍",
  bonjour: "Bonjour ! Bienvenue sur Algiers Tourism. Comment puis-je vous aider ? 🌍",
  hotel: "We have a great selection of hotels in Algiers! Use the search bar on the homepage or visit the 'Explorer' page to browse all options.",
  booking: "To make a booking, visit any accommodation page and select your dates, rooms, and guests. You'll need to be logged in first!",
  réservation: "Pour réserver, visitez la page d'un hébergement, sélectionnez vos dates et le nombre de chambres. Connectez-vous d'abord !",
  price: "Our accommodations range from budget-friendly guesthouses to luxury hotels. Use the price filter on the search page to find what suits your budget.",
  prix: "Nos hébergements vont des maisons d'hôtes économiques aux hôtels de luxe. Utilisez le filtre de prix sur la page de recherche.",
  help: "I can help you with:\n• Finding accommodations\n• Booking information\n• Price ranges\n• Algiers attractions\n\nJust ask me anything!",
  aide: "Je peux vous aider avec :\n• Trouver un hébergement\n• Informations de réservation\n• Gammes de prix\n• Attractions à Alger\n\nDemandez-moi n'importe quoi !",
  algiers: "Algiers is a beautiful Mediterranean city! Popular attractions include the Casbah (UNESCO site), Notre-Dame d'Afrique, the Botanical Garden, and the stunning waterfront promenade.",
  alger: "Alger est une magnifique ville méditerranéenne ! Les attractions populaires incluent la Casbah (site UNESCO), Notre-Dame d'Afrique, le Jardin d'Essai, et la promenade du front de mer.",
  submit: "You can submit your own property! Go to the 'Submit Property' page from the navigation menu. You'll need to be logged in with Google.",
  thanks: "You're welcome! Feel free to ask if you need anything else. Enjoy your stay in Algiers! 😊",
  merci: "De rien ! N'hésitez pas à demander si vous avez besoin d'autre chose. Bon séjour à Alger ! 😊",
};

function getBotResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const [key, response] of Object.entries(BOT_RESPONSES)) {
    if (lower.includes(key)) return response;
  }
  return "Thank you for your message! I'm here to help with accommodation searches, bookings, and travel tips for Algiers. Try asking about hotels, prices, or attractions! 😊";
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, text: "Hello! 👋 Welcome to Algiers Tourism. How can I help you today?", from: 'bot' },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now(), text: input, from: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTimeout(() => {
      const botMsg: Message = { id: Date.now() + 1, text: getBotResponse(input), from: 'bot' };
      setMessages(prev => [...prev, botMsg]);
    }, 600);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
        aria-label="Chat"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 max-h-[70vh] bg-card border rounded-2xl shadow-elevated flex flex-col animate-fade-in-scale overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <div>
              <p className="font-heading text-sm">Algiers Tourism</p>
              <p className="text-xs opacity-80">Online • Responds instantly</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[50vh]">
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-line ${
                    m.from === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t p-3 flex gap-2">
            <Input
              placeholder="Type a message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              className="flex-1 h-9 text-sm"
            />
            <Button size="icon" className="h-9 w-9 shrink-0" onClick={send}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
