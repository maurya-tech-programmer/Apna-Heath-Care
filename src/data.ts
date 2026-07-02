import { Doctor, Specialty } from "./types";

export const SPECIALTIES: Specialty[] = [
  {
    name: "General Medicine",
    iconName: "Stethoscope",
    description: "Everyday health, wellness, preventative care, and common illnesses.",
    count: 14
  },
  {
    name: "Pediatrics",
    iconName: "Baby",
    description: "Specialized care and developmental tracking for infants, children, and teens.",
    count: 8
  },
  {
    name: "Cardiology",
    iconName: "HeartPulse",
    description: "Heart health, blood pressure management, and cardiovascular diagnostics.",
    count: 6
  },
  {
    name: "Dermatology",
    iconName: "Sparkles",
    description: "Skin conditions, eczema, acne, moles, rashes, and aesthetic care.",
    count: 9
  },
  {
    name: "Orthopedics",
    iconName: "Bone",
    description: "Bone, muscle, joint, ligament injuries, arthritis, and physical therapy.",
    count: 5
  },
  {
    name: "Neurology",
    iconName: "Brain",
    description: "Nervous system, headaches, migraines, nerve pain, and cognitive health.",
    count: 4
  }
];

export const DOCTORS: Doctor[] = [
  {
    id: "dr-carter",
    name: "Dr. Evelyn Carter",
    specialty: "Cardiology",
    rating: 4.9,
    reviewsCount: 142,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
    fee: 150,
    waitTime: "10 min",
    location: "Suite 402, Heart & Vascular Pavilion",
    bio: "Dr. Evelyn Carter is a board-certified cardiologist with over 12 years of experience. She specializes in preventive cardiology, heart failure management, and advanced cardiovascular imaging. Her patient-first philosophy focuses on lifestyle modifications alongside modern medical treatments.",
    education: "MD - Stanford University School of Medicine",
    languages: ["English", "Spanish"],
    availableDays: ["Mon", "Tue", "Thu", "Fri"],
    timeSlots: ["09:00 AM", "10:30 AM", "11:00 AM", "01:30 PM", "03:00 PM", "04:30 PM"]
  },
  {
    id: "dr-vance",
    name: "Dr. Marcus Vance",
    specialty: "Pediatrics",
    rating: 4.8,
    reviewsCount: 218,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
    fee: 110,
    waitTime: "15 min",
    location: "Building B, KinderCare Health Centre",
    bio: "Dr. Marcus Vance loves helping children lead healthy, happy lives. With 9 years in pediatric care, he excels in childhood developmental milestones, immunization counseling, and pediatric acute care. He is known for his warm, friendly, and calming demeanor.",
    education: "MD - Johns Hopkins University School of Medicine",
    languages: ["English", "French"],
    availableDays: ["Mon", "Wed", "Thu", "Fri"],
    timeSlots: ["08:30 AM", "09:30 AM", "10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM", "05:00 PM"]
  },
  {
    id: "dr-rahman",
    name: "Dr. Aisha Rahman",
    specialty: "Dermatology",
    rating: 4.9,
    reviewsCount: 185,
    image: "https://images.unsplash.com/photo-1594824813573-246434e33963?auto=format&fit=crop&q=80&w=400",
    fee: 130,
    waitTime: "5 min",
    location: "Suite 105, Radiant Dermatology & Aesthetics",
    bio: "Dr. Aisha Rahman is an expert in both medical and cosmetic dermatology. She provides comprehensive care for skin cancer screenings, chronic eczema, acne management, and custom skincare routines. She has published multiple papers on modern laser therapeutics.",
    education: "MD - Yale School of Medicine",
    languages: ["English", "Arabic", "Hindi"],
    availableDays: ["Tue", "Wed", "Thu"],
    timeSlots: ["09:00 AM", "09:45 AM", "10:30 AM", "11:15 AM", "01:30 PM", "02:15 PM", "03:00 PM", "03:45 PM"]
  },
  {
    id: "dr-jenkins",
    name: "Dr. Sarah Jenkins",
    specialty: "General Medicine",
    rating: 4.7,
    reviewsCount: 312,
    image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=400",
    fee: 90,
    waitTime: "10 min",
    location: "Ground Floor, City Family Clinic",
    bio: "Dr. Sarah Jenkins has served as a cornerstone of primary care in the community for 15 years. She is passionate about long-term family medicine, managing chronic diseases like hypertension and diabetes, and promoting robust health screening guidelines.",
    education: "MD - Harvard Medical School",
    languages: ["English"],
    availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    timeSlots: ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"]
  },
  {
    id: "dr-oconnor",
    name: "Dr. Liam O'Connor",
    specialty: "Orthopedics",
    rating: 4.8,
    reviewsCount: 96,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
    fee: 140,
    waitTime: "20 min",
    location: "Suite 310, Orthopedic & Joint Restoration Center",
    bio: "Dr. Liam O'Connor specializes in sports injuries, joint reconstructions, and arthroscopic surgeries. He works closely with professional athletes and active individuals of all ages to restore pain-free movement and optimize muscle recovery.",
    education: "MD - Columbia University College of Physicians and Surgeons",
    languages: ["English", "Gaeilge"],
    availableDays: ["Mon", "Tue", "Wed", "Fri"],
    timeSlots: ["09:30 AM", "10:30 AM", "11:30 AM", "02:00 PM", "03:00 PM", "04:00 PM"]
  },
  {
    id: "dr-sato",
    name: "Dr. Kenji Sato",
    specialty: "Neurology",
    rating: 4.9,
    reviewsCount: 110,
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
    fee: 160,
    waitTime: "8 min",
    location: "Building C, Neurological Sciences Institute",
    bio: "Dr. Kenji Sato is a leading researcher and clinician in neuromuscular disorders and sleep medicine. He employs advanced electrophysiological tests to diagnose complex neuropathies, headaches, tremors, and cognitive sleep disturbances.",
    education: "MD - University of Tokyo / Residency at Mayo Clinic",
    languages: ["English", "Japanese"],
    availableDays: ["Tue", "Thu", "Fri"],
    timeSlots: ["10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"]
  }
];

// Helper to generate the next 7 days starting from today
export function getNextDays(): { dateString: string; dayName: string; formattedDate: string }[] {
  const days = [];
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const current = new Date();
    current.setDate(today.getDate() + i);
    
    const dayIndex = current.getDay();
    // Skip Sundays for clinic bookings
    if (dayIndex === 0) continue;

    const dayName = weekdays[dayIndex];
    const dateNum = current.getDate();
    const monthName = months[current.getMonth()];
    
    const year = current.getFullYear();
    const monthVal = String(current.getMonth() + 1).padStart(2, '0');
    const dayVal = String(dateNum).padStart(2, '0');
    const dateString = `${year}-${monthVal}-${dayVal}`;

    days.push({
      dateString,
      dayName,
      formattedDate: `${dayName}, ${monthName} ${dateNum}`
    });
  }

  return days;
}
