import { mockBillingHistory } from "@/lib/mock-data";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Receipt, Download } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing History</h1>
        <p className="text-sm text-gray-500 mt-1">All your past charges and receipts</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#2D6A4F]" />
            <h2 className="font-semibold text-gray-900">Payment History</h2>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="divide-y divide-gray-50">
            {mockBillingHistory.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between py-3 gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{bill.orderNumber}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(bill.date, { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-semibold text-gray-900 text-sm">{formatCurrency(bill.amount)}</span>
                  <Badge variant={bill.status === "paid" ? "green" : "red"}>
                    {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                  </Badge>
                  <button className="p-1.5 rounded-lg text-gray-400 hover:text-[#2D6A4F] hover:bg-[#D8F3DC] transition-colors">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
