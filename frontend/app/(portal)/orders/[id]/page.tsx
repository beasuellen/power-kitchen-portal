import { mockOrders } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import { OrderDetailClient } from "./OrderDetailClient";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = mockOrders.find((o) => o.id === id);
  if (!order) notFound();
  return <OrderDetailClient order={order} />;
}
