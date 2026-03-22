import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { getAdminPayouts, updateAdminPayout } from '../../utils/api';

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchPayouts = () => {
    getAdminPayouts()
      .then((data) => setPayouts(data.payouts))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPayouts(); }, []);

  const handleUpdate = async (id, status) => {
    try {
      setError('');
      await updateAdminPayout(id, status);
      setSuccess(`Payout ${status} successfully!`);
      fetchPayouts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredPayouts = filter === 'all' ? payouts : payouts.filter((p) => p.status === filter);

  return (
    <DashboardLayout>
      <div className="page-header">
        <h2>Payout Management</h2>
        <p>Review, approve, reject, and process creator payouts</p>
      </div>

      {success && <div className="alert alert-success">✅ {success}</div>}
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'pending', 'approved', 'paid', 'rejected'].map((f) => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && ` (${payouts.filter((p) => p.status === f).length})`}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Payouts ({filteredPayouts.length})</h3>
        </div>
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : filteredPayouts.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Creator</th>
                  <th>Email</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Requested</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayouts.map((payout) => (
                  <tr key={payout._id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{payout.creator?.name}</td>
                    <td>{payout.creator?.email}</td>
                    <td style={{ fontWeight: 600 }}>₹{payout.amount.toLocaleString()}</td>
                    <td><span className={`badge badge-${payout.status}`}>{payout.status}</span></td>
                    <td>{new Date(payout.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="btn-group">
                        {payout.status === 'pending' && (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => handleUpdate(payout._id, 'approved')}>Approve</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleUpdate(payout._id, 'rejected')}>Reject</button>
                          </>
                        )}
                        {payout.status === 'approved' && (
                          <button className="btn btn-primary btn-sm" onClick={() => handleUpdate(payout._id, 'paid')}>💸 Mark Paid</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">💸</div>
            <h3>No payouts to show</h3>
            <p>{filter === 'all' ? 'No payout requests received yet' : `No ${filter} payouts`}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
