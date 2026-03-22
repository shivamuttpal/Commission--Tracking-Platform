import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { getAdminMetrics } from '../../utils/api';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminMetrics()
      .then((data) => setMetrics(data.metrics))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><div className="loading"><div className="spinner"></div></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="page-header">
        <h2>Admin Dashboard</h2>
        <p>Platform-wide metrics and overview</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card purple">
          <div className="stat-icon">🏢</div>
          <div className="stat-value">{metrics?.totalBrands || 0}</div>
          <div className="stat-label">Total Brands</div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-icon">👤</div>
          <div className="stat-value">{metrics?.totalCreators || 0}</div>
          <div className="stat-label">Total Creators</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">📦</div>
          <div className="stat-value">{metrics?.totalProducts || 0}</div>
          <div className="stat-label">Active Products</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-icon">👁️</div>
          <div className="stat-value">{(metrics?.totalClicks || 0).toLocaleString()}</div>
          <div className="stat-label">Total Clicks</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon">🛒</div>
          <div className="stat-value">{metrics?.totalConversions || 0}</div>
          <div className="stat-label">Total Conversions</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">💰</div>
          <div className="stat-value">₹{(metrics?.totalCommissionGenerated || 0).toLocaleString()}</div>
          <div className="stat-label">Commission Generated</div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{metrics?.pendingPayouts || 0}</div>
          <div className="stat-label">Pending Payouts</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon">💸</div>
          <div className="stat-value">₹{(metrics?.totalPayoutsPaid || 0).toLocaleString()}</div>
          <div className="stat-label">Payouts Disbursed</div>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card">
          <div className="card-header"><h3>Application Stats</h3></div>
          <div style={{ padding: '12px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Applications</span>
              <span style={{ fontWeight: 600 }}>{metrics?.totalApplications || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Approved</span>
              <span style={{ fontWeight: 600, color: 'var(--success)' }}>{metrics?.approvedApplications || 0}</span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3>Platform Health</h3></div>
          <div style={{ padding: '12px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Conversion Rate</span>
              <span style={{ fontWeight: 600, color: 'var(--accent-light)' }}>
                {metrics?.totalClicks > 0 ? ((metrics.totalConversions / metrics.totalClicks) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Avg. Commission</span>
              <span style={{ fontWeight: 600, color: 'var(--success)' }}>
                ₹{metrics?.totalConversions > 0 ? (metrics.totalCommissionGenerated / metrics.totalConversions).toFixed(0) : 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
