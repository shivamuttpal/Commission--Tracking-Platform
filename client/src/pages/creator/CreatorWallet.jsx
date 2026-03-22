import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { getWallet, getTransactions, requestPayout } from '../../utils/api';

export default function CreatorWallet() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayout, setShowPayout] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = () => {
    Promise.all([getWallet(), getTransactions()])
      .then(([walletData, txData]) => {
        setWallet(walletData.wallet);
        setTransactions(txData.transactions);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handlePayout = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await requestPayout(Number(payoutAmount));
      setSuccess('Payout request submitted!');
      setShowPayout(false);
      setPayoutAmount('');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'commission': return '💰';
      case 'payout_request': return '📤';
      case 'payout_approved': return '✅';
      case 'payout_paid': return '💸';
      case 'payout_rejected': return '❌';
      default: return '📝';
    }
  };

  if (loading) return <DashboardLayout><div className="loading"><div className="spinner"></div></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="page-header">
        <h2>Wallet</h2>
        <p>Manage your earnings and request payouts</p>
      </div>

      {success && <div className="alert alert-success">✅ {success}</div>}
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="wallet-overview">
        <div className="wallet-card highlight">
          <div className="wallet-label">Available Balance</div>
          <div className="wallet-amount" style={{ color: 'var(--success)' }}>₹{(wallet?.availableBalance || 0).toLocaleString()}</div>
        </div>
        <div className="wallet-card">
          <div className="wallet-label">Pending Earnings</div>
          <div className="wallet-amount" style={{ color: 'var(--warning)' }}>₹{(wallet?.pendingEarnings || 0).toLocaleString()}</div>
        </div>
        <div className="wallet-card">
          <div className="wallet-label">Total Earnings</div>
          <div className="wallet-amount" style={{ color: 'var(--primary-light)' }}>₹{(wallet?.totalEarnings || 0).toLocaleString()}</div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <button className="btn btn-primary" onClick={() => setShowPayout(!showPayout)}>
          {showPayout ? '✕ Cancel' : '💸 Request Payout'}
        </button>
      </div>

      {showPayout && (
        <div className="card" style={{ marginBottom: 20, maxWidth: 400 }}>
          <h3 style={{ marginBottom: 12 }}>Request Payout</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 16 }}>
            Minimum payout: ₹500 • Available: ₹{(wallet?.availableBalance || 0).toLocaleString()}
          </p>
          <form onSubmit={handlePayout}>
            <div className="form-group">
              <label>Amount (₹)</label>
              <input
                type="number"
                className="form-input"
                placeholder="500"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                min="500"
                max={wallet?.availableBalance || 0}
                required
              />
            </div>
            <button type="submit" className="btn btn-success">Submit Request</button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3>Transaction History</h3>
        </div>
        {transactions.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Description</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id}>
                    <td>{getTypeIcon(tx.type)} {tx.type.replace(/_/g, ' ')}</td>
                    <td style={{ color: tx.type === 'commission' ? 'var(--success)' : 'var(--text-primary)', fontWeight: 600 }}>
                      {tx.type === 'commission' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                    </td>
                    <td><span className={`badge badge-${tx.status}`}>{tx.status}</span></td>
                    <td style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.description}</td>
                    <td>{new Date(tx.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No transactions yet</h3>
            <p>Your transaction history will appear here</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
