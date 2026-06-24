import React, { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

export default function FAQ() {
  const faqData = [
    {
      q: "How do I place an order?",
      a: "Browse our book catalog, add your preferred titles to the shopping cart, click checkout, fill in your delivery details, and pay by scanning the secure PhonePe UPI QR code. Once confirmed, we will process and ship your books."
    },
    {
      q: "What payment methods are accepted?",
      a: "Currently, we support direct UPI bank transfers via QR code scanning. You can scan the PhonePe code using Google Pay, PhonePe, Paytm, or any standard banking application on your mobile phone."
    },
    {
      q: "How can I track my order?",
      a: "Once your shipment leaves our central book hub, we will send an email containing your courier tracking link. You can also view update status logs directly within your profile alerts dashboard."
    },
    {
      q: "Can I return or exchange a book?",
      a: "Yes, we accept returns and exchanges within 7 business days of delivery. The item must be in its original packaging and undamaged. Contact support@onlinebookstore.com to initiate a request."
    },
    {
      q: "How do I contact customer support?",
      a: "You can send us a message using our direct Contact Form on the homepage, call us at +91 98765 43210, or send an email to hello@onlinebookstore.com. Our support desk is open daily from 9:00 AM to 9:00 PM."
    }
  ];

  const [activeIndex, setActiveIndex] = useState(null);

  const toggleIndex = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-4 shadow-sm">
            <HelpCircle className="h-6 w-6" />
          </div>
          <h1 className="font-playfair text-3xl font-black text-slate-900 md:text-4xl">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
            Find answers to common queries regarding ordering, shipping, payments, and book returns.
          </p>
        </div>

        {/* Accordion Group */}
        <div className="space-y-3.5">
          {faqData.map((item, index) => {
            const isOpen = activeIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all duration-350"
              >
                <button
                  onClick={() => toggleIndex(index)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-slate-900 hover:bg-slate-50 transition-colors focus:outline-none"
                >
                  <span className="pr-4">{item.q}</span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-blue-600 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-slate-500 text-xs leading-relaxed border-t border-slate-50 animate-in fade-in-50 slide-in-from-top-1.5 duration-200">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
