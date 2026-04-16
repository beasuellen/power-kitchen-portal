import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, CreditCard, Lock, AlertCircle } from "lucide-react";

export default function PaymentPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/plan" className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Method</h1>
          <p className="text-sm text-gray-500 mt-0.5">Update your billing information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#2D6A4F]" />
            <h2 className="font-semibold text-gray-900">Current Payment Method</h2>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
              VISA
            </div>
            <div>
              <p className="font-medium text-gray-900">Visa ending in 4242</p>
              <p className="text-sm text-gray-500">Expires 08/27</p>
            </div>
          </div>
          <Button className="w-full mt-4">
            Update Payment Method
          </Button>
          <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-gray-400">
            <Lock className="w-3 h-3" />
            <span>Secured by Shopify Payments</span>
          </div>
        </CardBody>
      </Card>

      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
        <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          Payment changes take effect on your next billing cycle.
          Your current plan remains active.
        </p>
      </div>
    </div>
  );
}
