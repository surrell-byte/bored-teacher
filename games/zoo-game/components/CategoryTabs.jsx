export function CategoryTabs({ categories, activeCategory, onChange, categoryOrder }) {
  return (
    <div className="category-tabs" role="tablist" aria-label="Animal categories">
      {categoryOrder.map((key) => {
        const category = categories[key];
        const isActive = key === activeCategory;

        return (
          <button
            key={key}
            className={`cat-btn ${isActive ? 'active' : ''}`}
            data-category={key}
            role="tab"
            aria-selected={isActive ? 'true' : 'false'}
            onClick={() => onChange(key)}
            type="button"
          >
            {category.emoji} {category.name} Animals
          </button>
        );
      })}
    </div>
  );
}
