import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "2348060063068";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      <MessageCircle className="h-7 w-7 fill-current" strokeWidth={1.5} />
    </a>
  );
}
