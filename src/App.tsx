/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Doctor, Appointment, Specialty } from "./types";
import { DOCTORS, getNextDays } from "./data";
import SpecialtySelector from "./components/SpecialtySelector";
import DoctorCard from "./components/DoctorCard";
import DoctorDetailModal from "./components/DoctorDetailModal";
import BookingFormModal from "./components/BookingFormModal";
import AppointmentList from "./components/AppointmentList";
import RescheduleModal from "./components/RescheduleModal";
import Toast from "./components/Toast";
import { Search, Activity, CalendarDays, Heart, ShieldAlert, ArrowRight, Sparkles, SlidersHorizontal, Stethoscope, Database, Copy, Check, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { fetchAppointmentsFromSupabase, saveAppointmentToSupabase, updateAppointmentInSupabase, SUPABASE_SQL_SETUP } from "./lib/supabase";

export default function App() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  
  // Supabase Connection States
  const [supabaseStatus, setSupabaseStatus] = useState<"connecting" | "connected" | "error" | "no_table">("connecting");
  const [showSqlGuide, setShowSqlGuide] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  
  // Selection & Modal States
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingDate, setBookingDate] = useState<string | null>(null);
  const [bookingTime, setBookingTime] = useState<string | null>(null);
  
  const [rescheduleAppointment, setRescheduleAppointment] = useState<Appointment | null>(null);
  const [rescheduleDoctor, setRescheduleDoctor] = useState<Doctor | null>(null);
  
  const [activeModal, setActiveModal] = useState<"details" | "booking" | "reschedule" | null>(null);
  
  // Toast Alerts
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");

  // Load and seed initial appointments on mount
  useEffect(() => {
    async function loadData() {
      try {
        setSupabaseStatus("connecting");
        const data = await fetchAppointmentsFromSupabase();
        setAppointments(data);
        setSupabaseStatus("connected");
        localStorage.setItem("medical_appointments", JSON.stringify(data));
      } catch (err: any) {
        console.error("Supabase load error:", err);
        const isMissingTable = 
          err.code === "42P01" || 
          (err.message && err.message.toLowerCase().includes("does not exist")) ||
          (err.details && err.details.toLowerCase().includes("does not exist"));
        
        if (isMissingTable) {
          setSupabaseStatus("no_table");
        } else {
          setSupabaseStatus("error");
        }

        // Fallback to local storage
        const saved = localStorage.getItem("medical_appointments");
        if (saved) {
          try {
            setAppointments(JSON.parse(saved));
          } catch (e) {
            console.error("Error parsing saved appointments", e);
          }
        } else {
          // Seed an initial confirmed sample appointment so the screen looks alive instantly!
          const nextDays = getNextDays();
          if (nextDays.length > 0) {
            const seedDate = nextDays[0].dateString; // Tomorrow or next work day
            const seedAppt: Appointment = {
              id: "appt-seed-1",
              doctorId: "dr-carter",
              doctorName: "Dr. Evelyn Carter",
              doctorSpecialty: "Cardiology",
              doctorImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
              patientName: "Alex Mercer",
              patientEmail: "propradeepmaurya@gmail.com",
              patientPhone: "+1 555-0199",
              patientAge: 29,
              patientGender: "Male",
              date: seedDate,
              timeSlot: "10:30 AM",
              symptoms: "Routine annual heart checkup and blood pressure monitoring.",
              visitType: "In-Person",
              status: "Confirmed",
              createdAt: new Date().toISOString(),
            };
            setAppointments([seedAppt]);
            localStorage.setItem("medical_appointments", JSON.stringify([seedAppt]));
          }
        }
      }
    }
    loadData();
  }, []);

  const triggerToast = (msg: string, type: typeof toastType = "success") => {
    setToastMessage(msg);
    setToastType(type);
  };

  // Check if doctor slot is occupied
  const isSlotBooked = (doctorId: string, date: string, time: string) => {
    return appointments.some(
      (appt) =>
        appt.doctorId === doctorId &&
        appt.date === date &&
        appt.timeSlot === time &&
        appt.status !== "Cancelled"
    );
  };

  // Open Dr detail / selector modal
  const handleOpenDoctorDetail = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setActiveModal("details");
  };

  // From detail modal, proceed with slot info to filling form details
  const handleProceedToBooking = (doctor: Doctor, date: string, time: string) => {
    setBookingDate(date);
    setBookingTime(time);
    setActiveModal("booking");
  };

  // Submit and save new appointment
  const handleConfirmBooking = async (
    patientData: Omit<
      Appointment,
      "id" | "status" | "createdAt" | "doctorId" | "doctorName" | "doctorSpecialty" | "doctorImage"
    >
  ) => {
    if (!selectedDoctor || !bookingDate || !bookingTime) return;

    const newAppointment: Appointment = {
      id: `appt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      doctorSpecialty: selectedDoctor.specialty,
      doctorImage: selectedDoctor.image,
      status: "Confirmed",
      createdAt: new Date().toISOString(),
      ...patientData,
    };

    let savedToSupabase = false;
    try {
      await saveAppointmentToSupabase(newAppointment);
      savedToSupabase = true;
    } catch (err) {
      console.error("Failed to save to Supabase:", err);
    }

    const updated = [newAppointment, ...appointments];
    setAppointments(updated);
    localStorage.setItem("medical_appointments", JSON.stringify(updated));

    // Reset modals
    setActiveModal(null);
    setSelectedDoctor(null);
    setBookingDate(null);
    setBookingTime(null);

    if (savedToSupabase) {
      triggerToast(`Appointment successfully scheduled & synced with Supabase!`, "success");
    } else {
      triggerToast(`Scheduled locally (Supabase write failed. Check SQL setup script).`, "info");
    }
  };

  // Reschedule Trigger
  const handleOpenReschedule = (appt: Appointment) => {
    const doc = DOCTORS.find((d) => d.id === appt.doctorId) || null;
    if (doc) {
      setRescheduleAppointment(appt);
      setRescheduleDoctor(doc);
      setActiveModal("reschedule");
    } else {
      triggerToast("Error finding specialist schedule details.", "error");
    }
  };

  // Submit Reschedule Change
  const handleConfirmReschedule = async (apptId: string, newDate: string, newTime: string) => {
    let savedToSupabase = false;
    try {
      await updateAppointmentInSupabase(apptId, { date: newDate, timeSlot: newTime, status: "Confirmed" });
      savedToSupabase = true;
    } catch (err) {
      console.error("Failed to update in Supabase:", err);
    }

    const updated = appointments.map((appt) => {
      if (appt.id === apptId) {
        return {
          ...appt,
          date: newDate,
          timeSlot: newTime,
          status: "Confirmed" as const, // Reset if pending
        };
      }
      return appt;
    });

    setAppointments(updated);
    localStorage.setItem("medical_appointments", JSON.stringify(updated));

    if (savedToSupabase) {
      triggerToast("Your appointment schedule has been successfully updated in Supabase.", "success");
    } else {
      triggerToast("Rescheduled locally (Supabase write failed).", "info");
    }
  };

  // Cancel Appointment
  const handleCancelAppointment = async (id: string) => {
    let savedToSupabase = false;
    try {
      await updateAppointmentInSupabase(id, { status: "Cancelled" });
      savedToSupabase = true;
    } catch (err) {
      console.error("Failed to cancel in Supabase:", err);
    }

    const updated = appointments.map((appt) => {
      if (appt.id === id) {
        return { ...appt, status: "Cancelled" as const };
      }
      return appt;
    });

    setAppointments(updated);
    localStorage.setItem("medical_appointments", JSON.stringify(updated));

    if (savedToSupabase) {
      triggerToast("Appointment cancelled & synced with Supabase.", "error");
    } else {
      triggerToast("Appointment cancelled locally.", "error");
    }
  };

  // Search and specialty filter logics
  const filteredDoctors = DOCTORS.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.bio.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecialty = selectedSpecialty ? doc.specialty === selectedSpecialty : true;

    return matchesSearch && matchesSpecialty;
  });

  const getFormattedDateLabel = (dateStr: string) => {
    const nextDays = getNextDays();
    const dayObj = nextDays.find((d) => d.dateString === dateStr);
    return dayObj ? dayObj.formattedDate : dateStr;
  };

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans antialiased text-slate-800" id="main-app-container">
      {/* Clinic Header Banner */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40" id="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between" id="header-container">
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5" id="header-brand-group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs" id="brand-icon-bg">
              <Activity className="w-5 h-5" id="brand-icon" />
            </div>
            <div id="brand-text-block">
              <h1 className="font-display font-extrabold text-slate-900 text-base leading-none tracking-tight" id="brand-title">
                Veridian Medical Clinic
              </h1>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5" id="brand-subtitle">
                Apex Healthcare Alliance
              </p>
            </div>
          </div>

          {/* Slogan Banner */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-400 border-l border-slate-100 pl-4" id="header-slogan-block">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Clinic Hours: Mon - Sat (8:00 AM - 6:00 PM)</span>
          </div>

          <div className="flex items-center gap-2.5" id="header-patient-portal">
            {/* Supabase Connection Status Badge */}
            <div className="flex items-center" id="supabase-status-badge-container">
              {supabaseStatus === "connecting" && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-slate-50 text-slate-400 border border-slate-150 shadow-xs" id="status-connecting">
                  <Database className="w-3.5 h-3.5 animate-pulse" /> Connecting to DB...
                </div>
              )}
              {supabaseStatus === "connected" && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-150 shadow-xs" id="status-connected">
                  <Database className="w-3.5 h-3.5 text-emerald-500" /> Supabase: Connected
                </div>
              )}
              {supabaseStatus === "no_table" && (
                <button
                  onClick={() => setShowSqlGuide(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 cursor-pointer transition-colors shadow-xs"
                  id="status-no-table"
                  title="Click to view Supabase SQL setup script"
                >
                  <Database className="w-3.5 h-3.5 text-amber-500 animate-bounce" /> Database Setup Needed
                </button>
              )}
              {supabaseStatus === "error" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-red-50 text-red-700 border border-red-150 shadow-xs" id="status-error">
                  <Database className="w-3.5 h-3.5 text-red-500" /> DB Connection Error
                </span>
              )}
            </div>

            <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100" id="user-display-badge">
              Patient Portal Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="app-main">
        {/* Welcome Block */}
        <div className="mb-8" id="welcome-block">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest mb-1.5" id="pre-title">
            <Sparkles className="w-4 h-4" /> Comprehensive Scheduling Portal
          </div>
          <h2 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight" id="main-title">
            Book Experienced Specialists
          </h2>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl" id="main-subtitle">
            Search, filter, and schedule real-time digital consults or in-person visits with board-certified medical experts.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="main-layout-grid">
          
          {/* Left/Middle Core: Search & Browse Doctors */}
          <div className="lg:col-span-2 space-y-6" id="doctors-browse-column">
            
            {/* Search Input Box */}
            <div className="relative bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3" id="search-box-container">
              <Search className="w-5 h-5 text-slate-400 flex-shrink-0" id="search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search doctors by name, specialty (e.g. Pediatrics), or treatment bios..."
                className="w-full text-sm border-none bg-transparent placeholder-slate-400 focus:outline-hidden"
                id="doctor-search-input"
              />
              <div className="flex items-center gap-1 bg-slate-50 text-slate-400 px-2 py-1 rounded-lg text-[10px] font-bold border border-slate-100 flex-shrink-0" id="search-filter-badge">
                <SlidersHorizontal className="w-3 h-3" /> Filters
              </div>
            </div>

            {/* Specialty category selectors */}
            <div id="specialty-selector-block">
              <SpecialtySelector
                selectedSpecialty={selectedSpecialty}
                onSelectSpecialty={setSelectedSpecialty}
              />
            </div>

            {/* Listings Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mt-2" id="doctors-count-header">
              <h3 className="font-display font-bold text-slate-800 text-base" id="doctors-list-heading">
                {selectedSpecialty ? `${selectedSpecialty} Specialists` : "All Medical Specialists"}
              </h3>
              <span className="text-xs text-slate-500 font-medium" id="doctors-count-badge">
                Showing {filteredDoctors.length} doctors
              </span>
            </div>

            {/* Grid of Doctor Cards */}
            {filteredDoctors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="doctors-grid">
                <AnimatePresence mode="popLayout">
                  {filteredDoctors.map((doc) => (
                    <DoctorCard
                      key={doc.id}
                      doctor={doc}
                      onSelect={handleOpenDoctorDetail}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              /* No Results Empty State */
              <div className="text-center py-12 px-6 bg-white border border-slate-100 rounded-3xl" id="doctors-empty-state">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3" id="doctors-empty-icon-bg">
                  <ShieldAlert className="w-6 h-6" id="doctors-empty-icon" />
                </div>
                <h4 className="font-display font-bold text-slate-800 text-sm" id="doctors-empty-title">No Specialists Match Your Query</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed" id="doctors-empty-desc">
                  We couldn't find any medical practitioners matching your search terms. Try refining your keywords or select "Show All" above.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSpecialty(null);
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
                  id="doctors-empty-clear-btn"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Appointment Dashboard */}
          <div className="lg:col-span-1 space-y-6" id="appointments-dashboard-column">
            
            {/* Quick Promo Clinic Banner */}
            <div className="bg-linear-to-br from-blue-600 to-blue-800 rounded-3xl p-5 text-white shadow-md shadow-blue-100/50 relative overflow-hidden" id="clinic-promo-card">
              {/* Backlight elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10" id="promo-radial-1" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl -ml-10 -mb-10" id="promo-radial-2" />

              <div className="relative z-10 space-y-3" id="promo-content">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-widest uppercase bg-white/10 text-blue-100" id="promo-badge">
                  <CalendarDays className="w-3 h-3" /> Telehealth Active
                </span>
                <h3 className="font-display font-extrabold text-lg leading-tight" id="promo-title">
                  Same-Day Remote Consultation Services
                </h3>
                <p className="text-blue-100/80 text-[11px] leading-relaxed" id="promo-desc">
                  Unable to travel to our physical campus? Opt for a video-enabled virtual visit directly on your mobile or desktop device.
                </p>
                <div className="flex items-center gap-2 text-xs font-bold pt-1.5" id="promo-action">
                  <span>How to book</span>
                  <ArrowRight className="w-3.5 h-3.5" id="promo-action-icon" />
                </div>
              </div>
            </div>

            {/* List of Scheduled Appointments */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs" id="dashboard-appointments-list">
              <AppointmentList
                appointments={appointments}
                onCancelAppointment={handleCancelAppointment}
                onOpenRescheduleModal={handleOpenReschedule}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Floating Interactive Modals via Orchestration */}
      
      {/* 1. Doctor Details & Available Slot Selectors */}
      {activeModal === "details" && selectedDoctor && (
        <DoctorDetailModal
          doctor={selectedDoctor}
          onClose={() => {
            setActiveModal(null);
            setSelectedDoctor(null);
          }}
          isSlotBooked={isSlotBooked}
          onProceedToBooking={handleProceedToBooking}
        />
      )}

      {/* 2. Patient Registration Form Details */}
      {activeModal === "booking" && selectedDoctor && bookingDate && bookingTime && (
        <BookingFormModal
          doctor={selectedDoctor}
          date={bookingDate}
          formattedDate={getFormattedDateLabel(bookingDate)}
          timeSlot={bookingTime}
          onClose={() => {
            setActiveModal(null);
            setSelectedDoctor(null);
            setBookingDate(null);
            setBookingTime(null);
          }}
          onBack={() => {
            setActiveModal("details");
          }}
          onConfirmBooking={handleConfirmBooking}
        />
      )}

      {/* 3. Slot Rescheduling Overlay */}
      {activeModal === "reschedule" && rescheduleAppointment && rescheduleDoctor && (
        <RescheduleModal
          appointment={rescheduleAppointment}
          doctor={rescheduleDoctor}
          onClose={() => {
            setActiveModal(null);
            setRescheduleAppointment(null);
            setRescheduleDoctor(null);
          }}
          isSlotBooked={isSlotBooked}
          onConfirmReschedule={handleConfirmReschedule}
        />
      )}

      {/* Supabase SQL Setup Guide Modal */}
      {showSqlGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="supabase-sql-modal-overlay">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
            onClick={() => setShowSqlGuide(false)}
            id="supabase-sql-modal-backdrop"
          />
          
          {/* Modal Card */}
          <div 
            className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
            id="supabase-sql-modal-card"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100" id="sql-modal-header">
              <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2" id="sql-modal-title">
                <Database className="w-5 h-5 text-blue-600" />
                Supabase SQL Table Setup
              </h3>
              <button 
                onClick={() => setShowSqlGuide(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                id="sql-modal-close-btn"
                aria-label="Close modal"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed" id="sql-modal-body">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-blue-950 space-y-2" id="sql-modal-instructions">
                <p className="font-bold text-[13px] flex items-center gap-1.5" id="sql-instructions-title">
                  <Info className="w-4 h-4 text-blue-500" />
                  Connect Your Supabase Project
                </p>
                <p id="sql-instructions-body">
                  To store schedules persistently, create the <strong>appointments</strong> table in your Supabase SQL Editor. Copy and execute the script below in your Supabase dashboard.
                </p>
              </div>

              <div className="space-y-1.5" id="sql-code-label-group">
                <div className="flex justify-between items-center" id="sql-code-header">
                  <span className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">SQL Setup Script</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
                      setCopiedSql(true);
                      setTimeout(() => setCopiedSql(false), 2000);
                    }}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                      copiedSql 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
                    }`}
                    id="sql-copy-btn"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3 h-3" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy SQL Script
                      </>
                    )}
                  </button>
                </div>

                <div className="relative rounded-2xl overflow-hidden border border-slate-150 bg-slate-900 shadow-inner" id="sql-pre-container">
                  <pre className="p-4 overflow-x-auto text-[10.5px] font-mono text-slate-300 leading-relaxed max-h-60" id="sql-pre-block">
                    <code>{SUPABASE_SQL_SETUP}</code>
                  </pre>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-3 flex items-center justify-between" id="sql-modal-footer">
                <span>Project ID: <strong className="text-slate-600 font-mono">gmvcvvassdlqlnakihjm</strong></span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Auto-saved locally as fallback</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Persistent global alerts */}
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}
