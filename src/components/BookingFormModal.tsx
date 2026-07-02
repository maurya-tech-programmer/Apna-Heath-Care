import { Doctor, VisitType, Appointment } from "../types";
import { X, ArrowLeft, HeartPulse, User, Mail, Phone, Calendar, Clock, FileText, Upload, ShieldCheck, CheckCircle2, Video, MapPin, Trash2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import React, { useState, useRef, useEffect } from "react";

interface BookingFormModalProps {
  doctor: Doctor;
  date: string; // YYYY-MM-DD
  formattedDate: string; // e.g. "Mon, Jul 6"
  timeSlot: string;
  onClose: () => void;
  onBack: () => void;
  onConfirmBooking: (appointmentData: Omit<Appointment, "id" | "status" | "createdAt" | "doctorId" | "doctorName" | "doctorSpecialty" | "doctorImage">) => void;
}

interface AttachedFile {
  id: string;
  name: string;
  size: string;
  progress: number;
  type: string;
}

export default function BookingFormModal({
  doctor,
  date,
  formattedDate,
  timeSlot,
  onClose,
  onBack,
  onConfirmBooking,
}: BookingFormModalProps) {
  // Form state
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("Male");
  const [visitType, setVisitType] = useState<VisitType>("In-Person");
  const [symptoms, setSymptoms] = useState("");
  
  // Custom states
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-fill some fields if user has pre-set details
  useEffect(() => {
    // Attempt to load from localStorage for quick return users
    const savedUser = localStorage.getItem("last_patient_info");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setPatientName(parsed.name || "");
        setPatientEmail(parsed.email || "");
        setPatientPhone(parsed.phone || "");
        setPatientAge(parsed.age || "");
        setPatientGender(parsed.gender || "Male");
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!patientName.trim()) newErrors.name = "Patient full name is required";
    if (!patientEmail.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(patientEmail)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!patientPhone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[0-9\s-]{7,15}$/.test(patientPhone)) {
      newErrors.phone = "Please enter a valid phone number";
    }
    if (!patientAge) {
      newErrors.age = "Age is required";
    } else {
      const ageNum = parseInt(patientAge);
      if (isNaN(ageNum) || ageNum <= 0 || ageNum > 125) {
        newErrors.age = "Please enter a valid age";
      }
    }
    if (!symptoms.trim()) {
      newErrors.symptoms = "Brief symptoms or reason for visit is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Save info for future auto-fill
    localStorage.setItem(
      "last_patient_info",
      JSON.stringify({
        name: patientName,
        email: patientEmail,
        phone: patientPhone,
        age: patientAge,
        gender: patientGender,
      })
    );

    setIsSubmitted(true);
    
    // Animate transition, then call confirmation
    setTimeout(() => {
      onConfirmBooking({
        patientName,
        patientEmail,
        patientPhone,
        patientAge: parseInt(patientAge),
        patientGender,
        date,
        timeSlot,
        symptoms,
        visitType,
      });
    }, 2000);
  };

  // Drag and Drop implementation
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFiles = (fileList: FileList) => {
    const newFiles: AttachedFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(0)} KB`;
      
      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      newFiles.push({
        id: fileId,
        name: file.name,
        size: sizeStr,
        progress: 0,
        type: file.type || "application/octet-stream",
      });

      // Simulate a real upload progress loader
      simulateUploadProgress(fileId);
    }
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files);
    }
  };

  const simulateUploadProgress = (id: string) => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 25) + 10;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
      }
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, progress: currentProgress } : f))
      );
    }, 150);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" id="booking-modal-portal">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
          id="booking-modal-backdrop"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col z-10"
          id="booking-modal-content"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 flex-shrink-0" id="booking-modal-header">
            <div className="flex items-center gap-2 text-slate-800" id="booking-modal-title">
              <button
                onClick={onBack}
                className="p-1.5 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors mr-1 cursor-pointer"
                aria-label="Back to profile"
                id="booking-modal-back-btn"
              >
                <ArrowLeft className="w-5 h-5" id="booking-modal-back-icon" />
              </button>
              <HeartPulse className="w-5 h-5 text-blue-600 animate-pulse" id="booking-modal-heart-icon" />
              <span className="font-display font-bold text-base" id="booking-modal-header-text">Fill Patient Details</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              aria-label="Close modal"
              id="booking-modal-close-btn"
            >
              <X className="w-5 h-5" id="booking-modal-close-icon" />
            </button>
          </div>

          {/* Form Scrollable Area */}
          <form onSubmit={handleSubmit} className="overflow-y-auto flex-1" id="booking-details-form">
            {isSubmitted ? (
              /* Submission Processing Visual State */
              <div className="flex flex-col items-center justify-center p-12 text-center h-[55vh] space-y-4" id="booking-submitting-state">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.1, opacity: 1 }}
                  transition={{
                    repeat: Infinity,
                    repeatType: "reverse",
                    duration: 0.8,
                  }}
                  className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"
                  id="booking-submitting-icon-container"
                >
                  <ShieldCheck className="w-9 h-9" id="booking-submitting-icon" />
                </motion.div>
                <h3 className="font-display font-bold text-xl text-slate-800" id="booking-submitting-title">Securely Booking Your Spot</h3>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed" id="booking-submitting-desc">
                  Syncing with {doctor.name}'s clinic calendar... and finalizing clinical booking details.
                </p>
                <div className="w-36 h-1 bg-slate-100 rounded-full overflow-hidden relative" id="booking-loader-bar">
                  <motion.div
                    initial={{ left: "-100%" }}
                    animate={{ left: "100%" }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                    className="absolute top-0 bottom-0 w-1/2 bg-blue-600 rounded-full"
                    id="booking-loader-fill"
                  />
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-6" id="booking-form-sections">
                {/* Visual Booking Summary */}
                <div className="bg-slate-50 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start justify-between border border-slate-100/50" id="booking-summary-banner">
                  <div className="flex gap-3 items-center" id="booking-summary-doc">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-11 h-11 rounded-lg object-cover object-center bg-white border border-slate-100"
                      referrerPolicy="no-referrer"
                      id="booking-summary-doc-img"
                    />
                    <div id="booking-summary-doc-info">
                      <p className="text-xs font-bold text-slate-800" id="booking-summary-doc-name">{doctor.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{doctor.specialty}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs font-semibold text-slate-700" id="booking-summary-details">
                    <div className="flex items-center gap-1.5" id="booking-summary-date">
                      <Calendar className="w-4 h-4 text-blue-600" id="booking-summary-date-icon" />
                      <span id="booking-summary-date-text">{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5" id="booking-summary-time">
                      <Clock className="w-4 h-4 text-blue-600" id="booking-summary-time-icon" />
                      <span id="booking-summary-time-text">{timeSlot}</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar info */}
                <div className="flex items-center justify-between text-xs font-bold px-1 text-slate-400" id="booking-progress-bar">
                  <span className="text-blue-600" id="progress-step-1">1. Appointment Selection ✓</span>
                  <span className="text-blue-600" id="progress-step-2">2. Patient Profile & Symptoms</span>
                </div>

                {/* Patient Information Form Grid */}
                <div className="space-y-4" id="booking-patient-inputs">
                  <h3 className="font-display font-semibold text-slate-800 text-sm border-b border-slate-50 pb-2" id="booking-patient-inputs-title">Patient Profile</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="booking-inputs-grid-1">
                    {/* Patient Name */}
                    <div id="input-container-name">
                      <label className="block text-xs font-bold text-slate-600 mb-1.5" id="label-name">Patient Full Name</label>
                      <div className="relative" id="wrapper-name">
                        <User className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" id="icon-name" />
                        <input
                          type="text"
                          value={patientName}
                          onChange={(e) => {
                            setPatientName(e.target.value);
                            if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                          }}
                          placeholder="e.g. John Doe"
                          className={`w-full text-xs py-2.5 pl-10 pr-4 rounded-xl border bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all ${
                            errors.name ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-blue-500"
                          }`}
                          id="patient-name-field"
                        />
                      </div>
                      {errors.name && (
                        <p className="text-[10px] text-red-500 font-semibold mt-1 flex items-center gap-1" id="error-name">
                          <AlertCircle className="w-3 h-3" id="error-name-icon" /> {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Patient Email */}
                    <div id="input-container-email">
                      <label className="block text-xs font-bold text-slate-600 mb-1.5" id="label-email">Email Address</label>
                      <div className="relative" id="wrapper-email">
                        <Mail className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" id="icon-email" />
                        <input
                          type="email"
                          value={patientEmail}
                          onChange={(e) => {
                            setPatientEmail(e.target.value);
                            if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                          }}
                          placeholder="e.g. email@example.com"
                          className={`w-full text-xs py-2.5 pl-10 pr-4 rounded-xl border bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all ${
                            errors.email ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-blue-500"
                          }`}
                          id="patient-email-field"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-[10px] text-red-500 font-semibold mt-1 flex items-center gap-1" id="error-email">
                          <AlertCircle className="w-3 h-3" id="error-email-icon" /> {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="booking-inputs-grid-2">
                    {/* Patient Phone */}
                    <div className="sm:col-span-1" id="input-container-phone">
                      <label className="block text-xs font-bold text-slate-600 mb-1.5" id="label-phone">Phone Number</label>
                      <div className="relative" id="wrapper-phone">
                        <Phone className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" id="icon-phone" />
                        <input
                          type="tel"
                          value={patientPhone}
                          onChange={(e) => {
                            setPatientPhone(e.target.value);
                            if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                          }}
                          placeholder="e.g. +1 555 1234"
                          className={`w-full text-xs py-2.5 pl-10 pr-4 rounded-xl border bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all ${
                            errors.phone ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-blue-500"
                          }`}
                          id="patient-phone-field"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-[10px] text-red-500 font-semibold mt-1 flex items-center gap-1" id="error-phone">
                          <AlertCircle className="w-3 h-3" id="error-phone-icon" /> {errors.phone}
                        </p>
                      )}
                    </div>

                    {/* Patient Age */}
                    <div id="input-container-age">
                      <label className="block text-xs font-bold text-slate-600 mb-1.5" id="label-age">Age (Years)</label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={patientAge}
                        onChange={(e) => {
                          setPatientAge(e.target.value);
                          if (errors.age) setErrors((prev) => ({ ...prev, age: "" }));
                        }}
                        placeholder="Age"
                        className={`w-full text-xs py-2.5 px-4 rounded-xl border bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all ${
                          errors.age ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-blue-500"
                        }`}
                        id="patient-age-field"
                      />
                      {errors.age && (
                        <p className="text-[10px] text-red-500 font-semibold mt-1 flex items-center gap-1" id="error-age">
                          <AlertCircle className="w-3 h-3" id="error-age-icon" /> {errors.age}
                        </p>
                      )}
                    </div>

                    {/* Patient Gender */}
                    <div id="input-container-gender">
                      <label className="block text-xs font-bold text-slate-600 mb-1.5" id="label-gender">Gender</label>
                      <select
                        value={patientGender}
                        onChange={(e) => setPatientGender(e.target.value)}
                        className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all cursor-pointer"
                        id="patient-gender-field"
                      >
                        <option value="Male" id="gender-opt-male">Male</option>
                        <option value="Female" id="gender-opt-female">Female</option>
                        <option value="Non-Binary" id="gender-opt-nonbinary">Non-Binary</option>
                        <option value="Prefer not to say" id="gender-opt-private">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Consultation Details */}
                <div className="space-y-4" id="booking-consultation-details">
                  <h3 className="font-display font-semibold text-slate-800 text-sm border-b border-slate-50 pb-2" id="booking-consultation-title">Consultation Details</h3>

                  {/* Visit Type visual picker */}
                  <div id="visit-type-picker">
                    <label className="block text-xs font-bold text-slate-600 mb-2" id="label-visit-type">Appointment Mode</label>
                    <div className="grid grid-cols-2 gap-3" id="visit-type-grid">
                      <button
                        type="button"
                        onClick={() => setVisitType("In-Person")}
                        className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                          visitType === "In-Person"
                            ? "border-blue-600 bg-blue-50/50 text-blue-900 shadow-xs"
                            : "border-slate-100 bg-white text-slate-600 hover:border-slate-200"
                        }`}
                        id="visit-type-in-person-btn"
                      >
                        <div
                          className={`p-2 rounded-xl flex-shrink-0 ${
                            visitType === "In-Person" ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-400"
                          }`}
                          id="visit-type-in-person-icon-bg"
                        >
                          <MapPin className="w-5 h-5" id="visit-type-in-person-icon" />
                        </div>
                        <div id="visit-type-in-person-details">
                          <p className="text-xs font-bold" id="visit-type-in-person-title">In-Person Visit</p>
                          <p className="text-[10px] text-slate-400 font-medium leading-snug mt-0.5" id="visit-type-in-person-desc">
                            Meet at: {doctor.location.split(",")[0]}
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVisitType("Video")}
                        className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                          visitType === "Video"
                            ? "border-blue-600 bg-blue-50/50 text-blue-900 shadow-xs"
                            : "border-slate-100 bg-white text-slate-600 hover:border-slate-200"
                        }`}
                        id="visit-type-video-btn"
                      >
                        <div
                          className={`p-2 rounded-xl flex-shrink-0 ${
                            visitType === "Video" ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-400"
                          }`}
                          id="visit-type-video-icon-bg"
                        >
                          <Video className="w-5 h-5" id="visit-type-video-icon" />
                        </div>
                        <div id="visit-type-video-details">
                          <p className="text-xs font-bold" id="visit-type-video-title">Video Consultation</p>
                          <p className="text-[10px] text-slate-400 font-medium leading-snug mt-0.5" id="visit-type-video-desc">
                            HD Video link provided in confirmation
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Symptoms Textarea */}
                  <div id="input-container-symptoms">
                    <label className="block text-xs font-bold text-slate-600 mb-1.5" id="label-symptoms">Describe Symptoms / Reason for Visit</label>
                    <div className="relative" id="wrapper-symptoms">
                      <FileText className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-400" id="icon-symptoms" />
                      <textarea
                        value={symptoms}
                        onChange={(e) => {
                           setSymptoms(e.target.value);
                           if (errors.symptoms) setErrors((prev) => ({ ...prev, symptoms: "" }));
                        }}
                        placeholder="e.g. Severe headache, persistent cough, regular blood pressure check, or prescription renewal."
                        rows={3}
                        className={`w-full text-xs py-2.5 pl-10 pr-4 rounded-xl border bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all ${
                          errors.symptoms ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-blue-500"
                        }`}
                        id="patient-symptoms-field"
                      />
                    </div>
                    {errors.symptoms && (
                      <p className="text-[10px] text-red-500 font-semibold mt-1 flex items-center gap-1" id="error-symptoms">
                        <AlertCircle className="w-3 h-3" id="error-symptoms-icon" /> {errors.symptoms}
                      </p>
                    )}
                  </div>

                  {/* Advanced Usability Pattern: Drag and Drop Medical File Attachment */}
                  <div id="attachment-uploader">
                    <label className="block text-xs font-bold text-slate-600 mb-1.5" id="label-attachments">
                      Attach Records, Reports, or Prescriptions (Optional)
                    </label>
                    
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                        isDragActive
                          ? "border-blue-600 bg-blue-50/40"
                          : "border-slate-200 bg-white hover:bg-slate-50/50"
                      }`}
                      id="drag-drop-zone"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileInputChange}
                        className="hidden"
                        id="hidden-file-input"
                      />
                      <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors" id="drag-drop-icon-bg">
                        <Upload className="w-4.5 h-4.5" id="drag-drop-icon" />
                      </div>
                      <p className="text-xs font-bold text-slate-700 mt-2" id="drag-drop-text-primary">
                        Drag & Drop files here or <span className="text-blue-600 hover:underline">browse</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5" id="drag-drop-text-secondary">
                        Supports PDF, PNG, JPG up to 10MB (Simulated Secure Storage)
                      </p>
                    </div>

                    {/* Attached files lists */}
                    {files.length > 0 && (
                      <div className="mt-3.5 space-y-2" id="attached-files-list">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1" id="attachments-list-title">Attached files ({files.length})</p>
                        {files.map((file) => (
                          <div
                            key={file.id}
                            className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center justify-between gap-3 text-xs"
                            id={`file-item-${file.id}`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1" id={`file-info-${file.id}`}>
                              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold text-[10px]" id={`file-icon-${file.id}`}>
                                {file.name.split('.').pop()?.toUpperCase() || 'FILE'}
                              </div>
                              <div className="min-w-0 flex-1" id={`file-progress-container-${file.id}`}>
                                <p className="font-semibold text-slate-700 truncate" id={`file-name-${file.id}`}>{file.name}</p>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5" id={`file-meta-${file.id}`}>
                                  <span id={`file-size-${file.id}`}>{file.size}</span>
                                  {file.progress < 100 ? (
                                    <span className="text-blue-600 font-semibold" id={`file-prog-percent-${file.id}`}>Uploading {file.progress}%</span>
                                  ) : (
                                    <span className="text-emerald-600 font-semibold flex items-center gap-0.5" id={`file-complete-badge-${file.id}`}>
                                      <CheckCircle2 className="w-3 h-3 text-emerald-500" id={`file-check-${file.id}`} /> Securely Attached
                                    </span>
                                  )}
                                </div>
                                {file.progress < 100 && (
                                  <div className="w-full h-1 bg-slate-200 rounded-full mt-1.5 overflow-hidden" id={`file-prog-bar-${file.id}`}>
                                    <div
                                      className="h-full bg-blue-600 transition-all duration-150"
                                      style={{ width: `${file.progress}%` }}
                                      id={`file-prog-fill-${file.id}`}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(file.id)}
                              className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0"
                              id={`file-delete-btn-${file.id}`}
                            >
                              <Trash2 className="w-4 h-4" id={`file-delete-icon-${file.id}`} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Footer */}
          {!isSubmitted && (
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between flex-shrink-0" id="booking-form-footer">
              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
                id="booking-form-back-btn"
              >
                <ArrowLeft className="w-4 h-4" id="booking-form-back-btn-icon" />
                Go Back
              </button>

              <button
                type="submit"
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold shadow-xs transition-all cursor-pointer"
                id="booking-form-submit-btn"
              >
                Confirm Doctor Appointment
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
