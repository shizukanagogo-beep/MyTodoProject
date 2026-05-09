import type { Category } from "../types";

type CategoryCardProps={
    category:Category;
    onClick: (categoryId:number)=>void;
};

function CategoryCard({ category, onClick }: CategoryCardProps) {
  return (
    <div
      className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 cursor-pointer transition-all flex flex-col items-center justify-center text-center group"
      onClick={() => onClick(category.id)}
    >
      <div className="w-12 h-12 bg-indigo-50 rounded-full mb-3 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
        <span className="text-indigo-600 font-bold">
          {category.name[0]}
        </span>
      </div>

      <h3 className="font-bold text-slate-800">
        {category.name}
      </h3>
    </div>
  );
}

export default CategoryCard;