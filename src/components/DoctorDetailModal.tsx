import { Doctor } from "../types";
import { getNextDays } from "../data";
import { X, Calendar, Clock, Star, Languages, GraduationCap, MapPin, DollarSign, HeartHandshake } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

interface DoctorDetailModalProps {
  doctor: Doctor | null;
  onClose: () => void;
  isSlotBooked: (doctorId: string, date: string, time: string) => boolean;
  onProceedToBooking: (doctor: Doctor, date: string, time: string) => void;
}

export default function DoctorDetailModal({
  doctor,
  onClose,
  isSlotBooked,
  onProceedToBooking,
}: DoctorDetailModalProps) {
  if (!doctor) return null;

  const nextDays = getNextDays();
  
  // Find the first available day for this doctor's schedule
  const initialAvailableDay = nextDays.find(d => doctor.availableDays.includes(d.dayName))?.dateString || nextDays[0]?.dateString;
  
  const [selectedDate, setSelectedDate] = useState<string>(initialAvailableDay);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const activeDateObj = nextDays.find((d) => d.dateString === selectedDate);
  const isDoctorAvailableToday = doctor.availableDays.includes(activeDateObj?.dayName || "");

  const handleDateChange = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedTime(null); // Reset time selection on date change
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" id="doctor-modal-portal">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
          id="doctor-modal-backdrop"
        />

        {/* Modal content container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col z-10"
          id="doctor-modal-content"
        >
          {/* Header Bar */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 flex-shrink-0" id="doctor-modal-header">
            <div className="flex items-center gap-2" id="doctor-modal-header-title">
              <HeartHandshake className="w-5 h-5 text-blue-600" id="doctor-modal-header-icon" />
              <span className="font-display font-bold text-slate-800 text-base" id="doctor-modal-header-text">Doctor Profile & Booking</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              aria-label="Close modal"
              id="doctor-modal-close-btn"
            >
              <X className="w-5 h-5" id="doctor-modal-close-icon" />
            </button>
          </div>

          {/* Body Scrollable Area */}
          <div className="overflow-y-auto p-6 space-y-6 flex-1" id="doctor-modal-body">
            {/* Top Overview Info */}
            <div className="flex flex-col sm:flex-row gap-5 items-start" id="doctor-modal-overview">
              <img
                src={doctor.image}
                alt={doctor.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover object-center bg-slate-50 border border-slate-100 flex-shrink-0 shadow-sm"
                referrerPolicy="no-referrer"
                id="doctor-modal-profile-img"
              />
              <div className="flex-1" id="doctor-modal-profile-info">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 mb-1.5" id="doctor-modal-specialty-badge">
                  {doctor.specialty}
                </span>
                <h2 className="font-display font-extrabold text-slate-800 text-2xl tracking-tight leading-tight" id="doctor-modal-name">
                  {doctor.name}
                </h2>
                
                {/* Rating */}
                <div className="flex items-center gap-1.5 mt-1.5" id="doctor-modal-rating">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" id="doctor-modal-rating-star" />
                  <span className="font-bold text-sm text-slate-700" id="doctor-modal-rating-value">{doctor.rating}</span>
                  <span className="text-xs text-slate-400" id="doctor-modal-reviews-count">({doctor.reviewsCount} verified patient reviews)</span>
                </div>

                {/* Grid details */}
                <div className="grid grid-cols-2 gap-3 mt-4 text-xs text-slate-600" id="doctor-modal-quick-stats">
                  <div className="flex items-center gap-2" id="doctor-modal-quick-fee">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0" id="doctor-modal-fee-bg">
                      <DollarSign className="w-4 h-4" id="doctor-modal-fee-icon" />
                    </div>
                    <div id="doctor-modal-fee-text">
                      <p className="text-[10px] text-slate-400 font-medium">Consultation Fee</p>
                      <p className="font-bold text-slate-800">${doctor.fee}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2" id="doctor-modal-quick-wait">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0" id="doctor-modal-wait-bg">
                      <Clock className="w-4 h-4" id="doctor-modal-wait-icon" />
                    </div>
                    <div id="doctor-modal-wait-text">
                      <p className="text-[10px] text-slate-400 font-medium">Est. Wait Time</p>
                      <p className="font-bold text-slate-800">~{doctor.waitTime}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* About / Credentials */}
            <div className="space-y-4 pt-4 border-t border-slate-50" id="doctor-modal-about-section">
              <div id="doctor-modal-bio-block">
                <h3 className="font-display font-semibold text-slate-800 text-sm mb-1.5" id="doctor-modal-bio-title">Biography</h3>
                <p className="text-xs text-slate-500 leading-relaxed" id="doctor-modal-bio-content">{doctor.bio}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4" id="doctor-modal-credentials-grid">
                <div className="flex items-start gap-2.5" id="doctor-modal-edu-block">
                  <GraduationCap className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" id="doctor-modal-edu-icon" />
                  <div id="doctor-modal-edu-details">
                    <h4 className="font-semibold text-xs text-slate-800" id="doctor-modal-edu-title">Education & Credentials</h4>
                    <p className="text-[11px] text-slate-500 leading-snug mt-0.5" id="doctor-modal-edu-content">{doctor.education}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5" id="doctor-modal-lang-block">
                  <Languages className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" id="doctor-modal-lang-icon" />
                  <div id="doctor-modal-lang-details">
                    <h4 className="font-semibold text-xs text-slate-800" id="doctor-modal-lang-title">Languages Spoken</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5" id="doctor-modal-lang-content">{doctor.languages.join(", ")}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-1.5" id="doctor-modal-loc-block">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" id="doctor-modal-loc-icon" />
                <div id="doctor-modal-loc-details">
                  <h4 className="font-semibold text-xs text-slate-800" id="doctor-modal-loc-title">Clinic Location</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5" id="doctor-modal-loc-content">{doctor.location}</p>
                </div>
              </div>
            </div>

            {/* Availability and Booking Steps */}
            <div className="pt-5 border-t border-slate-100 space-y-4" id="doctor-modal-booking-panel">
              <div id="doctor-modal-booking-header">
                <h3 className="font-display font-semibold text-slate-800 text-sm flex items-center gap-1.5" id="doctor-modal-booking-title">
                  <Calendar className="w-4 h-4 text-blue-600" id="doctor-modal-booking-icon" />
                  Select Date & Time
                </h3>
                <p className="text-xs text-slate-400" id="doctor-modal-booking-subtitle">Choose a convenient time slot below</p>
              </div>

              {/* Horizontal Date Picker */}
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none" id="doctor-modal-date-picker">
                {nextDays.map((day) => {
                  const isAvailable = doctor.availableDays.includes(day.dayName);
                  const isSelected = selectedDate === day.dateString;
                  return (
                    <button
                      key={day.dateString}
                      onClick={() => isAvailable && handleDateChange(day.dateString)}
                      disabled={!isAvailable}
                      className={`flex flex-col items-center justify-center p-2.5 min-w-[76px] rounded-xl border text-center transition-all flex-shrink-0 ${
                        !isAvailable
                          ? "bg-slate-50/50 border-slate-100 text-slate-300 cursor-not-allowed opacity-50"
                          : isSelected
                          ? "bg-blue-600 border-blue-600 text-white font-medium"
                          : "bg-white border-slate-150 text-slate-700 hover:border-slate-300 cursor-pointer"
                      }`}
                      id={`date-pill-${day.dateString}`}
                    >
                      <span className="text-[10px] uppercase tracking-wider font-semibold opacity-75" id={`date-day-name-${day.dateString}`}>{day.dayName}</span>
                      <span className="text-base font-bold leading-none mt-1" id={`date-day-num-${day.dateString}`}>{day.formattedDate.split(" ")[2]}</span>
                      <span className="text-[9px] mt-1 font-medium opacity-90" id={`date-month-${day.dateString}`}>{day.formattedDate.split(" ")[1]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Grid of Time Slots */}
              {isDoctorAvailableToday ? (
                <div className="space-y-2" id="doctor-modal-slots-block">
                  <p className="text-xs font-semibold text-slate-500" id="doctor-modal-slots-label">Available Slots</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5" id="doctor-modal-slots-grid">
                    {doctor.timeSlots.map((time) => {
                      const isBooked = isSlotBooked(doctor.id, selectedDate, time);
                      const isSelected = selectedTime === time;

                      return (
                        <button
                          key={time}
                          disabled={isBooked}
                          onClick={() => setSelectedTime(time)}
                          className={`flex items-center justify-center py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                            isBooked
                              ? "bg-slate-50 border-slate-100 text-slate-300 line-through cursor-not-allowed"
                              : isSelected
                              ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                              : "bg-blue-50/30 border-blue-50/70 text-blue-700 hover:bg-blue-50 hover:border-blue-100 cursor-pointer"
                          }`}
                          id={`time-slot-${time.replace(/[:\s]/g, "-")}`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center bg-slate-50 rounded-2xl" id="doctor-modal-not-available">
                  <p className="text-xs font-semibold text-slate-500" id="doctor-modal-not-available-msg">
                    No office hours scheduled for {activeDateObj?.formattedDate}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5" id="doctor-modal-not-available-sub">Please select another date above</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer CTA Bar */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between flex-shrink-0" id="doctor-modal-footer">
            <div id="doctor-modal-footer-selection">
              {selectedDate && selectedTime ? (
                <div className="text-slate-700 flex items-center gap-1.5" id="doctor-modal-selection-text">
                  <Calendar className="w-4 h-4 text-slate-400" id="doctor-modal-footer-cal-icon" />
                  <span className="text-xs font-semibold text-slate-500">Selected appointment:</span>
                  <p className="text-xs font-bold text-slate-800" id="doctor-modal-footer-selected-val">
                    {activeDateObj?.formattedDate} at {selectedTime}
                  </p>
                </div>
              ) : (
                <span className="text-xs font-semibold text-slate-400" id="doctor-modal-footer-unselected-val">
                  Select a date and time slot to book
                </span>
              )}
            </div>

            <button
              disabled={!selectedDate || !selectedTime}
              onClick={() => onProceedToBooking(doctor, selectedDate, selectedTime!)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedDate && selectedTime
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
              id="proceed-booking-btn"
            >
              Continue to Details
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
