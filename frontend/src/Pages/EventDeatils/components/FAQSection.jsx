const FAQSection = () => {
  const faqs = [
    {
      question: "What time should I arrive?",
      answer: "Doors open 1 hour before the event starts."
    },
    {
      question: "Is parking available?",
      answer: "Yes, paid parking is available at the venue. "
    },
    {
      question: "Can I get a refund?",
      answer: "All ticket sales are final and non-refundable."
    },

  ];

  return (
    <div>
      <h3 className="text-xl font-bold text-[#1a1a1a] mb-4">Frequently Asked Questions</h3>
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div key={index} className="p-4 bg-[#effe8b] rounded-xl">
            <p className="font-semibold text-[#1a1a1a]">{faq.question}</p>
            <p className="text-[#1a1a1a] text-sm mt-1">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQSection;