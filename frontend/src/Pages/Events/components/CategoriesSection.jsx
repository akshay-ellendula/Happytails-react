import CategoryCard from './CategoryCard';

const CategoriesSection = ({ categories }) => {
  if (!categories || categories.length === 0) {
    return (
      <section className="py-16 bg-[#effe8b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#1a1a1a] mb-8">Explore Pet Events</h2>
          <p className="text-center text-gray-500">No categories available</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-[#effe8b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-[#1a1a1a] mb-8">Explore Pet Events</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((category, index) => (
            <CategoryCard 
              key={index}
              emoji={category.emoji}
              title={category.name}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;