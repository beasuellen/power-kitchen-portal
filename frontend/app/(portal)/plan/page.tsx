import { mockSubscription, mockCustomer } from "@/lib/mock-data";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import {
  Package,
  Truck,
  UtensilsCrossed,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Calendar,
  CreditCard,
  MapPin,
} from "lucide-react";

export default function PlanPage() {
  const {
    planName,
    planType,
    mealsPerWeek,
    weeklyTotal,
    status,
    startDate,
    nextBillingDate,
    deliveryDay,
    streak,
  } = mockSubscription;
  const { firstName, lastName } = mockCustomer;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Plan</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your subscription settings</p>
      </div>

      {/* Plan Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-[#2D6A4F]" />
              <h2 className="font-semibold text-gray-900">Plan Overview</h2>
            </div>
            <Badge variant="green">Active</Badge>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Plan", value: planName },
              { label: "Meals/week", value: mealsPerWeek.toString() },
              { label: "Weekly total", value: formatCurrency(weeklyTotal) },
              { label: "Streak", value: `🔥 ${streak} weeks` },
            ].map(({ label, value }) => (
              <div key={label} className="text-center p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>Started: <strong>{formatDate(startDate, { month: "long", day: "numeric", year: "numeric" })}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <CreditCard className="w-3.5 h-3.5 text-gray-400" />
              <span>Next billing: <strong>{formatDate(nextBillingDate, { month: "long", day: "numeric" })}</strong></span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Delivery Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#2D6A4F]" />
            <h2 className="font-semibold text-gray-900">Delivery Preferences</h2>
          </div>
        </CardHeader>
        <CardBody className="pt-0 space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-600">Delivery day</span>
            <span className="font-medium text-sm text-gray-900">{deliveryDay}</span>
          </div>
          <div className="flex items-start justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-600">Delivery instructions</span>
            <span className="text-sm text-gray-500 italic text-right max-w-[60%]">Leave at door</span>
          </div>
          <Link
            href="/plan/address"
            className="flex items-center justify-between py-2 text-sm text-[#2D6A4F] hover:text-[#245a41] font-medium"
          >
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Manage delivery address
            </span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </CardBody>
      </Card>

      {/* Meal Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-[#2D6A4F]" />
            <h2 className="font-semibold text-gray-900">Meal Preferences</h2>
          </div>
        </CardHeader>
        <CardBody className="pt-0 space-y-2">
          <Link
            href="/plan/dietary"
            className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg px-1 transition-colors"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">Dietary Restrictions</p>
              <p className="text-xs text-gray-500">Gluten Free, Dairy Free</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
          <div className="flex items-center justify-between py-3 px-1">
            <div>
              <p className="text-sm font-medium text-gray-700">Avoid List</p>
              <p className="text-xs text-[#2D6A4F] font-medium">Coming Soon</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Payment quick link */}
      <Card>
        <CardBody className="py-4">
          <Link
            href="/plan/payment"
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Payment Method</p>
                <p className="text-xs text-gray-500">Visa ending in 4242</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
        </CardBody>
      </Card>

      {/* Plan Management */}
      <Card className="border-red-100">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h2 className="font-semibold text-gray-700">Plan Management</h2>
          </div>
        </CardHeader>
        <CardBody className="pt-0 space-y-2">
          <Button variant="secondary" className="w-full justify-start" size="sm">
            Change Plan
          </Button>
          <Button variant="destructive" className="w-full justify-start" size="sm">
            Pause Subscription
          </Button>
          <Button variant="destructive" className="w-full justify-start" size="sm">
            Cancel Subscription
          </Button>
        </CardBody>
      </Card>

      {/* Classic portal toggle */}
      <div className="text-center">
        <p className="text-xs text-gray-400">
          Prefer the old interface?{" "}
          <a href="#" className="text-[#2D6A4F] hover:underline">Switch to Classic Portal</a>
        </p>
      </div>
    </div>
  );
}
