import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { getWallet, getReferralLinks } from '../../utils/api';

export default function CreatorDashboard() {
  const [wallet, setWallet] = useState(null);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getWallet(), getReferralLinks()])
      .then(([walletData, linksData]) => {
        setWallet(walletData.wallet);
        setLinks(linksData.referralLinks || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalClicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0);
  const totalConversions = links.reduce((sum, l) => sum + (l.conversions || 0), 0);
  const totalEarnings = wallet?.totalEarnings || 0;

  if (loading) return <DashboardLayout><div className="loading"><div className="spinner"></div></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="page-header">
        <h2>Creator Dashboard</h2>
        <p>Track your referrals, conversions, and earnings</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card purple">
          <div className="stat-icon">👁️</div>
          <div className="stat-value">{totalClicks}</div>
          <div className="stat-label">Total Clicks</div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-icon">🛒</div>
          <div className="stat-value">{totalConversions}</div>
          <div className="stat-label">Conversions</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">💰</div>
          <div className="stat-value">₹{totalEarnings.toLocaleString()}</div>
          <div className="stat-label">Total Earnings</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-icon">💳</div>
          <div className="stat-value">₹{(wallet?.availableBalance || 0).toLocaleString()}</div>
          <div className="stat-label">Available Balance</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Your Referral Links</h3>
        </div>
        {links.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Clicks</th>
                  <th>Conversions</th>
                  <th>Earnings</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <tr key={link._id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{link.product?.name}</td>
                    <td>{link.clicks}</td>
                    <td>{link.conversions}</td>
                    <td style={{ color: 'var(--success)' }}>₹{(link.earnings || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔗</div>
            <h3>No referral links yet</h3>
            <p>Apply to products and generate your referral links to start earning</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
