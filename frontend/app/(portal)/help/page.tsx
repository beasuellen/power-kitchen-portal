"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MessageCircle, ChevronDown, ChevronUp, Mail, ExternalLink, Salad, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    id: "faq_1",
    q: "How do I skip my next order?",
    a: "Go to My Orders and click on the upcoming order. You'll see a 'Skip Order' button at the top. You can also skip directly from the Dashboard with the 'Skip' button in the welcome banner.",
  },
  {
    id: "faq_2",
    q: "Can I change my delivery day?",
    a: "Yes! Go to My Plan → Delivery Preferences and select a new delivery day. Changes take effect from your next billing cycle.",
  },
  {
    id: "faq_3",
    q: "How do I apply a gift card or store credit?",
    a: "Go to Rewards → Credits & Gift Cards. You can enter your gift card code there. Store credits are automatically applied to your next order during checkout.",
  },
  {
    id: "faq_4",
    q: "What happens if I miss the customization deadline?",
    a: "If you miss the cutoff date, your order will be fulfilled with our chef's selection for your plan type. You can still rate those meals after delivery!",
  },
  {
    id: "faq_5",
    q: "How does the streak work?",
    a: "Your streak counts consecutive weeks where you received a delivery without skipping or pausing. Reaching streak milestones (4, 8, 12, 26, 52 weeks) earns you bonus rewards!",
  },
  {
    id: "faq_6",
    q: "Can I pause my subscription?",
    a: "Yes! Go to My Plan and select 'Pause Subscription'. Note that pausing resets your streak. We recommend skipping specific weeks instead if you just need a short break.",
  },
  {
    id: "faq_7",
    q: "How do I update my dietary restrictions?",
    a: "Go to My Plan → Dietary Restrictions. Toggle on the restrictions that apply to you, and your meal recommendations will automatically adjust.",
  },
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#004945]">Help & Support</h1>
        <p className="text-sm text-[#6B6B6B] mt-0.5">Find answers or contact our team</p>
      </div>

      {/* ── Nutritionist promo ── */}
      <div className="bg-gradient-to-r from-[#004945] to-[#006860] rounded-2xl p-5 flex items-center gap-4 text-white">
        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
          <UtensilsCrossed className="w-7 h-7 text-white/90" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-base">Talk to a Nutritionist</p>
          <p className="text-sm text-white/80 mt-0.5 leading-snug">
            Our registered nutritionists can help you optimize your meal plan, manage health goals, and answer any diet questions.
          </p>
          <button className="mt-3 px-4 py-2 bg-[#7ED22A] text-[#004945] font-semibold text-xs rounded-xl hover:bg-[#8fe830] transition-colors">
            Book a free session →
          </button>
        </div>
      </div>

      {/* Quick contact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card hover>
          <CardBody className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EAF7D9] flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-[#004945]" />
              </div>
              <div>
                <p className="font-semibold text-[#1A1A1A] text-sm">Live Chat</p>
                <p className="text-xs text-[#9E9E9E]">Mon–Fri, 9am–5pm EST</p>
              </div>
            </div>
            <Button className="w-full mt-3" size="sm">
              Start Chat
            </Button>
          </CardBody>
        </Card>
        <Card hover>
          <CardBody className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-[#1A1A1A] text-sm">Email Support</p>
                <p className="text-xs text-[#9E9E9E]">hello@powerkitchen.ca</p>
              </div>
            </div>
            <Button variant="secondary" className="w-full mt-3" size="sm">
              Send Email
            </Button>
          </CardBody>
        </Card>
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-[#004945]">Frequently Asked Questions</h2>
        </CardHeader>
        <CardBody className="pt-0 space-y-1">
          {faqs.map((faq) => {
            const isOpen = openFaq === faq.id;
            return (
              <div key={faq.id} className="border border-[#F0EBE0] rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[#FDFBF7] transition-colors"
                >
                  <span className="text-sm font-medium text-[#1A1A1A] pr-4">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#9E9E9E] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#9E9E9E] shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-sm text-[#6B6B6B] border-t border-[#F0EBE0] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </CardBody>
      </Card>

      {/* External link */}
      <div className="text-center space-y-2">
        <a
          href="https://powerkitchen.ca"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-[#004945] hover:underline"
        >
          Visit our website <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
