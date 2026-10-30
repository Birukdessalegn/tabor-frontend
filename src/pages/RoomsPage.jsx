import { useEffect, useState } from 'react';
import { getRooms, getRoomTypes } from '../services/reservationApi';

const STATUS_COLORS = {
  available: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  occupied: 'bg-red-500/20 text-red-400 border-red-500/30',
  reserved: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  maintenance: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getRooms(), getRoomTypes()])
      .then(([rRes, rtRes]) => {
        setRooms(rRes.data.rooms);
        setRoomTypes(rtRes.data.roomTypes);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter
    ? rooms.filter((r) => r.status === filter)
    : rooms;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">Rooms</h1>
        <div className="flex flex-wrap gap-2">
          {['', 'available', 'occupied', 'reserved', 'maintenance'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition
                ${filter === s
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-slate-700 text-slate-400 hover:border-blue-500 hover:text-white'}`}
            >
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-slate-400 text-center py-16">Loading rooms...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((room) => (
            <div key={room.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-600 transition">
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl font-bold text-white">{room.room_number}</span>
                <span className="text-xs text-slate-500">Floor {room.floor}</span>
              </div>
              <p className="text-sm text-slate-300 mb-1">{room.room_type_name}</p>
              <p className="text-xs text-blue-400 mb-3">{Number(room.base_rate).toLocaleString()} ETB/night</p>
              <span className={`inline-block text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[room.status]}`}>
                {room.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Room Types */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Room Types</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {['Type', 'Base Rate', 'Max Occupancy', 'Description'].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-slate-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roomTypes.map((rt) => (
                <tr key={rt.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="py-3 px-4 text-white font-medium">{rt.name}</td>
                  <td className="py-3 px-4 text-blue-400">{Number(rt.base_rate).toLocaleString()} ETB</td>
                  <td className="py-3 px-4 text-slate-300">{rt.max_occupancy} guests</td>
                  <td className="py-3 px-4 text-slate-400">{rt.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

