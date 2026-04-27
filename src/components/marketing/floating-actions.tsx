import { MessageCircle, Phone } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/917265098822?text=Hi";

export function FloatingActions() {
  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-3">
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="grid h-12 w-12 place-items-center rounded-full gradient-brand text-primary-foreground shadow-elegant transition-transform hover:scale-105"
      >
        <Phone className="h-5 w-5" />
      </a>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open chat"
        className="grid h-12 w-12 place-items-center rounded-full bg-accent text-accent-foreground shadow-glow transition-transform hover:scale-105"
      >
        <MessageCircle className="h-5 w-5" />
      </a>
    </div>
  );
}
