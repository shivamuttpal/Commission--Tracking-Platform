import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { getReferralLinks, getApplications, generateReferralLink } from '../../utils/api';

export default function CreatorLinks() {
  const [links, setLinks] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState('');

  useEffect(() => {
    Promise.all([getReferralLinks(), getApplications()])
      .then(([linksData, appData]) => {
        setLinks(linksData.referralLinks || []);
        setApplications(appData.applications);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const approvedWithoutLinks = applications.filter(
    (app) => app.status === 'approved' && !links.find((l) => l.product?._id === app.product?._id)
  );

  const handleGenerate = async (productId) => {
    try {
      setError('');
      await generateReferralLink(productId);
      const data = await getReferralLinks();
      setLinks(data.referralLinks || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const getReferralUrl = (link) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/product/${link.product?._id}?ref=${link.creator}`;
  };

  const copyToClipboard = (link) => {
    navigator.clipboard.writeText(getReferralUrl(link));
    setCopiedId(link._id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h2>Referral Links</h2>
        <p>Generate and manage your affiliate referral links</p>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {approvedWithoutLinks.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <h3>🎉 Generate Links for Approved Products</h3>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Commission</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {approvedWithoutLinks.map((app) => (
                  <tr key={app._id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{app.product?.name}</td>
                    <td>{app.product?.commissionPercent}%</td>
                    <td>
                      <button className="btn btn-success btn-sm" onClick={() => handleGenerate(app.product?._id)}>
                        🔗 Generate Link
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3>Your Links ({links.length})</h3>
        </div>
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : links.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Referral Link</th>
                  <th>Clicks</th>
                  <th>Conversions</th>
                  <th>Earnings</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <tr key={link._id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{link.product?.name}</td>
                    <td>
                      <div className="referral-link-box">
                        <input readOnly value={getReferralUrl(link)} />
                        <button className="btn btn-outline copy-btn" onClick={() => copyToClipboard(link)}>
                          {copiedId === link._id ? '✓' : '📋'}
                        </button>
                      </div>
                    </td>
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
            <h3>No referral links</h3>
            <p>Apply to products, get approved, then generate your referral links here</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
