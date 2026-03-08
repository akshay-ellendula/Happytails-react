const TimerBanner = ({ time }) => {
  return (
    <div className="bg-purple-100 py-3">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm sm:text-base text-[#1a1a1a]">
          ⏱️ Complete your booking in <span className="font-bold text-purple-600">{time}</span> mins
        </p>
      </div>
    </div>
  );
};

export default TimerBanner;