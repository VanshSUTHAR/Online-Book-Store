import React from "react";
import { Truck, Info, CreditCard, Package, Globe } from "lucide-react";

export default function Delivery() {
  const deliveryBlocks = [
    {
      title: "Shipping Times",
      desc: "Orders are processed and handed over to our shipping partners within 1-2 business days. Regular delivery typically takes 3-7 business days depending on your regional zip code location.",
      icon: Truck,
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: "Shipping Charges",
      desc: "We offer completely free shipping on all orders above ₹499. For standard orders below this amount, a nominal flat rate shipping fee of ₹40 applies across India.",
      icon: CreditCard,
      color: "bg-emerald-50 text-emerald-600"
    },
    {
      title: "Order Tracking",
      desc: "Once your books are shipped, we generate a high-priority dispatch order. You will receive an automated tracking link via email to follow your package journey.",
      icon: Package,
      color: "bg-indigo-50 text-indigo-600"
    },
    {
      title: "Delivery Partners",
      desc: "We partner with India's leading reliable express courier services (like BlueDart, Delhivery, and DTDC) to guarantee secure, damage-free, and swift delivery.",
      icon: Info,
      color: "bg-amber-50 text-amber-600"
    },
    {
      title: "International Shipping",
      desc: "Currently, our logistic operations only support deliveries within India. We hope to expand international global shipping services in the future.",
      icon: Globe,
      color: "bg-rose-50 text-rose-600"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-4 shadow-sm">
            <Truck className="h-6 w-6" />
          </div>
          <h1 className="font-playfair text-3xl font-black text-slate-900 md:text-4xl">
            Delivery & Shipping Information
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
            Review our logistics procedures, courier partners, shipping fees, and standard delivery timelines.
          </p>
        </div>

        {/* Card Grid Layout */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {deliveryBlocks.map((block, index) => {
            const Icon = block.icon;
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col space-y-4"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${block.color} shrink-0`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-poppins font-bold text-slate-900 text-sm">
                    {block.title}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    {block.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
