export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewsCount: number;
  image: string;
  fee: number;
  waitTime: string;
  location: string;
  bio: string;
  education: string;
  languages: string[];
  availableDays: string[]; // e.g. ["Mon", "Tue", "Wed", "Thu", "Fri"]
  timeSlots: string[]; // e.g. ["09:00 AM", "10:30 AM", "01:30 PM", "03:00 PM"]
}

export type VisitType = "In-Person" | "Video";

export type AppointmentStatus = "Pending" | "Confirmed" | "Cancelled";

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorImage: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientAge: number;
  patientGender: string;
  date: string; // YYYY-MM-DD
  timeSlot: string;
  symptoms: string;
  visitType: VisitType;
  status: AppointmentStatus;
  createdAt: string;
}

export interface Specialty {
  name: string;
  iconName: string; // Used to dynamic resolve lucide icon
  description: string;
  count: number;
}
