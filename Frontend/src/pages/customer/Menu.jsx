import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import foodService from "../../services/foodService";
import coverMenu from "../../assets/cover-customer-menu.avif";

const categoriesFallback = [
  "Appetizers",
  "Main Courses",
  "Desserts",
  "Beverages",
];

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(
    categoriesFallback[0]
  );

  useEffect(() => {
    let isMounted = true;
    foodService
      .getAllFoodItems()
      .then((data) => {
        if (!isMounted) return;
        setItems(data);
      })
      .catch((err) => {
        console.error(err);
        if (!isMounted) return;
        setError("Failed to load menu items.");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Build categories list with fallback order first, then any additional ones from data
  const extraCats = items
    .map((item) => item.category)
    .filter(Boolean)
    .filter((cat) => !categoriesFallback.includes(cat));

  const categories = [...categoriesFallback, ...extraCats];

  const filteredItems = items.filter(
    (item) => item.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-['Public_Sans',sans-serif] flex flex-col">
      {/* Hero Section */}
      <div
        className="relative w-full h-52 md:h-72 lg:h-80 bg-cover bg-center"
        style={{ backgroundImage: `url(${coverMenu})` }}
      >
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h1 className="text-white text-3xl md:text-5xl font-bold tracking-tight">
            Our Menu
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-6xl mx-auto px-4 py-10 flex flex-col gap-10 flex-1">
        {/* Category Tabs */}
        <div className="flex gap-3 overflow-x-auto">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat)}
              className="px-6 py-2 whitespace-nowrap rounded-lg text-sm font-semibold"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 w-full">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="h-56 rounded-xl bg-gray-200 animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-500 w-full">{error}</p>
        ) : (
          <>
            {filteredItems.length === 0 ? (
              <p className="text-center text-gray-500 w-full">
                No items found in this category.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
                {filteredItems.map((item) => (
                  <Card key={item._id || item.name} className="h-full">
                    {/* Image */}
                    {item.image && (
                      <CardHeader className="p-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-56 object-cover rounded-t-xl"
                        />
                      </CardHeader>
                    )}
                    <CardContent className="p-4 flex flex-col gap-1 items-center">
                      <CardTitle className="text-lg font-semibold text-center">
                        {item.name}
                      </CardTitle>
                      {/* unitType & price removed */}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 