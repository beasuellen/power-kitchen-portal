import { mockBillingHistory } from "@/lib/mock-data";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Receipt, Download } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#004945]">Billing History</h1>
        <p className="text-sm text-[#6B6B6B] mt-0.5">All your past charges and receipts</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#004945]" />
            <h2 className="font-semibold text-[#004945]">Payment History</h2>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="divide-y divide-[#F0EBE0]">
            {mockBillingHistory.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between py-3 gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A1A1A]">{bill.orderNumber}</p>
                  <p className="text-xs text-[#9E9E9E]">
                    {formatDate(bill.date, { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-semibold text-[#1A1A1A] text-sm">{formatCurrency(bill.amount)}</span>
                  <Badge variant={bill.status === "paid" ? "green" : "red"}>
                    {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                  </Badge>
                  <button className="p-1.5 rounded-lg text-[#9E9E9E] hover:text-[#004945] hover:bg-[#EAF7D9] transition-colors">
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
