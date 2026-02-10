"use client";

import React from "react";

import { useQuery } from "@tanstack/react-query";

import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";

import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";

/* ================= TYPES ================= */
type Todo = {
  id: number;
  text: string;
  description: string; // ✅ added
  status: "todo" | "backlog" | "inprogress" | "done" | "cancelled";
  startAt: string;
  endAt: string;
};


/* ================= API ================= */

const fetchTodos = async (): Promise<Todo[]> => {
  const res = await fetch("/api/");

  if (!res.ok) {
    throw new Error("Failed to fetch todos");
  }

  return res.json();
};

/* ================= PAGE ================= */

export default function Page() {
  /* ---------- Fetch Todos ---------- */

  const {
    data: todos = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  /* ---------- Loading ---------- */

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        Loading dashboard...
      </div>
    );
  }

  /* ---------- Error ---------- */

  if (isError) {
    return (
      <div className="p-6 text-red-600">
        Failed to load dashboard
      </div>
    );
  }

 
const tableData = todos.map((t) => ({
  id: t.id,

  header: t.text,
  description: t.description, // ✅

  type: "Task",
  status: t.status,

  target: new Date(t.startAt).toLocaleDateString(),
  limit: new Date(t.endAt).toLocaleDateString(),
}));


  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      
      <SidebarInset>
        {/* Header */}
        <SiteHeader />

        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">

            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

             
              <SectionCards todos={todos} />

              
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive todos={todos} />
              </div>

              <DataTable data={tableData} />

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
