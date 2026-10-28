import React, { useState, useEffect } from "react";
import { Bell, CheckCheck, Trash2, ExternalLink } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { api, NotificationItem } from "@/lib/api";

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const fetchNotifs = async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      // Mock notifications for offline demo
      setNotifications([
        {
          id: 1,
          userId: 1,
          title: "Follow-Up Review Advised",
          message: "Metro Tower Complex Column B4 exhibited +0.28 percentage-point increase in detected crack area.",
          notificationType: "review_alert",
          link: "/inspections",
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          userId: 1,
          title: "Inspection Analysis Completed",
          message: "Riverside Viaduct Pier 4 inspection successfully processed via Classical CV pipeline.",
          notificationType: "success",
          link: "/inspections",
          isRead: true,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ]);
      setUnreadCount(1);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  const handleDismiss = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.dismissNotification(id);
    } catch (err) {}
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 md:w-96 p-0 shadow-lg">
        <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground gap-1"
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="h-3 w-3" /> Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              No notifications at this time.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 text-xs transition-colors hover:bg-muted/40 relative ${
                  !n.isRead ? "bg-primary/5 font-medium" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          n.notificationType === "review_alert"
                            ? "bg-amber-500"
                            : n.notificationType === "success"
                            ? "bg-green-500"
                            : "bg-blue-500"
                        }`}
                      />
                      <span className="font-semibold text-foreground">{n.title}</span>
                    </div>
                    <p className="mt-1 text-muted-foreground line-clamp-2">{n.message}</p>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground/80">
                      <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      {n.link && (
                        <Link
                          to={n.link as any}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
                        >
                          View record <ExternalLink className="h-2.5 w-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={(e) => handleDismiss(n.id, e)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
