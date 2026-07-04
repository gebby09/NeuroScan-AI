import { api } from "@/lib/api";

export const getAdminDashboard = () => api.get("/admin/dashboard").then((r) => r.data);
export const getAllDoctors = () => api.get("/admin/doctors").then((r) => r.data);
export const createDoctor = (data: any) => api.post("/admin/doctors", data).then((r) => r.data);
export const updateDoctor = (id: string, data: any) => api.put(`/admin/doctors/${id}`, data).then((r) => r.data);
export const deleteDoctor = (id: string) => api.delete(`/admin/doctors/${id}`).then((r) => r.data);
export const getAllPatients = (params?: any) => api.get("/admin/patients", { params }).then((r) => r.data);
export const deletePatient = (id: string) => api.delete(`/admin/patients/${id}`).then((r) => r.data);
export const assignDoctorToPatient = (patientId: string, doctorId: string) =>
  api.put(`/admin/patients/${patientId}/assign-doctor/${doctorId}`).then((r) => r.data);
export const unassignDoctor = (patientId: string) =>
  api.post(`/admin/unassign-doctor/${patientId}`).then((r) => r.data);
export const getRecentActivities = () => api.get("/admin/activities").then((r) => r.data);
export const getRecentAssignments = () => api.get("/admin/assignments").then((r) => r.data);
