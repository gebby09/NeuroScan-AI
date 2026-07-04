import { api } from "@/lib/api";

export const getNotifications = (limit?: number) =>
  api.get("/notifications", { params: limit ? { limit } : {} }).then((r) => r.data);
export const markNotificationAsRead = (id: string) =>
  api.put(`/notifications/${id}/read`).then((r) => r.data);
export const markAllAsRead = () =>
  api.put("/notifications/read-all").then((r) => r.data);
