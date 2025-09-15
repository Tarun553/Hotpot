import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const CategoryCard = ({ category, image, onClick }) => {
  return (
    <Card
      onClick={onClick}
      className="group flex flex-col items-center justify-between w-44 h-64 cursor-pointer rounded-2xl border border-orange-200 bg-white shadow-sm transition-all hover:shadow-lg hover:border-orange-300"
    >
      <CardContent className="flex flex-col items-center justify-center p-4 w-full h-full">
        <div className="w-28 h-28 rounded-xl overflow-hidden shadow-sm mb-4">
          <img
            src={image}
            alt={category}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>
        <h3 className="text-lg font-semibold text-orange-600 text-center capitalize mt-auto">
          {category}
        </h3>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;
