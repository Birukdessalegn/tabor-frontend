import { useEffect, useState, useCallback } from 'react';
import {
  getReservations,
  createReservation,
  updateReservationStatus,
  amendReservationPrice,
  recordPayment,
  getAvailableRooms,
  getCustomers,
} from '../services/reservationApi';
import NewReservationModal from '../components/NewReservationModal';
import ReservationDetailModal from '../components/ReservationDetailModal';

const STATUS_COLORS = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  checked_in: 'bg-green-500/20 text-green-400 border-green-500/30',
  checked_out: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  no_show: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const TABS = [
  { id: '', label: 'All' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'checked_in', label: 'Checked In' },
  { id: 'checked_out', label: 'Checked Out' },
  { id: 'pending', label: 'Pending' },
  { id: 'cancelled', label: 'Cancelled' },
];

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState(null);

  const fetchReservations = useCallback(() => {
    setLoading(true);
    getReservations({ status: activeTab || undefined, search: search || undefined })
      .then((res) => setReservations(res.data.reservations))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeTab, search]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  async function handleCreate(data) {
    await createReservation(data);
    setShowNew(false);
    fetchReservations();
  }

  async function handleStatusUpdate(id, status) {
    await updateReservationStatus(id, status);
    setSelected(null);
    fetchReservations();
  }

  async function handleAmend(id, data) {
    await amendReservationPrice(id, data);
    setSelected(null);
    fetchReservations();
  }

  async function handlePayment(id, data) {
    await recordPayment(id, data);
    setSelected(null);
    fetchReservations();
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">Reservations</h1>
        <button
          onClick={() => setShowNew(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition flex items-center gap-2"
        >
          <span>+</span> New Reservation
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by guest name, room, or reservation code..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
      />

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition flex-shrink-0
              ${activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-slate-400 text-center py-16">Loading reservations...</div>
      ) : reservations.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-4xl mb-3">📋</p>
          <p>No reservations found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-slate-900 border-b border-slate-800">
              <tr>
                {['Code', 'Room', 'Guest', 'Check-in', 'Check-out', 'Nights', 'Rate', 'Total', 'Status', 'Payment'].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-slate-400 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className="border-b border-slate-800/50 hover:bg-slate-800/40 cursor-pointer transition"
                >
                  <td className="py-3 px-4 text-blue-400 font-mono text-xs">{r.reservation_code}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-white">{r.room_number}</span>
                    <span className="block text-xs text-slate-400">{r.room_type_name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-white">{r.customer_name}</span>
                    <span className="block text-xs text-slate-400">{r.customer_phone}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 whitespace-nowrap">{r.check_in_date?.slice(0, 10)}</td>
                  <td className="py-3 px-4 text-slate-300 whitespace-nowrap">{r.check_out_date?.slice(0, 10)}</td>
                  <td className="py-3 px-4 text-center text-slate-300">{r.nights}</td>
                  <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                    {Number(r.rate_per_night).toLocaleString()} ETB
                  </td>
                  <td className="py-3 px-4 text-white font-semibold whitespace-nowrap">
                    {Number(r.amended_total || r.total_amount).toLocaleString()} ETB
                    {r.amended_total && (
                      <span className="block text-xs text-yellow-400">Amended</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border font-medium whitespace-nowrap ${STATUS_COLORS[r.status]}`}>
                      {r.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border font-medium whitespace-nowrap
                      ${r.payment_status === 'paid' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        r.payment_status === 'partial' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                      {r.payment_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showNew && (
        <NewReservationModal
          onClose={() => setShowNew(false)}
          onSubmit={handleCreate}
        />
      )}

      {selected && (
        <ReservationDetailModal
          reservation={selected}
          onClose={() => setSelected(null)}
          onStatusUpdate={handleStatusUpdate}
          onAmend={handleAmend}
          onPayment={handlePayment}
        />
      )}
    </div>
  );
}

