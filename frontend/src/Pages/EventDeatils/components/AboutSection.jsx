const AboutSection = ({ event }) => {
  const host = event.eventManagerId;

  // Helper function to render the star UI
  const renderStars = (rating) => {
    if (!rating) return null;
    const roundedRating = Math.round(rating);
    return (
      <div className="flex text-[#f2c737] text-sm drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">
        {'★'.repeat(roundedRating)}
        <span className="text-gray-300 drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">
          {'★'.repeat(5 - roundedRating)}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-10">
      {/* Event Description */}
      <div>
        <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">About the Event</h2>
        <p className="text-[#1a1a1a] leading-relaxed text-lg whitespace-pre-line">
          {event.description}
        </p>
      </div>

      {/* Host Card Section */}
      {host && (
        <div>
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">Hosted By</h2>
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 flex items-start gap-5 shadow-sm">
            <img 
              src={host.profilePic || '/images/default-avatar.png'} 
              alt={host.userName} 
              className="w-20 h-20 rounded-full object-cover border-4 border-[#f2c737] shadow-md bg-white"
            />
            
            <div className="flex-1 mt-1">
              <div className="flex items-center flex-wrap gap-3 mb-1">
                 <h3 className="text-xl font-bold text-[#1a1a1a]">
                   {host.userName}
                 </h3>
                 
                 {/* Rating Display */}
                 {host.totalReviews > 0 ? (
                    <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                        <span className="font-bold text-sm">{host.averageRating}</span>
                        {renderStars(host.averageRating)}
                        <span className="text-xs text-gray-500 font-medium">({host.totalReviews} Reviews)</span>
                    </div>
                 ) : (
                    <span className="text-xs bg-[#effe8b] border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black px-3 py-1 rounded-full font-bold uppercase tracking-wider">New Host</span>
                 )}
              </div>
              
              {host.companyName && (
                <p className="text-gray-700 font-bold text-sm mb-2">
                  {host.companyName}
                </p>
              )}
              
              <p className="text-gray-600 text-sm leading-relaxed font-medium">
                Organizing exceptional pet events and experiences on HappyTails. Dedicated to bringing the pet community together.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutSection;