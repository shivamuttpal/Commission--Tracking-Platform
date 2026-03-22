import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { getBrandAnalytics } from '../../utils/api';

export default function BrandDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBrandAnalytics()
      .then((data) => setAnalytics(data.analytics))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><div className="loading"><div className="spinner"></div></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="page-header">
        <h2>Brand Dashboard</h2>
        <p>Overview of your products and affiliate performance</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card purple">
          <div className="stat-icon">👁️</div>
          <div className="stat-value">{analytics?.totalClicks || 0}</div>
          <div className="stat-label">Total Clicks</div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-icon">🛒</div>
          <div className="stat-value">{analytics?.totalConversions || 0}</div>
          <div className="stat-label">Total Conversions</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">💰</div>
          <div className="stat-value">₹{(analytics?.totalCommissionPaid || 0).toLocaleString()}</div>
          <div className="stat-label">Commission Paid</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Product Performance</h3>
        </div>
        {analytics?.productStats?.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Commission %</th>
                  <th>Clicks</th>
                  <th>Conversions</th>
                  <th>Commission Paid</th>
                </tr>
              </thead>
              <tbody>
                {analytics.productStats.map((stat) => (
                  <tr key={stat.product.id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{stat.product.name}</td>
                    <td>₹{stat.product.price}</td>
                    <td>{stat.product.commissionPercent}%</td>
                    <td>{stat.clicks}</td>
                    <td>{stat.conversions}</td>
                    <td style={{ color: 'var(--success)' }}>₹{stat.totalCommission.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No products yet</h3>
            <p>Add your first product to start tracking performance</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
