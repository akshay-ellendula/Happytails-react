const TermsSection = () => {
  const terms = [
    "Please carry a valid ID proof along with you",
    "No refunds on purchased ticket are possible, even in case of any rescheduling",
    "Security procedures, including frisking remain the right of the management",
    "No dangerous or potentially hazardous objects including but not limited to weapons, knives, guns, fireworks, helmets, laser devices, bottles, musical instruments will be allowed in the venue",
    "The sponsor/performers/organizers are not responsible for any injury or damage occurring due to the event",
    "Any claims regarding the same would be settled in courts in Hyderabad",
    "People in an inebriated state may not be allowed entry",
    "Organizers hold the right to deny late entry to the event",
    "Venue rules apply",
  ];

  return (
    <div>
      <h3 className="text-xl font-bold text-white mb-4">
        Terms & Conditions
      </h3>
      <div className="bg-[#111] rounded-xl p-4 max-h-80 overflow-y-auto">
        <ul className="space-y-3 text-sm text-white/50">
          {terms.map((term, index) => (
            <li key={index} className="flex items-start">
              <span className="w-1.5 h-1.5 bg-[#f2c737] rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              {term}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TermsSection;
