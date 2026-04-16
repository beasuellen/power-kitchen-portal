"use client";

import { useState } from "react";
import { mockSubscription } from "@/lib/mock-data";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Wallet, Gift, Check, AlertCircle } from "lucide-react";

const creditHistory = [
  { id: "cr_001", date: "2026-04-10", type: "Reward", description: "Consistency King challenge", amount: 15 },
  { id: "cr_002", date: "2026-03-22", type: "Referral", description: "Friend Emily subscribed", amount: 20 },
  { id: "cr_003", date: "2026-03-05", type: "Referral", description: "Friend Marcus subscribed", amount: 20 },
  { id: "cr_004", date: "2026-02-15", type: "Reward", description: "Big Order challenge", amount: 5 },
];

export default function CreditsPage() {
  const { storeCredit } = mockSubscription;
  const [giftCode, setGiftCode] = useState("");
  const [applyStatus, setApplyStatus] = useState<"idle" | "success" | "error">("idle");

  const handleApply = async () => {
    if (!giftCode.trim()) return;
    await new Promise((r) => setTimeout(r, 1000));
    setApplyStatus(giftCode.toUpperCase() === "INVALID" ? "error" : "success");
  };

  const totalEarned = creditHistory.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Store Credits & Gift Cards</h1>
        <p className="text-sm text-gray-500 mt-1">Apply gift cards and track your credit balance</p>
      </div>

      {/* Balance */}
      <Card className="bg-gradient-to-br from-[#2D6A4F] to-[#40916C] text-white border-0">
        <CardBody className="py-6">
          <div className="flex items-center gap-3 mb-4">
            <Wallet className="w-6 h-6 text-green-200" />
            <h2 className="font-semibold text-green-100">Store Credit Balance</h2>
          </div>
          <p className="text-5xl font-bold mb-1">{formatCurrency(storeCredit)}</p>
          <p className="text-green-200 text-sm">
            {formatCurrency(totalEarned)} earned since joining
          </p>
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            {[
              { label: "From Referrals", value: formatCurrency(40) },
              { label: "From Rewards", value: formatCurrency(20) },
              { label: "Gift Cards", value: formatCurrency(0) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/20 rounded-xl p-2.5">
                <p className="font-bold text-white">{value}</p>
                <p className="text-[10px] text-green-200">{label}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Apply Gift Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#2D6A4F]" />
            <h2 className="font-semibold text-gray-900">Apply Gift Card</h2>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <p className="text-sm text-gray-500 mb-3">
            Enter your gift card code to add funds to your credit balance.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter gift card code"
              value={giftCode}
              onChange={(e) => { setGiftCode(e.target.value); setApplyStatus("idle"); }}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent"
            />
            <Button onClick={handleApply} disabled={!giftCode.trim()}>
              Apply
            </Button>
          </div>

          {applyStatus === "success" && (
            <div className="flex items-center gap-2 mt-3 text-[#2D6A4F] text-sm">
              <Check className="w-4 h-4" />
              <span>Gift card applied! Credit added to your balance.</span>
            </div>
          )}
          {applyStatus === "error" && (
            <div className="flex items-center gap-2 mt-3 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Invalid or already used gift card code.</span>
            </div>
          )}

          <p className="text-xs text-gray-400 mt-3">
            Gift card balances are applied as discounts on your next billing cycle.
          </p>
        </CardBody>
      </Card>

      {/* Credit History */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Credit History</h2>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="divide-y divide-gray-50">
            {creditHistory.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant={item.type === "Referral" ? "green" : "blue"} size="sm">{item.type}</Badge>
                    <span className="text-xs text-gray-400">{formatShortDate(item.date)}</span>
                  </div>
                </div>
                <span className="font-semibold text-[#2D6A4F]">+{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
