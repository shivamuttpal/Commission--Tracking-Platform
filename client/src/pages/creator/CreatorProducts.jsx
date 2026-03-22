import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { getAllProducts, applyToProduct, getApplications } from '../../utils/api';

export default function CreatorProducts() {
  const [products, setProducts] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getAllProducts(), getApplications()])
      .then(([prodData, appData]) => {
        setProducts(prodData.products);
        setApplications(appData.applications);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getApplicationStatus = (productId) => {
    const app = applications.find((a) => a.product?._id === productId);
    return app ? app.status : null;
  };

  const handleApply = async (productId) => {
    try {
      setError('');
      await applyToProduct(productId);
      setSuccess('Application submitted!');
      const appData = await getApplications();
      setApplications(appData.applications);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h2>Browse Products</h2>
        <p>Discover products to promote and earn commissions</p>
      </div>

      {success && <div className="alert alert-success">✅ {success}</div>}
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="card">
        <div className="card-header">
          <h3>Available Products ({products.length})</h3>
        </div>
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : products.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Brand</th>
                  <th>Price</th>
                  <th>Commission</th>
                  <th>Earn Per Sale</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const status = getApplicationStatus(product._id);
                  const earnPerSale = (product.price * product.commissionPercent / 100).toFixed(2);
                  return (
                    <tr key={product._id}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{product.name}</td>
                      <td>{product.brand?.name}</td>
                      <td>₹{product.price.toLocaleString()}</td>
                      <td>{product.commissionPercent}%</td>
                      <td style={{ color: 'var(--success)' }}>₹{earnPerSale}</td>
                      <td>
                        {status ? (
                          <span className={`badge badge-${status}`}>{status}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Not applied</span>
                        )}
                      </td>
                      <td>
                        {!status && (
                          <button className="btn btn-primary btn-sm" onClick={() => handleApply(product._id)}>Apply</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🛍️</div>
            <h3>No products available</h3>
            <p>Products will appear here once brands add them</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
