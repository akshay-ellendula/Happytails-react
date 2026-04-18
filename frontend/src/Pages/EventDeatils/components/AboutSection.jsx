const AboutSection = ({ event }) => {
  const host = event.eventManagerId;

  // Helper function to render the star UI
  const renderStars = (rating) => {
    if (!rating) return null;
    const roundedRating = Math.round(rating);
    return (
      <div className="flex text-[#f2c737] text-sm">
        {'★'.repeat(roundedRating)}
        <span className="text-white/20">
          {'★'.repeat(5 - roundedRating)}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-10">
      {/* Event Description */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">About the Event</h2>
        <p className="text-white/60 leading-relaxed text-lg whitespace-pre-line">
          {event.description}
        </p>
      </div>

      {/* Host Card Section */}
      {host && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Hosted By</h2>
          <div className="bg-[#111] rounded-2xl p-6 flex items-start gap-5">
            <img 
              src={host.profilePic || '/images/default-avatar.png'} 
              alt={host.userName} 
              className="w-16 h-16 rounded-full object-cover border-2 border-[#f2c737]"
            />
            
            <div className="flex-1 mt-1">
              <div className="flex items-center flex-wrap gap-3 mb-1">
                 <h3 className="text-lg font-bold text-white">
                   {host.userName}
                 </h3>
                 
                 {host.totalReviews > 0 ? (
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg">
                        <span className="font-bold text-sm text-white">{host.averageRating}</span>
                        {renderStars(host.averageRating)}
                        <span className="text-xs text-white/40 font-medium">({host.totalReviews} Reviews)</span>
                    </div>
                 ) : (
                    <span className="text-xs bg-[#f2c737] text-black px-3 py-1 rounded-lg font-bold uppercase tracking-wider">New Host</span>
                 )}
              </div>
              
              {host.companyName && (
                <p className="text-white/60 font-medium text-sm mb-2">
                  {host.companyName}
                </p>
              )}
              
              <p className="text-white/40 text-sm leading-relaxed">
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