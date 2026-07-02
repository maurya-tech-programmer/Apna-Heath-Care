import { Appointment } from "../types";
import { Calendar, Clock, Video, MapPin, User, ChevronRight, XCircle, RefreshCw, FileText, ExternalLink, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

interface AppointmentListProps {
  appointments: Appointment[];
  onCancelAppointment: (id: string) => void;
  onOpenRescheduleModal: (appointment: Appointment) => void;
}

export default function AppointmentList({
  appointments,
  onCancelAppointment,
  onOpenRescheduleModal,
}: AppointmentListProps) {
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  // Group or sort appointments: Active first, sorted by date/time, then cancelled
  const sortedAppointments = [...appointments].sort((a, b) => {
    // Cancelled to the bottom
    if (a.status === "Cancelled" && b.status !== "Cancelled") return 1;
    if (a.status !== "Cancelled" && b.status === "Cancelled") return -1;
    // Otherwise sorted by Date
    return new Date(`${a.date} ${a.timeSlot}`).getTime() - new Date(`${b.date} ${b.timeSlot}`).getTime();
  });

  const getStatusBadge = (status: Appointment["status"]) => {
    switch (status) {
      case "Confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Confirmed
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
            Cancelled
          </span>
        );
      case "Pending":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Calendar Pending
          </span>
        );
    }
  };

  const activeCount = appointments.filter((a) => a.status !== "Cancelled").length;

  return (
    <div className="space-y-4" id="appointment-list-wrapper">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3" id="appointment-list-header">
        <div>
          <h2 className="text-lg font-display font-bold text-slate-800" id="appointments-title">My Registered Appointments</h2>
          <p className="text-xs text-slate-500" id="appointments-subtitle">
            Manage your booked visits and digital consultations
          </p>
        </div>
        <div className="bg-blue-50 px-3 py-1 rounded-full border border-blue-100" id="appointments-count-badge">
          <span className="text-xs font-bold text-blue-700">{activeCount} Scheduled</span>
        </div>
      </div>

      {sortedAppointments.length === 0 ? (
        <div className="text-center py-10 px-6 bg-white border border-slate-100 rounded-3xl" id="appointments-empty-state">
          <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3" id="appointments-empty-icon">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="font-display font-semibold text-slate-700 text-sm" id="appointments-empty-title">No Appointments Yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed" id="appointments-empty-desc">
            You haven't booked any medical visits. Select a specialist from the listings and book a slot.
          </p>
        </div>
      ) : (
        <div className="space-y-3" id="appointments-cards-container">
          <AnimatePresence>
            {sortedAppointments.map((appt) => {
              const isExpanded = selectedAppointmentId === appt.id;
              const isConfirmingCancel = confirmCancelId === appt.id;
              const isActive = appt.status !== "Cancelled";

              return (
                <motion.div
                  key={appt.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                    isActive
                      ? "border-slate-150 shadow-xs hover:border-slate-200"
                      : "border-slate-100 opacity-70 bg-slate-50/50"
                  }`}
                  id={`appt-card-${appt.id}`}
                >
                  {/* Card Main Block */}
                  <div
                    className="p-4 flex flex-col sm:flex-row items-start justify-between gap-4 cursor-pointer hover:bg-slate-50/20 transition-all"
                    onClick={() => setSelectedAppointmentId(isExpanded ? null : appt.id)}
                    id={`appt-card-trigger-${appt.id}`}
                  >
                    <div className="flex gap-3.5 items-center" id={`appt-card-doctor-info-${appt.id}`}>
                      <img
                        src={appt.doctorImage}
                        alt={appt.doctorName}
                        className="w-12 h-12 rounded-xl object-cover object-center bg-slate-50 border border-slate-100 flex-shrink-0"
                        referrerPolicy="no-referrer"
                        id={`appt-card-doctor-img-${appt.id}`}
                      />
                      <div className="min-w-0" id={`appt-card-doctor-meta-${appt.id}`}>
                        <div className="flex items-center gap-2" id={`appt-card-specialty-${appt.id}`}>
                          <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-600">
                            {appt.doctorSpecialty}
                          </span>
                        </div>
                        <h4 className="font-display font-bold text-slate-800 text-sm leading-tight mt-0.5" id={`appt-card-doctor-name-${appt.id}`}>
                          {appt.doctorName}
                        </h4>
                        
                        {/* Time slots */}
                        <div className="flex items-center gap-3 text-slate-500 text-[11px] mt-1.5" id={`appt-card-date-time-${appt.id}`}>
                          <span className="flex items-center gap-1 font-semibold" id={`appt-card-date-span-${appt.id}`}>
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {appt.date}
                          </span>
                          <span className="flex items-center gap-1 font-semibold" id={`appt-card-time-span-${appt.id}`}>
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {appt.timeSlot}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge and Expand control */}
                    <div className="flex sm:flex-col items-end gap-2.5 self-stretch justify-between sm:justify-start" id={`appt-card-controls-${appt.id}`}>
                      {getStatusBadge(appt.status)}
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400" id={`appt-card-arrow-row-${appt.id}`}>
                        <span>{isExpanded ? "Show Less" : "Details"}</span>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90 text-indigo-600" : ""}`}
                          id={`appt-card-arrow-icon-${appt.id}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Drawer Area */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-4 text-xs text-slate-600"
                        id={`appt-card-expanded-${appt.id}`}
                      >
                        {/* Patient & Clinic Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id={`appt-details-grid-${appt.id}`}>
                          <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1.5" id={`appt-patient-block-${appt.id}`}>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider" id={`appt-patient-label-${appt.id}`}>Patient Details</p>
                            <p className="font-bold text-slate-800" id={`appt-patient-name-${appt.id}`}>{appt.patientName}</p>
                            <p className="text-slate-500" id={`appt-patient-age-gender-${appt.id}`}>
                              {appt.patientAge} years • {appt.patientGender}
                            </p>
                            <p className="text-slate-400 truncate" id={`appt-patient-contact-${appt.id}`}>{appt.patientEmail} • {appt.patientPhone}</p>
                          </div>

                          <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1.5" id={`appt-mode-block-${appt.id}`}>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider" id={`appt-mode-label-${appt.id}`}>Consultation Mode</p>
                            {appt.visitType === "Video" ? (
                              <div className="space-y-1" id={`appt-mode-video-${appt.id}`}>
                                <p className="font-bold text-blue-600 flex items-center gap-1.5" id={`appt-mode-video-title-${appt.id}`}>
                                  <Video className="w-4 h-4" /> Telehealth Video Call
                                </p>
                                <p className="text-slate-500" id={`appt-mode-video-desc-${appt.id}`}>HD virtual clinical diagnostic video link.</p>
                                {isActive && (
                                  <button
                                    onClick={() => alert(`Simulated Launch: Opening telehealth consulting video room for ${appt.patientName}. Let's make sure webcam/microphone are active!`)}
                                    className="inline-flex items-center gap-1 mt-1 font-bold bg-blue-600 text-white px-2.5 py-1.5 rounded-lg text-[10px] hover:bg-blue-700 transition-colors cursor-pointer shadow-xs"
                                    id={`video-launch-btn-${appt.id}`}
                                  >
                                    Join Video Room <ExternalLink className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-1" id={`appt-mode-inperson-${appt.id}`}>
                                <p className="font-bold text-slate-800 flex items-center gap-1.5" id={`appt-mode-inperson-title-${appt.id}`}>
                                  <MapPin className="w-4 h-4 text-emerald-600" /> In-Clinic Visit
                                </p>
                                <p className="text-slate-500 leading-snug" id={`appt-mode-inperson-desc-${appt.id}`}>
                                  Report at front desk: <span className="font-semibold text-slate-700">{appt.doctorName}'s cabinet</span>. Arrive 10m early.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Symptoms details */}
                        <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1" id={`appt-symptoms-block-${appt.id}`}>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider" id={`appt-symptoms-label-${appt.id}`}>Symptom Overview</p>
                          <p className="text-slate-700 italic leading-relaxed" id={`appt-symptoms-val-${appt.id}`}>
                            "{appt.symptoms}"
                          </p>
                        </div>

                        {/* Interactive management block */}
                        {isActive && (
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-3" id={`appt-mgmt-block-${appt.id}`}>
                            <span className="text-[10px] text-slate-400 font-medium" id={`appt-id-stamp-${appt.id}`}>
                              Booking Ref: {appt.id.toUpperCase()} • Created on booking request
                            </span>

                            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end" id={`appt-mgmt-buttons-${appt.id}`}>
                              {isConfirmingCancel ? (
                                <div className="flex items-center gap-2 bg-red-50 border border-red-100 px-2.5 py-1.5 rounded-xl text-[10px]" id={`appt-cancel-confirm-row-${appt.id}`}>
                                  <span className="font-bold text-red-700" id={`appt-cancel-confirm-msg-${appt.id}`}>Cancel appointment? This slot will be released.</span>
                                  <button
                                    onClick={() => onCancelAppointment(appt.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-1 rounded-md transition-all cursor-pointer"
                                    id={`appt-confirm-cancel-btn-${appt.id}`}
                                  >
                                    Yes, Cancel
                                  </button>
                                  <button
                                    onClick={() => setConfirmCancelId(null)}
                                    className="bg-white text-slate-600 font-bold px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
                                    id={`appt-cancel-abort-btn-${appt.id}`}
                                  >
                                    Abort
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => onOpenRescheduleModal(appt)}
                                    className="flex items-center justify-center gap-1.5 bg-white border border-slate-200 hover:border-blue-200 hover:bg-blue-50/20 text-slate-700 hover:text-blue-700 font-bold px-3 py-2 rounded-xl transition-all cursor-pointer"
                                    id={`appt-resched-btn-${appt.id}`}
                                  >
                                    <RefreshCw className="w-3.5 h-3.5" id={`appt-resched-icon-${appt.id}`} />
                                    Reschedule
                                  </button>
                                  <button
                                    onClick={() => setConfirmCancelId(appt.id)}
                                    className="flex items-center justify-center gap-1.5 bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-500 hover:text-red-600 font-bold px-3 py-2 rounded-xl transition-all cursor-pointer"
                                    id={`appt-cancel-btn-${appt.id}`}
                                  >
                                    <XCircle className="w-3.5 h-3.5" id={`appt-cancel-icon-${appt.id}`} />
                                    Cancel Visit
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
