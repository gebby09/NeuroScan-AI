import { api } from "@/lib/api";

export const getSupportTickets = () =>
  api.get("/admin/support/tickets").then((r) => r.data);

export const getSupportTicketMessages = (id: string) =>
  api.get(`/admin/support/tickets/${id}/messages`).then((r) => r.data);

export const createSupportTicket = (data: { subject: string; message: string }) =>
  api.post("/support/tickets", data).then((r) => r.data);

export const addMessageToTicket = (id: string, content: string) =>
  api.post(`/admin/support/tickets/${id}/messages`, { message: content }).then((r) => r.data);

export const closeTicket = (id: string) =>
  api.put(`/admin/support/tickets/${id}/close`).then((r) => r.data);

// momentan nu există în backend
export const reopenTicket = (id: string) =>
  api.put(`/admin/support/tickets/${id}/reopen`).then((r) => r.data);