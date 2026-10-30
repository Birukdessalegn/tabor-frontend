import { useEffect, useState } from 'react';
import { getAvailableRooms, getCustomers } from '../services/reservationApi';

export default function NewReservationModal({ onClose, onSubmit }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    check_in_date: '',
    check_out_date: '',
    room_id: '',
    rate_per_night: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    nationality: '',
    id_type: '',
    id_number: '',
    special_requests: '',
    payment_status: 'unpaid',
    status: 'confirmed',
  });
  const [availableRooms, setAvailableRooms] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nights, setNights] = useState(0);

  // Calculate nights
  useEffect(() => {
    if (form.check_in_date && form.check_out_date) {
      const n = Math.ceil(
        (new Date(form.check_out_date) - new Date(form.check_in_date)) / (1000 * 60 * 60 * 24)
      );
      setNights(n > 0 ? n : 0);
    }
  }, [form.check_in_date, form.check_out_date]);

  // Fetch available rooms when dates are set
  useEffect(() => {
    if (form.check_in_date && form.check_out_date && nights > 0) {
      getAvailableRooms(form.check_in_date, form.check_out_date)
        .then((res) => setAvailableRooms(res.data.rooms))
        .catch(console.error);
    }
  }, [form.check_in_date, form.check_out_date, nights]);

  // Customer search
  useEffect(() => {
    if (customerSearch.length >= 2) {
      getCustomers(customerSearch)
        .then((res) => setCustomers(res.data.customers))
        .catch(console.error);
    } else {
      setCustomers([]);
    }
  }, [customerSearch]);

  function selectRoom(room) {
    setForm((f) => ({ ...f, room_id: room.id, rate_per_night: room.base_rate }));
  }

  function selectCustomer(c) {
    setForm((f) => ({
      ...f,
      customer_id: c.id,
      customer_name: c.full_name,
      customer_phone: c.phone || '',
      customer_email: c.email || '',
      nationality: c.nationality || '',
      id_type: c.id_type || '',
      id_number: c.id_number || '',
    }));
    setCustomers([]);
    setCustomerSearch(c.full_name);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.room_id) return setError('Please select a room');
    if (!form.customer_name || !form.customer_phone) return setError('Guest name and phone are required');
    if (nights <= 0) return setError('Check-out must be after check-in');
    setLoading(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create reservation');
    } finally {
      setLoading(false);
    }
  }

  const selectedRoom = availableRooms.find((r) => r.id === parseInt(form.room_id));
  const total = (parseFloat(form.rate_per_night) || 0) * nights;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-white">New Reservation</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Dates */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">1</span>
              Stay Dates
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Check-in Date *</label>
                <input
                  type="date"
                  value={form.check_in_date}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setForm({ ...form, check_in_date: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Check-out Date *</label>
                <input
                  type="date"
                  value={form.check_out_date}
                  min={form.check_in_date || new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setForm({ ...form, check_out_date: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>
            {nights > 0 && (
              <p className="text-blue-400 text-xs mt-2">{nights} night{nights !== 1 ? 's' : ''}</p>
            )}
          </div>

          {/* Step 2: Room Selection */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">2</span>
              Select Room
            </h3>
            {!form.check_in_date || !form.check_out_date ? (
              <p className="text-slate-500 text-sm">Set dates first to see available rooms</p>
            ) : availableRooms.length === 0 ? (
              <p className="text-slate-500 text-sm">No rooms available for selected dates</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableRooms.map((room) => (
                  <button
                    type="button"
                    key={room.id}
                    onClick={() => selectRoom(room)}
                    className={`p-3 rounded-xl border text-left transition
                      ${form.room_id === room.id
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-slate-700 bg-slate-800 hover:border-slate-500'}`}
                  >
                    <p className="font-bold text-white text-lg">{room.room_number}</p>
                    <p className="text-xs text-slate-400">{room.room_type_name}</p>
                    <p className="text-xs text-blue-400 mt-1">{Number(room.base_rate).toLocaleString()} ETB/night</p>
                  </button>
                ))}
              </div>
            )}
            {selectedRoom && (
              <div className="mt-3 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Rate per Night (ETB) *</label>
                  <input
                    type="number"
                    value={form.rate_per_night}
                    onChange={(e) => setForm({ ...form, rate_per_night: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                {nights > 0 && (
                  <div className="flex items-end pb-2">
                    <div>
                      <p className="text-xs text-slate-400">Total ({nights} nights)</p>
                      <p className="text-xl font-bold text-white">{total.toLocaleString()} ETB</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step 3: Guest Info */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">3</span>
              Guest Information
            </h3>
            <div className="relative mb-3">
              <label className="block text-xs text-slate-400 mb-1">Search Existing Guest</label>
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Type name or phone to search..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              />
              {customers.length > 0 && (
                <div className="absolute z-10 w-full bg-slate-800 border border-slate-700 rounded-lg mt-1 shadow-xl max-h-40 overflow-y-auto">
                  {customers.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => selectCustomer(c)}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-700 transition border-b border-slate-700/50 last:border-0"
                    >
                      <p className="text-white text-sm">{c.full_name}</p>
                      <p className="text-xs text-slate-400">{c.phone} {c.nationality ? `· ${c.nationality}` : ''}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Full Name *</label>
                <input type="text" value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  required />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Phone *</label>
                <input type="tel" value={form.customer_phone}
                  onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  required />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Email</label>
                <input type="email" value={form.customer_email}
                  onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nationality</label>
                <input type="text" value={form.nationality}
                  onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">ID Type</label>
                <select value={form.id_type}
                  onChange={(e) => setForm({ ...form, id_type: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
                  <option value="">Select ID Type</option>
                  <option value="Passport">Passport</option>
                  <option value="National ID">National ID</option>
                  <option value="Driver License">Driver License</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">ID Number</label>
                <input type="text" value={form.id_number}
                  onChange={(e) => setForm({ ...form, id_number: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>
          </div>

          {/* Step 4: Extras */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">4</span>
              Additional Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Status</label>
                <select value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="checked_in">Check In Now</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Payment Status</label>
                <select value={form.payment_status}
                  onChange={(e) => setForm({ ...form, payment_status: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
                  <option value="unpaid">Unpaid</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-xs text-slate-400 mb-1">Special Requests</label>
              <textarea value={form.special_requests}
                onChange={(e) => setForm({ ...form, special_requests: e.target.value })}
                rows={2}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Any special requests from the guest..." />
            </div>
          </div>

          {/* Summary */}
          {selectedRoom && nights > 0 && (
            <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-blue-300 mb-2">Reservation Summary</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Room {selectedRoom.room_number} ({selectedRoom.room_type_name})</span>
                  <span>{Number(form.rate_per_night).toLocaleString()} ETB/night</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>{nights} night{nights !== 1 ? 's' : ''} ({form.check_in_date} - {form.check_out_date})</span>
                </div>
                <div className="flex justify-between text-white font-bold pt-1 border-t border-blue-500/30">
                  <span>Total</span>
                  <span>{total.toLocaleString()} ETB</span>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 rounded-lg text-sm transition">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold rounded-lg text-sm transition">
              {loading ? 'Creating...' : 'Create Reservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

