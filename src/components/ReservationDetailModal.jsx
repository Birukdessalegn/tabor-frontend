import { useState } from 'react';

const STATUS_FLOW = {
  pending: ['confirmed', 'cancelled', 'no_show'],
  confirmed: ['checked_in', 'cancelled', 'no_show'],
  checked_in: ['checked_out'],
  checked_out: [],
  cancelled: [],
  no_show: [],
};

const STATUS_LABELS = {
  confirmed: { label: 'Confirm', color: 'bg-blue-600 hover:bg-blue-500' },
  checked_in: { label: 'Check In', color: 'bg-green-600 hover:bg-green-500' },
  checked_out: { label: 'Check Out', color: 'bg-slate-600 hover:bg-slate-500' },
  cancelled: { label: 'Cancel', color: 'bg-red-600 hover:bg-red-500' },
  no_show: { label: 'No Show', color: 'bg-orange-600 hover:bg-orange-500' },
};

export default function ReservationDetailModal({ reservation: r, onClose, onStatusUpdate, onAmend, onPayment }) {
  const [activeSection, setActiveSection] = useState('details');
  const [amendForm, setAmendForm] = useState({ new_rate_per_night: r.rate_per_night, reason: '' });
  const [paymentForm, setPaymentForm] = useState({ amount: '', payment_method: 'cash', reference_number: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const nextStatuses = STATUS_FLOW[r.status] || [];
  const totalDue = r.amended_total || r.total_amount;
  const nights = r.nights;
  const newAmendTotal = parseFloat(amendForm.new_rate_per_night || 0) * nights;

  async function handleStatusUpdate(status) {
    setLoading(true);
    try {
      await onStatusUpdate(r.id, status);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  }

  async function handleAmend(e) {
    e.preventDefault();
    if (!amendForm.reason) return setError('Reason is required');
    setLoading(true);
    try {
      await onAmend(r.id, amendForm);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to amend price');
    } finally {
      setLoading(false);
    }
  }

  async function handlePayment(e) {
    e.preventDefault();
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) return setError('Enter valid amount');
    setLoading(true);
    try {
      await onPayment(r.id, paymentForm);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tabor Hotel - Reservation ${r.reservation_code}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; }
          h1 { text-align: center; font-size: 18px; }
          .subtitle { text-align: center; color: #666; font-size: 12px; margin-bottom: 20px; }
          hr { border: 1px dashed #ccc; margin: 10px 0; }
          .row { display: flex; justify-content: space-between; margin: 4px 0; font-size: 13px; }
          .label { color: #666; }
          .total { font-weight: bold; font-size: 15px; margin-top: 10px; }
          .code { text-align: center; font-size: 20px; font-weight: bold; letter-spacing: 2px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #999; }
        </style>
      </head>
      <body>
        <h1>🏨 Tabor Hotel</h1>
        <p class="subtitle">Room Reservation Confirmation</p>
        <hr/>
        <div class="code">${r.reservation_code}</div>
        <hr/>
        <div class="row"><span class="label">Guest:</span><span>${r.customer_name}</span></div>
        <div class="row"><span class="label">Phone:</span><span>${r.customer_phone}</span></div>
        ${r.nationality ? `<div class="row"><span class="label">Nationality:</span><span>${r.nationality}</span></div>` : ''}
        ${r.id_number ? `<div class="row"><span class="label">ID:</span><span>${r.id_type} - ${r.id_number}</span></div>` : ''}
        <hr/>
        <div class="row"><span class="label">Room:</span><span>${r.room_number} - ${r.room_type_name}</span></div>
        <div class="row"><span class="label">Check-in:</span><span>${r.check_in_date?.slice(0,10)}</span></div>
        <div class="row"><span class="label">Check-out:</span><span>${r.check_out_date?.slice(0,10)}</span></div>
        <div class="row"><span class="label">Nights:</span><span>${r.nights}</span></div>
        <div class="row"><span class="label">Rate/Night:</span><span>${Number(r.rate_per_night).toLocaleString()} ETB</span></div>
        <hr/>
        ${r.amended_total ? `<div class="row"><span class="label">Original Total:</span><span>${Number(r.total_amount).toLocaleString()} ETB</span></div>` : ''}
        <div class="row total"><span>Total Due:</span><span>${Number(totalDue).toLocaleString()} ETB</span></div>
        <div class="row"><span class="label">Payment Status:</span><span>${r.payment_status?.toUpperCase()}</span></div>
        ${r.total_paid > 0 ? `<div class="row"><span class="label">Paid:</span><span>${Number(r.total_paid).toLocaleString()} ETB</span></div>` : ''}
        ${r.special_requests ? `<hr/><div><span class="label">Special Requests:</span><p>${r.special_requests}</p></div>` : ''}
        <hr/>
        <p class="footer">Tabor Hotel Management System<br/>Printed: ${new Date().toLocaleString()}</p>
      </body>
      </html>
    `;
    const w = window.open('', '_blank');
    w.document.write(printContent);
    w.document.close();
    w.print();
  }

  const SECTIONS = ['details', 'amend', 'payment'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-6 py-4 rounded-t-2xl z-10">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-bold text-white">{r.reservation_code}</h2>
              <p className="text-xs text-slate-400">Room {r.room_number} · {r.room_type_name}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handlePrint} className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded-lg text-lg" title="Print">🖨️</button>
              <button onClick={onClose} className="text-slate-400 hover:text-white text-xl p-1">✕</button>
            </div>
          </div>
          {/* Section tabs */}
          <div className="flex gap-1">
            {[['details', '📋 Details'], ['amend', '✏️ Amend Price'], ['payment', '💳 Payment']].map(([id, label]) => (
              <button key={id} onClick={() => { setActiveSection(id); setError(''); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition
                  ${activeSection === id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-300 text-sm">{error}</div>
          )}

          {/* Details Section */}
          {activeSection === 'details' && (
            <div className="space-y-4">
              {/* Guest */}
              <div className="bg-slate-800/50 rounded-xl p-4">
                <p className="text-xs text-slate-400 font-medium mb-2">Guest</p>
                <p className="text-white font-semibold">{r.customer_name}</p>
                <p className="text-slate-300 text-sm">{r.customer_phone}</p>
                {r.customer_email && <p className="text-slate-400 text-sm">{r.customer_email}</p>}
                {r.nationality && <p className="text-slate-400 text-sm">{r.nationality}</p>}
                {r.id_number && <p className="text-slate-400 text-sm">{r.id_type}: {r.id_number}</p>}
              </div>

              {/* Stay */}
              <div className="bg-slate-800/50 rounded-xl p-4">
                <p className="text-xs text-slate-400 font-medium mb-2">Stay Details</p>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <span className="text-slate-400">Check-in</span>
                  <span className="text-white">{r.check_in_date?.slice(0, 10)}</span>
                  <span className="text-slate-400">Check-out</span>
                  <span className="text-white">{r.check_out_date?.slice(0, 10)}</span>
                  <span className="text-slate-400">Nights</span>
                  <span className="text-white">{r.nights}</span>
                  <span className="text-slate-400">Rate/Night</span>
                  <span className="text-white">{Number(r.rate_per_night).toLocaleString()} ETB</span>
                  {r.amended_total && (
                    <>
                      <span className="text-slate-400">Original Total</span>
                      <span className="text-slate-400 line-through">{Number(r.total_amount).toLocaleString()} ETB</span>
                    </>
                  )}
                  <span className="text-slate-400 font-semibold">Total Due</span>
                  <span className="text-white font-bold">{Number(totalDue).toLocaleString()} ETB</span>
                  <span className="text-slate-400">Paid</span>
                  <span className="text-green-400">{Number(r.total_paid || 0).toLocaleString()} ETB</span>
                </div>
              </div>

              {/* Status actions */}
              {nextStatuses.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 font-medium mb-2">Actions</p>
                  <div className="flex flex-wrap gap-2">
                    {nextStatuses.map((s) => (
                      <button key={s} onClick={() => handleStatusUpdate(s)} disabled={loading}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition ${STATUS_LABELS[s]?.color}`}>
                        {STATUS_LABELS[s]?.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {r.special_requests && (
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 font-medium mb-1">Special Requests</p>
                  <p className="text-slate-300 text-sm">{r.special_requests}</p>
                </div>
              )}
            </div>
          )}

          {/* Amend Price Section */}
          {activeSection === 'amend' && (
            <form onSubmit={handleAmend} className="space-y-4">
              <div className="bg-slate-800/50 rounded-xl p-4 text-sm">
                <p className="text-slate-400 mb-1">Current Rate</p>
                <p className="text-white font-bold text-xl">{Number(r.rate_per_night).toLocaleString()} ETB/night</p>
                <p className="text-slate-400">× {nights} nights = {Number(totalDue).toLocaleString()} ETB total</p>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">New Rate per Night (ETB) *</label>
                <input type="number" value={amendForm.new_rate_per_night}
                  onChange={(e) => setAmendForm({ ...amendForm, new_rate_per_night: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  required min="0" />
              </div>
              {amendForm.new_rate_per_night && (
                <div className={`bg-slate-800/50 rounded-xl p-3 text-sm flex justify-between`}>
                  <span className="text-slate-400">New Total ({nights} nights)</span>
                  <span className={`font-bold ${newAmendTotal < totalDue ? 'text-red-400' : newAmendTotal > totalDue ? 'text-green-400' : 'text-white'}`}>
                    {newAmendTotal.toLocaleString()} ETB
                    {newAmendTotal !== totalDue && (
                      <span className="ml-2 text-xs">
                        ({newAmendTotal > totalDue ? '+' : ''}{(newAmendTotal - totalDue).toLocaleString()} ETB)
                      </span>
                    )}
                  </span>
                </div>
              )}
              <div>
                <label className="block text-xs text-slate-400 mb-1">Reason for Amendment *</label>
                <textarea value={amendForm.reason}
                  onChange={(e) => setAmendForm({ ...amendForm, reason: e.target.value })}
                  rows={3} required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Explain reason for price amendment..." />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-yellow-600 hover:bg-yellow-500 disabled:bg-yellow-900 text-white font-semibold rounded-lg text-sm transition">
                {loading ? 'Amending...' : 'Apply Price Amendment'}
              </button>
            </form>
          )}

          {/* Payment Section */}
          {activeSection === 'payment' && (
            <form onSubmit={handlePayment} className="space-y-4">
              <div className="bg-slate-800/50 rounded-xl p-4 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Total Due</span>
                  <span className="text-white font-bold">{Number(totalDue).toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Total Paid</span>
                  <span className="text-green-400">{Number(r.total_paid || 0).toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between font-semibold border-t border-slate-700 pt-1 mt-1">
                  <span className="text-slate-300">Balance</span>
                  <span className={Number(totalDue) - Number(r.total_paid || 0) <= 0 ? 'text-green-400' : 'text-red-400'}>
                    {(Number(totalDue) - Number(r.total_paid || 0)).toLocaleString()} ETB
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Amount (ETB) *</label>
                <input type="number" value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  required min="1"
                  placeholder={`Remaining: ${(Number(totalDue) - Number(r.total_paid || 0)).toLocaleString()} ETB`} />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Payment Method *</label>
                <select value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="complimentary">Complimentary</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Reference Number</label>
                <input type="text" value={paymentForm.reference_number}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference_number: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Bank ref, receipt no. etc." />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Notes</label>
                <textarea value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-green-600 hover:bg-green-500 disabled:bg-green-900 text-white font-semibold rounded-lg text-sm transition">
                {loading ? 'Recording...' : 'Record Payment'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

