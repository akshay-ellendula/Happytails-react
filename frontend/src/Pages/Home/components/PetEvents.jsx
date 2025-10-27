// components/PetEvents.jsx
import React from 'react';
import { Link } from 'react-router';
import { Calendar, MapPin, Users } from 'lucide-react';

const PetEvents = () => {
  const events = [
    {
      id: 1,
      title: "Pet Adoption Drive",
      date: "2024-01-15",
      location: "Hyderabad Pet Park",
      attendees: 120,
      image: "/images/pet-adoption-drive.jpg",
      description: "Join us for a day of finding forever homes for our furry friends!"
    },
    {
      id: 2,
      title: "Dog Training Workshop",
      date: "2024-01-20",
      location: "Canine Training Center",
      attendees: 80,
      image: "/images/dog-training.jpg",
      description: "Learn essential training techniques with professional dog trainers"
    },
    {
      id: 3,
      title: "Cat Lovers Meetup",
      date: "2024-01-25",
      location: "Whiskers Cafe",
      attendees: 60,
      image: "/images/cat-meetup.jpg",
      description: "Connect with fellow cat enthusiasts and share stories"
    }
  ];

  return (
    <section className="slide-up mx-5 lg:mx-[75px] my-12 lg:my-24 bg-[#effe8b]">
      <h2 className="text-4xl lg:text-5xl font-bold mb-8 text-[#1a1a1a] text-center">Upcoming Pet Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {events.map((event) => (
          <div key={event.id} className="bg-white border-2 border-black rounded-xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <div className="relative h-48 overflow-hidden">
              <img 
                src={event.image} 
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 bg-[#effe8b] px-3 py-1 rounded-full text-sm font-bold border border-black text-[#1a1a1a]">
                Featured
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-bold text-[#1a1a1a] mb-3">{event.title}</h3>
              <p className="text-gray-600 mb-4">{event.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-700">
                  <Calendar className="w-4 h-4 mr-2 text-[#1a1a1a]" />
                  {new Date(event.date).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <MapPin className="w-4 h-4 mr-2 text-[#1a1a1a]" />
                  {event.location}
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Users className="w-4 h-4 mr-2 text-[#1a1a1a]" />
                  {event.attendees} attendees
                </div>
              </div>
              
              <Link 
                to={`/event/${event.id}`}
                className="block w-full bg-[#1a1a1a] text-white text-center py-3 rounded-lg font-semibold hover:bg-[#1a1a1a]/90 transition-colors border border-black"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-10">
        <Link 
          to="/events"
          className="inline-block px-8 py-3 text-lg text-white bg-[#1a1a1a] border-2 border-[#1a1a1a] rounded-full transition-all duration-300 hover:bg-transparent hover:text-[#1a1a1a] font-semibold"
        >
          View All Events
        </Link>
      </div>
    </section>
  );
};

export default PetEvents;