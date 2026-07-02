import { Appointment, Doctor } from "../types";
import { getNextDays } from "../data";
import { X, Calendar, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

interface RescheduleModalProps {
  appointment: Appointment | null;
  doctor: Doctor | null;
  onClose: () => void;
  isSlotBooked: (doctorId: string, date: string, time: string) => boolean;
  onConfirmReschedule: (id: string, newDate: string, newTime: string) => void;
}

export default function RescheduleModal({
  appointment,
  doctor,
  onClose,
  isSlotBooked,
  onConfirmReschedule,
}: RescheduleModalProps) {
  if (!appointment || !doctor) return null;

  const nextDays = getNextDays();
  const [selectedDate, setSelectedDate] = useState<string>(appointment.date);
  const [selectedTime, setSelectedTime] = useState<string | null>(appointment.timeSlot);
  const [isSaving, setIsSaving] = useState(false);

  const activeDateObj = nextDays.find((d) => d.dateString === selectedDate);
  const isDoctorAvailableToday = doctor.availableDays.includes(activeDateObj?.dayName || "");

  const handleConfirm = () => {
    if (!selectedTime) return;
    setIsSaving(true);
    setTimeout(() => {
      onConfirmReschedule(appointment.id, selectedDate, selectedTime);
      setIsSaving(false);
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" id="reschedule-modal-portal">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
          id="reschedule-backdrop"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col z-10"
          id="reschedule-content"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 flex-shrink-0" id="reschedule-header">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2" id="reschedule-title">
              <Calendar className="w-4.5 h-4.5 text-blue-600" />
              Reschedule Appointment
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              aria-label="Close reschedule modal"
              id="reschedule-close-btn"
            >
              <X className="w-4.5 h-4.5" id="reschedule-close-icon" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-5" id="reschedule-body">
            {isSaving ? (
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-3" id="reschedule-saving-state">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center animate-spin" id="reschedule-saving-spinner">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm" id="reschedule-saving-title">Updating Clinic Reservation</h4>
                <p className="text-[11px] text-slate-400" id="reschedule-saving-desc">Re-allocating your time slot with {doctor.name}...</p>
              </div>
            ) : (
              <>
                {/* Doctor and original slot brief */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50 space-y-2.5" id="reschedule-summary">
                  <div className="flex items-center gap-2.5" id="reschedule-doc-badge">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-8 h-8 rounded-lg object-cover bg-white border border-slate-100"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="text-[11px] font-bold text-slate-800 leading-none">{doctor.name}</p>
                      <p className="text-[9px] text-slate-400 font-semibold">{doctor.specialty}</p>
                    </div>
                  </div>
                  
                  {/* Transition display */}
                  <div className="flex items-center justify-between text-[11px] border-t border-slate-100/70 pt-2 text-slate-500" id="reschedule-slot-transition">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Current Slot</p>
                      <p className="font-bold text-slate-700 mt-0.5">{appointment.date}</p>
                      <p className="text-slate-500">{appointment.timeSlot}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                    <div>
                      <p className="text-[9px] font-bold text-blue-400 uppercase tracking-wider">New Selected Slot</p>
                      {selectedDate && selectedTime ? (
                        <>
                          <p className="font-bold text-blue-700 mt-0.5">{selectedDate}</p>
                          <p className="text-blue-600 font-semibold">{selectedTime}</p>
                        </>
                      ) : (
                        <p className="text-slate-300 italic mt-0.5">Please select...</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Calendar Date Picker */}
                <div className="space-y-2" id="reschedule-calendar-block">
                  <p className="text-xs font-bold text-slate-500">1. Select New Date</p>
                  <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none" id="reschedule-date-pills">
                    {nextDays.map((day) => {
                      const isAvailable = doctor.availableDays.includes(day.dayName);
                      const isSelected = selectedDate === day.dateString;
                      return (
                        <button
                          key={day.dateString}
                          onClick={() => isAvailable && setSelectedDate(day.dateString)}
                          disabled={!isAvailable}
                          className={`flex flex-col items-center justify-center p-2 min-w-[64px] rounded-xl border text-center transition-all flex-shrink-0 ${
                            !isAvailable
                              ? "bg-slate-50/30 border-slate-100 text-slate-200 cursor-not-allowed opacity-40"
                              : isSelected
                              ? "bg-blue-600 border-blue-600 text-white font-medium"
                              : "bg-white border-slate-150 text-slate-600 hover:border-slate-300 cursor-pointer"
                          }`}
                          id={`reschedule-date-pill-${day.dateString}`}
                        >
                          <span className="text-[9px] uppercase tracking-wider font-semibold opacity-80">{day.dayName}</span>
                          <span className="text-sm font-bold leading-none mt-0.5">{day.formattedDate.split(" ")[2]}</span>
                          <span className="text-[8px] mt-0.5 font-medium opacity-90">{day.formattedDate.split(" ")[1]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                 {/* Time picker */}
                {isDoctorAvailableToday ? (
                  <div className="space-y-2" id="reschedule-slots-block">
                    <p className="text-xs font-bold text-slate-500">2. Select New Time Slot</p>
                    <div className="grid grid-cols-3 gap-2" id="reschedule-slots-grid">
                      {doctor.timeSlots.map((time) => {
                        const isBooked = isSlotBooked(doctor.id, selectedDate, time);
                        const isSelected = selectedTime === time;

                        return (
                          <button
                            key={time}
                            disabled={isBooked}
                            onClick={() => setSelectedTime(time)}
                            className={`flex items-center justify-center py-2 px-2.5 rounded-lg border text-[11px] font-semibold transition-all ${
                              isBooked
                                ? "bg-slate-50 border-slate-100 text-slate-300 line-through cursor-not-allowed"
                                : isSelected
                                ? "bg-blue-600 border-blue-600 text-white"
                                : "bg-blue-50/30 border-blue-50/50 text-blue-700 hover:bg-blue-50 hover:border-blue-100 cursor-pointer"
                            }`}
                            id={`reschedule-time-slot-${time.replace(/[:\s]/g, "-")}`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 bg-slate-50 rounded-xl" id="reschedule-not-available">
                    <p className="text-xs text-slate-500 font-semibold">No clinic slots on {activeDateObj?.formattedDate}</p>
                    <p className="text-[10px] text-slate-400">Please choose another day above</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {!isSaving && (
            <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center flex-shrink-0" id="reschedule-footer">
              <button
                onClick={onClose}
                className="text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                id="reschedule-cancel-btn"
              >
                Cancel
              </button>
              <button
                disabled={!selectedDate || !selectedTime || (selectedDate === appointment.date && selectedTime === appointment.timeSlot)}
                onClick={handleConfirm}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedDate && selectedTime && (selectedDate !== appointment.date || selectedTime !== appointment.timeSlot)
                    ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
                id="reschedule-confirm-btn"
              >
                Apply Changes
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
