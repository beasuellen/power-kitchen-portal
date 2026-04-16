"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, MapPin, Edit3 } from "lucide-react";

const currentAddress = {
  street: "120 Bloor St East",
  unit: "Apt 802",
  city: "Toronto",
  province: "ON",
  postal: "M4W 1B8",
  buzzer: "802",
  instructions: "Leave at door",
};

export default function AddressPage() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(currentAddress);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await new Promise((r) => setTimeout(r, 800));
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/plan" className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Address</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage where your meals are delivered</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#2D6A4F]" />
              <h2 className="font-semibold text-gray-900">Delivery Address</h2>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 text-sm text-[#2D6A4F] hover:text-[#245a41] font-medium"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
            )}
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          {!editing ? (
            <div className="space-y-2">
              <p className="text-gray-900 font-medium">{form.street}</p>
              {form.unit && <p className="text-gray-600 text-sm">{form.unit}</p>}
              <p className="text-gray-600 text-sm">{form.city}, {form.province} {form.postal}</p>
              {form.buzzer && (
                <p className="text-xs text-gray-500">Buzzer: {form.buzzer}</p>
              )}
              {form.instructions && (
                <p className="text-xs text-gray-500 italic">{form.instructions}</p>
              )}
              {saved && (
                <p className="text-sm text-[#2D6A4F] font-medium mt-2">✓ Address saved successfully</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { key: "street", label: "Street Address", placeholder: "123 Main St" },
                { key: "unit", label: "Unit / Apt", placeholder: "Apt 4B" },
                { key: "city", label: "City", placeholder: "Toronto" },
                { key: "province", label: "Province", placeholder: "ON" },
                { key: "postal", label: "Postal Code", placeholder: "M5H 2N2" },
                { key: "buzzer", label: "Buzzer Code", placeholder: "1234" },
                { key: "instructions", label: "Delivery Instructions", placeholder: "Leave at door..." },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                  <input
                    type="text"
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <Button onClick={handleSave} className="flex-1">Save Address</Button>
                <Button variant="secondary" onClick={() => setEditing(false)} className="flex-1">Cancel</Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
