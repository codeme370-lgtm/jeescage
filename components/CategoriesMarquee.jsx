import { categories } from "@/assets/assets";

const CategoriesMarquee = () => {
    return (
        <div className="w-full py-8 sm:py-12">
            <div className="max-w-7xl mx-auto px-4">
                <h3 className="text-center text-lg font-semibold text-slate-700 mb-6">Popular Categories</h3>
                
                <div className="relative overflow-hidden">
                    {/* Left gradient */}
                    <div className="absolute left-0 top-0 h-full w-12 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent" />
                    
                    {/* Scrolling container */}
                    <div 
                        className="flex gap-6"
                        style={{
                            animation: 'marqueeLeft 40s linear infinite',
                        }}
                    >
                        {[...categories, ...categories].map((category, index) => (
                            <div
                                key={index}
                                className="flex-shrink-0"
                            >
                                <div className="group relative bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl px-8 py-4 transition-all duration-300 hover:from-slate-100 hover:to-slate-150 hover:border-slate-400 hover:shadow-lg cursor-pointer min-w-max">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                            <span className="text-white font-bold text-sm">
                                                {category.charAt(0)}
                                            </span>
                                        </div>
                                        <span className="text-slate-700 font-medium text-sm sm:text-base group-hover:text-slate-900">
                                            {category}
                                        </span>
                                    </div>
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-purple-600/0 group-hover:from-blue-500/5 group-hover:to-purple-600/5 transition-all duration-300" />
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Right gradient */}
                    <div className="absolute right-0 top-0 h-full w-12 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent" />
                </div>
            </div>
        </div>
    );
};

export default CategoriesMarquee;