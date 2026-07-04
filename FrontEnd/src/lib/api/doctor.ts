import { api } from "@/lib/api";

export const getDoctorPatients = () => api.get("/doctor/patients").then((r) => r.data);
export const getPendingMri = () => api.get("/doctor/mri/pending").then((r) => r.data);
export const getReviewedAnalyses = () => api.get("/doctor/reviewed-analyses").then((r) => r.data);
export const getDoctorMri = (id: string) => api.get(`/doctor/mri/${id}`).then((r) => r.data);
export const submitMriReview = (mriId: string, notes: string) =>
  api.put(`/doctor/mri/${mriId}/review`, { doctorNotes: notes }).then((r) => r.data);
export const saveDraftReview = (mriId: string, notes: string) =>
  api.post(`/doctor/mri/${mriId}/draft`, { notes }).then((r) => r.data);
export const getDoctorDashboard = () => api.get("/doctor/dashboard").then((r) => r.data);
export const getDoctorProfile = () => api.get("/doctor/profile").then((r) => r.data);
export const updateDoctorProfile = (data: any) => api.put("/doctor/profile", data).then((r) => r.data);
export const analyzeMri = (id: string) =>
  api.post(`/doctor/mri/${id}/analyze`).then((r) => r.data);
