import { useEffect, useState } from 'react';
import { getDashboardStats } from '../services/reservationApi';
import { useAuth } from '../context/AuthContext';

function StatCard({ label, value, color, icon }) {
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl p-5`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-400 text-sm">{label}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.full_name?.split(' ')[0]}!
        </h1>
        <p className="text-slate-400 text-sm mt-1">{today}</p>
      </div>

      {loading ? (
        <div className="text-slate-400 text-center py-16">Loading dashboard...</div>
      ) : (
        <>
          {/* Today's Activity */}
          <div>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Today</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <StatCard label="Check-ins Today" value={stats?.today_check_ins ?? 0} color="text-green-400" icon="✅" />
              <StatCard label="Check-outs Today" value={stats?.today_check_outs ?? 0} color="text-orange-400" icon="🚪" />
              <StatCard
                label="Today Revenue"
                value={`${(stats?.today_revenue ?? 0).toLocaleString()} ETB`}
                color="text-blue-400"
                icon="💰"
              />
            </div>
          </div>

          {/* Room Status */}
          <div>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Room Status</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Available" value={stats?.rooms?.available ?? 0} color="text-emerald-400" icon="🟢" />
              <StatCard label="Occupied" value={stats?.rooms?.occupied ?? 0} color="text-red-400" icon="🔴" />
              <StatCard label="Reserved" value={stats?.rooms?.reserved ?? 0} color="text-yellow-400" icon="🟡" />
              <StatCard label="Maintenance" value={stats?.rooms?.maintenance ?? 0} color="text-slate-400" icon="🔧" />
            </div>
          </div>

          {/* Reservation Stats */}
          <div>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Reservations</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { key: 'confirmed', label: 'Confirmed', color: 'text-blue-400', icon: '📋' },
                { key: 'checked_in', label: 'Checked In', color: 'text-green-400', icon: '🏠' },
                { key: 'checked_out', label: 'Checked Out', color: 'text-slate-400', icon: '✓' },
                { key: 'pending', label: 'Pending', color: 'text-yellow-400', icon: '⏳' },
                { key: 'cancelled', label: 'Cancelled', color: 'text-red-400', icon: '✗' },
              ].map(({ key, label, color, icon }) => (
                <StatCard key={key} label={label} value={stats?.reservations?.[key] ?? 0} color={color} icon={icon} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

