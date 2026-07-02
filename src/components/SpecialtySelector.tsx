import { Specialty } from "../types";
import { Stethoscope, Baby, HeartPulse, Sparkles, Bone, Brain, RefreshCw } from "lucide-react";
import { SPECIALTIES } from "../data";
import { motion } from "motion/react";

interface SpecialtySelectorProps {
  selectedSpecialty: string | null;
  onSelectSpecialty: (specialty: string | null) => void;
}

export default function SpecialtySelector({
  selectedSpecialty,
  onSelectSpecialty,
}: SpecialtySelectorProps) {
  // Map string icon names to Lucide elements
  const getIcon = (name: string, className: string) => {
    switch (name) {
      case "Stethoscope":
        return <Stethoscope className={className} id="icon-stethoscope" />;
      case "Baby":
        return <Baby className={className} id="icon-baby" />;
      case "HeartPulse":
        return <HeartPulse className={className} id="icon-heartpulse" />;
      case "Sparkles":
        return <Sparkles className={className} id="icon-sparkles" />;
      case "Bone":
        return <Bone className={className} id="icon-bone" />;
      case "Brain":
        return <Brain className={className} id="icon-brain" />;
      default:
        return <Stethoscope className={className} id="icon-default" />;
    }
  };

  return (
    <div className="w-full py-2" id="specialty-selector-container">
      <div className="flex items-center justify-between mb-4" id="specialty-header">
        <div>
          <h2 className="text-xl font-display font-semibold text-slate-800" id="specialty-title">
            Browse by Medical Specialty
          </h2>
          <p className="text-sm text-slate-500" id="specialty-subtitle">
            Select a category to find specialized professional care
          </p>
        </div>
        {selectedSpecialty && (
          <button
            onClick={() => onSelectSpecialty(null)}
            className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors px-3 py-1.5 rounded-full cursor-pointer"
            id="clear-specialty-btn"
          >
            <RefreshCw className="w-3.5 h-3.5" id="clear-specialty-icon" />
            Show All
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5" id="specialties-grid">
        {SPECIALTIES.map((spec) => {
          const isSelected = selectedSpecialty === spec.name;
          return (
            <motion.button
              key={spec.name}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectSpecialty(isSelected ? null : spec.name)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                isSelected
                  ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100"
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:shadow-xs"
              }`}
              id={`specialty-btn-${spec.name.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div
                className={`p-3 rounded-xl mb-3 ${
                  isSelected ? "bg-blue-500 text-white" : "bg-slate-50 text-blue-600"
                }`}
                id={`specialty-icon-container-${spec.name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {getIcon(spec.iconName, "w-6 h-6")}
              </div>
              <span className="text-xs font-semibold leading-tight mb-1" id={`specialty-name-${spec.name.toLowerCase().replace(/\s+/g, "-")}`}>
                {spec.name}
              </span>
              <span
                className={`text-[10px] ${
                  isSelected ? "text-blue-100" : "text-slate-400"
                }`}
                id={`specialty-count-${spec.name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {spec.count} Doctors
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
