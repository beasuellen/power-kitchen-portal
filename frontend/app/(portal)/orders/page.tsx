import { mockOrders } from "@/lib/mock-data";
import { formatDate, formatShortDate, formatCurrency } from "@/lib/utils";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import Image from "next/image";
import {
  CalendarDays,
  Lock,
  SkipForward,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  Info,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig = {
  customizable: {
    border: "border-[#2D6A4F]",
    bg: "",
    badge: <Badge variant="green">Ready to customize</Badge>,
    icon: <CalendarDays className="w-4 h-4 text-[#2D6A4F]" />,
    dim: false,
  },
  locked: {
    border: "border-gray-200",
    bg: "",
    badge: <Badge variant="gray"><Lock className="w-2.5 h-2.5 mr-1" />Locked</Badge>,
    icon: <Lock className="w-4 h-4 text-gray-400" />,
    dim: true,
  },
  skipped: {
    border: "border-gray-200",
    bg: "bg-gray-50",
    badge: <Badge variant="gray">Skipped</Badge>,
    icon: <SkipForward className="w-4 h-4 text-gray-400" />,
    dim: false,
  },
  processing: {
    border: "border-blue-200",
    bg: "",
    badge: <Badge variant="blue">Processing</Badge>,
    icon: <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />,
    dim: false,
  },
  delivered: {
    border: "border-gray-100",
    bg: "bg-gray-50",
    badge: <Badge variant="gray">Delivered</Badge>,
    icon: <CheckCircle2 className="w-4 h-4 text-gray-400" />,
    dim: true,
  },
};

export default function OrdersPage() {
  const upcoming = mockOrders.filter((o) => o.status !== "delivered").sort(
    (a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime()
  );
  const past = mockOrders.filter((o) => o.status === "delivered");

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your upcoming deliveries</p>
      </div>

      {/* Upcoming orders */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Upcoming</h2>
        {upcoming.map((order) => {
          const config = statusConfig[order.status];
          return (
            <Card
              key={order.id}
              className={cn("border-2 transition-all", config.border, config.bg)}
            >
              <CardBody className={cn("py-4", config.dim && "opacity-70")}>
                <div className="flex items-start gap-4">
                  {/* Left: date column */}
                  <div className="shrink-0 w-14 text-center">
                    <div className="text-xs font-semibold text-gray-400 uppercase">
                      {new Date(order.deliveryDate + "T12:00:00").toLocaleDateString("en-CA", { month: "short" })}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 leading-tight">
                      {new Date(order.deliveryDate + "T12:00:00").getDate()}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {new Date(order.deliveryDate + "T12:00:00").toLocaleDateString("en-CA", { weekday: "short" })}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-px self-stretch bg-gray-200 shrink-0" />

                  {/* Center: content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {config.badge}
                      <span className="text-sm text-gray-500">
                        {order.status === "skipped"
                          ? "This order is skipped"
                          : `${order.items.reduce((s, i) => s + i.quantity, 0)} meals`}
                      </span>
                    </div>

                    {/* Meal thumbnails */}
                    {order.status !== "skipped" && order.items.length > 0 && (
                      <div className="flex gap-1.5 mb-3">
                        {order.items.slice(0, 5).map((item, idx) => (
                          <div
                            key={item.id}
                            className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0"
                          >
                            <Image
                              src={item.meal.imageUrl}
                              alt={item.meal.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                            {idx === 4 && order.items.length > 5 && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-[10px] font-bold">
                                +{order.items.length - 5}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Locked info */}
                    {order.status === "locked" && (
                      <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 mb-2">
                        <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <p className="text-xs text-amber-800">
                          Customization opens {formatShortDate(order.cutoffDate)}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">
                        {order.status !== "skipped" ? formatCurrency(order.total) : "—"}
                      </span>
                      <div className="flex gap-2">
                        {order.status === "skipped" && (
                          <Button size="sm" variant="outline">
                            <RotateCcw className="w-3.5 h-3.5" /> Reactivate
                          </Button>
                        )}
                        {(order.status === "customizable" || order.status === "locked") && (
                          <Link href={`/orders/${order.id}`}>
                            <Button size="sm" variant={order.status === "customizable" ? "primary" : "secondary"}>
                              {order.status === "customizable" ? (
                                <>View & Edit <ArrowRight className="w-3.5 h-3.5" /></>
                              ) : (
                                "View Details"
                              )}
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </section>

      {/* Past orders */}
      {past.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Recent Deliveries</h2>
          {past.map((order) => {
            const config = statusConfig[order.status];
            return (
              <Card key={order.id} className="border border-gray-100 opacity-60">
                <CardBody className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {config.icon}
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {formatDate(order.deliveryDate, { month: "long", day: "numeric" })}
                        </p>
                        <p className="text-xs text-gray-400">
                          {order.items.reduce((s, i) => s + i.quantity, 0)} meals · {formatCurrency(order.total)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {config.badge}
                      <Link href={`/orders/${order.id}`} className="text-xs text-[#2D6A4F] hover:underline">
                        View
                      </Link>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
}
