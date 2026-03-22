import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { getApplications, updateApplication } from '../../utils/api';

export default function BrandApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchApplications = () => {
    getApplications()
      .then((data) => setApplications(data.applications))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchApplications(); }, []);

  const handleUpdate = async (id, status) => {
    try {
      await updateApplication(id, status);
      fetchApplications();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h2>Creator Applications</h2>
        <p>Review and manage creator applications for your products</p>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="card">
        <div className="card-header">
          <h3>Applications ({applications.length})</h3>
        </div>
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : applications.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Creator</th>
                  <th>Email</th>
                  <th>Product</th>
                  <th>Status</th>
                  <th>Applied On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{app.creator?.name}</td>
                    <td>{app.creator?.email}</td>
                    <td>{app.product?.name}</td>
                    <td><span className={`badge badge-${app.status}`}>{app.status}</span></td>
                    <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td>
                      {app.status === 'pending' && (
                        <div className="btn-group">
                          <button className="btn btn-success btn-sm" onClick={() => handleUpdate(app._id, 'approved')}>✓ Approve</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleUpdate(app._id, 'rejected')}>✕ Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No applications yet</h3>
            <p>Creators will appear here once they apply to your products</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
