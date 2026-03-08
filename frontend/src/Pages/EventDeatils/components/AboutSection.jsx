const AboutSection = ({ event }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">About the Event</h2>
      <p className="text-[#1a1a1a] leading-relaxed text-lg">{event.description}</p>
    </div>
  );
};

export default AboutSection;