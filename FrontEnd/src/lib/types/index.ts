export interface MriItem {
  id: string;
  patientId?: string;
  patientName?: string;
  patientEmail?: string;
  prediction?: string;
  confidence?: number;
  probability?: number;
  status?: string;
  createdAt?: string;
  reviewedAt?: string;
  imageUrl?: string;
  gradcamImage?: string;
  doctorNotes?: string;
}

export interface DoctorUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  licenseNumber?: string;
  patientCount?: number;
  createdAt?: string;
  status?: string;
}

export interface PatientUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  mriCount?: number;
  lastAnalysisAt?: string;
  createdAt?: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: string;
  userName?: string;
  userId?: string;
  unreadCount?: number;
  createdAt?: string;
  lastMessageAt?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type?: string;
  isRead: boolean;
  createdAt?: string;
}
