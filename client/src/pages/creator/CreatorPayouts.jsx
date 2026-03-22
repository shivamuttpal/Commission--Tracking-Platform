import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { getPayouts } from '../../utils/api';

export default function CreatorPayouts() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPayouts()
      .then((data) => setPayouts(data.payouts))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="page-header">
        <h2>Payout History</h2>
        <p>Track the status of your payout requests</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Payouts ({payouts.length})</h3>
        </div>
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : payouts.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Requested On</th>
                  <th>Processed On</th>
                  <th>Admin Note</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr key={payout._id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>₹{payout.amount.toLocaleString()}</td>
                    <td><span className={`badge badge-${payout.status}`}>{payout.status}</span></td>
                    <td>{new Date(payout.createdAt).toLocaleDateString()}</td>
                    <td>{payout.processedAt ? new Date(payout.processedAt).toLocaleDateString() : '—'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{payout.adminNote || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">💸</div>
            <h3>No payout requests yet</h3>
            <p>Request a payout from your wallet when your balance is ₹500 or more</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
