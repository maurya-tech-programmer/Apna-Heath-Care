import { Doctor } from "../types";
import { Star, Clock, MapPin, DollarSign, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface DoctorCardProps {
  key?: string;
  doctor: Doctor;
  onSelect: (doctor: Doctor) => void;
}

export default function DoctorCard({ doctor, onSelect }: DoctorCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between h-full group"
      id={`doctor-card-${doctor.id}`}
    >
      <div id={`doctor-card-top-${doctor.id}`}>
        {/* Doctor Header Info */}
        <div className="flex gap-4 items-start" id={`doctor-card-info-header-${doctor.id}`}>
          <img
            src={doctor.image}
            alt={doctor.name}
            className="w-16 h-16 rounded-xl object-cover object-center bg-slate-50 border border-slate-100 flex-shrink-0"
            referrerPolicy="no-referrer"
            id={`doctor-card-image-${doctor.id}`}
          />
          <div className="min-w-0 flex-1" id={`doctor-card-text-container-${doctor.id}`}>
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 mb-1"
              id={`doctor-card-specialty-badge-${doctor.id}`}
            >
              {doctor.specialty}
            </span>
            <h3
              className="font-display font-bold text-slate-800 text-lg leading-snug group-hover:text-blue-600 transition-colors truncate"
              id={`doctor-card-name-${doctor.id}`}
            >
              {doctor.name}
            </h3>
            
            {/* Rating */}
            <div className="flex items-center gap-1 mt-1 text-xs" id={`doctor-card-rating-container-${doctor.id}`}>
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" id={`doctor-card-star-${doctor.id}`} />
              <span className="font-semibold text-slate-700" id={`doctor-card-rating-value-${doctor.id}`}>
                {doctor.rating}
              </span>
              <span className="text-slate-400" id={`doctor-card-reviews-count-${doctor.id}`}>
                ({doctor.reviewsCount} reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Short bio excerpt */}
        <p className="text-xs text-slate-500 mt-4 line-clamp-2 leading-relaxed" id={`doctor-card-bio-${doctor.id}`}>
          {doctor.bio}
        </p>

        {/* Clinic & Medical Details */}
        <div className="grid grid-cols-2 gap-y-2.5 gap-x-2 border-t border-slate-100 pt-4 mt-4 text-xs text-slate-600" id={`doctor-card-details-${doctor.id}`}>
          <div className="flex items-center gap-1.5 min-w-0" id={`doctor-card-wait-${doctor.id}`}>
            <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" id={`doctor-card-wait-icon-${doctor.id}`} />
            <span className="truncate" id={`doctor-card-wait-text-${doctor.id}`}>Wait: ~{doctor.waitTime}</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0" id={`doctor-card-fee-${doctor.id}`}>
            <DollarSign className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" id={`doctor-card-fee-icon-${doctor.id}`} />
            <span className="truncate" id={`doctor-card-fee-text-${doctor.id}`}>Fee: ${doctor.fee}</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2 min-w-0" id={`doctor-card-location-${doctor.id}`}>
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" id={`doctor-card-location-icon-${doctor.id}`} />
            <span className="truncate text-slate-500" id={`doctor-card-location-text-${doctor.id}`}>
              {doctor.location}
            </span>
          </div>
        </div>
      </div>

      {/* Book Button */}
      <div className="mt-5 pt-3 border-t border-slate-100" id={`doctor-card-footer-${doctor.id}`}>
        <button
          onClick={() => onSelect(doctor)}
          className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-all duration-200 cursor-pointer group-hover:border-transparent"
          id={`doctor-card-book-btn-${doctor.id}`}
        >
          <span>View Profile & Book</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" id={`doctor-card-arrow-${doctor.id}`} />
        </button>
      </div>
    </motion.div>
  );
}
