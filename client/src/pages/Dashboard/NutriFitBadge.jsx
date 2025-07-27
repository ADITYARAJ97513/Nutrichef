import { HeartPulse, Apple, Flame } from 'lucide-react';

const NutriFitBadge = () => {
  return (
    <div className="w-full p-4 rounded-xl bg-gradient-to-br from-green-50 to-lime-100 shadow-md border border-green-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Apple className="text-green-600 h-6 w-6" />
          <h2 className="text-lg font-bold text-green-700">NutriChef</h2>
        </div>
        <Flame className="text-orange-500 h-5 w-5 animate-pulse" />
      </div>

      <div className="mt-2 space-y-2 text-sm text-gray-700">
        <div className="flex justify-between">
          <span>Energy Level</span>
          <span className="text-green-600 font-semibold">82%</span>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div className="bg-green-500 h-2 w-[82%] animate-pulse"></div>
        </div>
        <p className="text-xs italic text-green-800 mt-2">
          "Fuel your body. Power your day."
        </p>
      </div>

      <div className="mt-3 flex justify-end">
        <HeartPulse className="h-5 w-5 text-red-500 animate-ping" />
      </div>
    </div>
  );
};

export default NutriFitBadge;
