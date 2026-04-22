"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type DashboardStats = {
  users: number;
  orders: number;
  menu: number;
  revenue: number;
};

type OrderRecord = {
  id: string;
  total: number;
  status: string;
  created_at: string;
};

type ChartPoint = {
  day: string;
  label: string;
  orders: number;
  revenue: number;
};

const dayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getLast7Days(orders: OrderRecord[]): ChartPoint[] {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));

    return {
      day: date.toISOString().slice(0, 10),
      label: dayFormatter.format(date),
      orders: 0,
      revenue: 0,
    };
  });

  const lookup = new Map(days.map((day) => [day.day, day]));

  orders.forEach((order) => {
    const orderDate = new Date(order.created_at);
    orderDate.setHours(0, 0, 0, 0);
    const bucket = lookup.get(orderDate.toISOString().slice(0, 10));

    if (bucket) {
      bucket.orders += 1;
      bucket.revenue += Number(order.total) || 0;
    }
  });

  return days;
}

function buildChart(points: ChartPoint[]) {
  const width = 620;
  const height = 260;
  const padding = 28;
  const maxValue = Math.max(...points.map((point) => point.orders), 1);
  const stepX = points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0;

  const coords = points.map((point, index) => {
    const x = padding + index * stepX;
    const y = height - padding - (point.orders / maxValue) * (height - padding * 2);
    return { ...point, x, y };
  });

  const linePath = coords.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${height - padding} L ${coords[0].x} ${height - padding} Z`;
  const gridLines = Array.from({ length: 4 }, (_, index) => {
    const value = Math.round((maxValue / 3) * (3 - index));
    const y = padding + ((height - padding * 2) / 3) * index;
    return { value, y };
  });

  return { width, height, padding, coords, linePath, areaPath, gridLines };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({ users: 0, orders: 0, menu: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState<OrderRecord[]>([]);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
      if (!profile?.is_admin) {
        router.push("/");
        return;
      }

      const [{ count: users }, { count: orders }, { count: menu }, { data: revenue }, { data: orderRows }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("menu_items").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("total"),
        supabase.from("orders").select("id, total, status, created_at").order("created_at", { ascending: true }),
      ]);

      const totalRevenue = revenue?.reduce((sum, order) => sum + Number(order.total || 0), 0) || 0;
      setStats({ users: users || 0, orders: orders || 0, menu: menu || 0, revenue: totalRevenue });
      setRecentOrders((orderRows as OrderRecord[]) || []);
    }

    checkAdmin();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const chartData = getLast7Days(recentOrders);
  const chart = buildChart(chartData);
  const completedOrders = recentOrders.filter((order) => order.status === "delivered").length;
  const pendingOrders = recentOrders.filter((order) => ["pending", "preparing", "ready"].includes(order.status)).length;
  const completionRate = stats.orders ? Math.round((completedOrders / stats.orders) * 100) : 0;
  const bestDay = chartData.reduce(
    (top, current) => (current.orders > top.orders ? current : top),
    chartData[0] || { day: "", label: "-", orders: 0, revenue: 0 }
  );
  const statusItems = [
    { label: "Pending", count: recentOrders.filter((order) => order.status === "pending").length, color: "bg-amber-400" },
    { label: "Preparing", count: recentOrders.filter((order) => order.status === "preparing").length, color: "bg-blue-400" },
    { label: "Ready", count: recentOrders.filter((order) => order.status === "ready").length, color: "bg-emerald-400" },
    { label: "Delivered", count: recentOrders.filter((order) => order.status === "delivered").length, color: "bg-orange-500" },
    { label: "Cancelled", count: recentOrders.filter((order) => order.status === "cancelled").length, color: "bg-rose-400" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-gray-900 text-white flex flex-col p-6">
        <h1 className="text-xl font-bold text-orange-400 mb-8">ELYAN Admin</h1>
        <nav className="flex flex-col gap-3 flex-1">
          <Link href="/admin" className="bg-orange-500 px-4 py-2 rounded-lg">Dashboard</Link>
          <Link href="/admin/orders" className="hover:bg-gray-700 px-4 py-2 rounded-lg">Orders</Link>
          <Link href="/admin/menu" className="hover:bg-gray-700 px-4 py-2 rounded-lg">Menu Items</Link>
          <Link href="/admin/users" className="hover:bg-gray-700 px-4 py-2 rounded-lg">Users</Link>
        </nav>
        <button onClick={handleLogout} className="text-red-400 hover:text-red-300 text-left px-4 py-2">Logout</button>
      </aside>

      <main className="flex-1 p-10">
        <h2 className="text-3xl font-bold mb-8">Dashboard</h2>

        <div className="grid gap-6 mb-10 md:grid-cols-2 xl:grid-cols-4">
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-gray-500 text-sm">Total Users</p>
            <p className="text-4xl font-bold text-orange-500">{stats.users}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-gray-500 text-sm">Total Orders</p>
            <p className="text-4xl font-bold text-orange-500">{stats.orders}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-gray-500 text-sm">Menu Items</p>
            <p className="text-4xl font-bold text-orange-500">{stats.menu}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-gray-500 text-sm">Total Revenue</p>
            <p className="text-4xl font-bold text-orange-500">{formatCurrency(stats.revenue)}</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
          <section className="bg-white rounded-2xl shadow p-6">
            <div className="flex flex-col gap-2 mb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">Orders Overview</p>
                <h3 className="text-2xl font-bold text-gray-900">Last 7 days</h3>
              </div>
              <p className="text-sm text-gray-500">Daily order volume with revenue totals</p>
            </div>

            <div className="overflow-x-auto">
              <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="h-[260px] w-full min-w-[620px]">
                <defs>
                  <linearGradient id="ordersArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0.04" />
                  </linearGradient>
                </defs>

                {chart.gridLines.map((line) => (
                  <g key={`${line.value}-${line.y}`}>
                    <line
                      x1={28}
                      x2={chart.width - 28}
                      y1={line.y}
                      y2={line.y}
                      stroke="#e5e7eb"
                      strokeDasharray="4 6"
                    />
                    <text x={4} y={line.y + 4} fontSize="12" fill="#9ca3af">
                      {line.value}
                    </text>
                  </g>
                ))}

                <path d={chart.areaPath} fill="url(#ordersArea)" />
                <path d={chart.linePath} fill="none" stroke="#f97316" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

                {chart.coords.map((point) => (
                  <g key={point.day}>
                    <circle cx={point.x} cy={point.y} r="6" fill="#fff7ed" stroke="#f97316" strokeWidth="3" />
                    <text x={point.x} y={chart.height - 6} textAnchor="middle" fontSize="12" fill="#6b7280">
                      {point.label}
                    </text>
                    <text x={point.x} y={point.y - 14} textAnchor="middle" fontSize="12" fill="#111827">
                      {point.orders}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {chartData.map((point) => (
                <div key={point.day} className="rounded-xl border border-orange-100 bg-orange-50/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">{point.label}</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{point.orders} orders</p>
                  <p className="text-sm text-gray-600">{formatCurrency(point.revenue)}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <div className="bg-white rounded-2xl shadow p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">Performance</p>
              <h3 className="mt-2 text-2xl font-bold text-gray-900">Quick insights</h3>
              <div className="mt-6 space-y-4">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Best day</p>
                  <p className="text-2xl font-bold text-gray-900">{bestDay.label}</p>
                  <p className="text-sm text-gray-600">{bestDay.orders} orders placed</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Pending pipeline</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
                  <p className="text-sm text-gray-600">Orders still being processed</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Completion rate</p>
                  <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
                  <p className="text-sm text-gray-600">Delivered out of all orders</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">Status Breakdown</p>
              <div className="mt-5 space-y-4">
                {statusItems.map((status) => {
                  const percentage = stats.orders ? Math.round((status.count / stats.orders) * 100) : 0;

                  return (
                    <div key={status.label}>
                      <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
                        <span>{status.label}</span>
                        <span>{status.count} orders</span>
                      </div>
                      <div className="h-3 rounded-full bg-gray-100">
                        <div className={`${status.color} h-3 rounded-full`} style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
