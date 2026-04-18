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
      <h3 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h3>
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div key={index} className="p-4 bg-[#111] rounded-xl">
            <p className="font-semibold text-white mb-1">{faq.question}</p>
            <p className="text-white/50 text-sm">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQSection;