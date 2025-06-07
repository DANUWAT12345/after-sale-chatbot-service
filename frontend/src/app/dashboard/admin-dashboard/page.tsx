"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

interface Ticket {
  _id: string;
  title: string;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  console.log('AdminDashboard component rendered');
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tickets?role=admin")
      .then(res => res.json())
      .then(data => {
        // Defensive: if data is not an array, try to extract tickets or fallback to []
        if (Array.isArray(data)) {
          setTickets(data);
        } else if (Array.isArray(data.tickets)) {
          setTickets(data.tickets);
        } else {
          setTickets([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setTickets([]);
        setLoading(false);
      });
  }, [router]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border px-3 py-2">ID</th>
              <th className="border px-3 py-2">Title</th>
              <th className="border px-3 py-2">Status</th>
              <th className="border px-3 py-2">Created At</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr key={ticket._id}>
                <td className="border px-3 py-2">{ticket._id}</td>
                <td className="border px-3 py-2">{ticket.title}</td>
                <td className="border px-3 py-2">{ticket.status}</td>
                <td className="border px-3 py-2">{new Date(ticket.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
