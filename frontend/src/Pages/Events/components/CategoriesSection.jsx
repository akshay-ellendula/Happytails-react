import CategoryCard from './CategoryCard';

const CategoriesSection = ({ categories, selectedCategory, onSelectCategory }) => {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-12 bg-[#f2c737]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-[#1a1a1a] mb-8">Explore Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {categories.map((category, index) => (
            <CategoryCard 
              key={index}
              emoji={category.emoji}
              title={category.name}
              isActive={selectedCategory === category.type}
              onClick={() => onSelectCategory(category.type)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;