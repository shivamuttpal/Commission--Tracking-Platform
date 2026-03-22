import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { getAdminBrands } from '../../utils/api';

export default function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminBrands()
      .then((data) => setBrands(data.brands))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="page-header">
        <h2>Brands</h2>
        <p>All registered brands on the platform</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Brands ({brands.length})</h3>
        </div>
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : brands.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Products</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((brand) => (
                  <tr key={brand._id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{brand.name}</td>
                    <td>{brand.email}</td>
                    <td>{brand.productCount}</td>
                    <td>{new Date(brand.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🏢</div>
            <h3>No brands yet</h3>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
