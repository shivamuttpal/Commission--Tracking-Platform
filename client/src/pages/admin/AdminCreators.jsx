import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { getAdminCreators } from '../../utils/api';

export default function AdminCreators() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminCreators()
      .then((data) => setCreators(data.creators))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="page-header">
        <h2>Creators</h2>
        <p>All registered creators on the platform</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Creators ({creators.length})</h3>
        </div>
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : creators.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Conversions</th>
                  <th>Total Earnings</th>
                  <th>Available</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {creators.map((creator) => (
                  <tr key={creator._id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{creator.name}</td>
                    <td>{creator.email}</td>
                    <td>{creator.conversions}</td>
                    <td style={{ color: 'var(--success)' }}>₹{(creator.totalEarnings || 0).toLocaleString()}</td>
                    <td>₹{(creator.availableBalance || 0).toLocaleString()}</td>
                    <td>{new Date(creator.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">👤</div>
            <h3>No creators yet</h3>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
