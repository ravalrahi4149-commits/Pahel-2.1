import { DEMO_MODE } from "@/lib/env";
import { db } from "@/services/mock/seed";
import { delay, http } from "./http";
import type { Notification } from "@/types";

export const notificationApi = {
  async listForUser(userId: string): Promise<Notification[]> {
    if (DEMO_MODE) {
      const list = db()
        .notifications.filter((n) => n.userId === userId)
        .sort((a, b) => (b.createdAt < a.createdAt ? -1 : 1));
      return delay(list, 100);
    }
    return http(`/notifications?userId=${userId}`);
  },
  async markRead(id: string): Promise<void> {
    if (DEMO_MODE) {
      const n = db().notifications.find((n) => n.id === id);
      if (n) n.read = true;
      return delay(undefined, 50);
    }
    await http(`/notifications/${id}/read`, { method: "POST" });
  },
};
