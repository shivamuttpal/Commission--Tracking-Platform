import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { getProducts, createProduct, deleteProduct } from '../../utils/api';

export default function BrandProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', commissionPercent: '', description: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchProducts = () => {
    getProducts()
      .then((data) => setProducts(data.products))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createProduct({
        name: form.name,
        price: Number(form.price),
        commissionPercent: Number(form.commissionPercent),
        description: form.description,
      });
      setSuccess('Product created successfully!');
      setForm({ name: '', price: '', commissionPercent: '', description: '' });
      setShowForm(false);
      fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to deactivate this product?')) return;
    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h2>Product Management</h2>
        <p>Add and manage your products for creators to promote</p>
      </div>

      {success && <div className="alert alert-success">✅ {success}</div>}
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div style={{ marginBottom: 20 }}>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16 }}>Add New Product</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Product Name</label>
              <input className="form-input" placeholder="e.g. Premium Sneakers" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>Price (₹)</label>
                <input type="number" className="form-input" placeholder="999" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required min="0" />
              </div>
              <div className="form-group">
                <label>Commission (%)</label>
                <input type="number" className="form-input" placeholder="10" value={form.commissionPercent} onChange={(e) => setForm({ ...form, commissionPercent: e.target.value })} required min="0" max="100" />
              </div>
            </div>
            <div className="form-group">
              <label>Description (optional)</label>
              <textarea className="form-input" placeholder="Brief product description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-success">Create Product</button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3>Your Products ({products.length})</h3>
        </div>
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : products.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Commission</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{product.name}</td>
                    <td>₹{product.price.toLocaleString()}</td>
                    <td>{product.commissionPercent}%</td>
                    <td><span className={`badge ${product.isActive ? 'badge-approved' : 'badge-rejected'}`}>{product.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(product._id)}>Deactivate</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No products yet</h3>
            <p>Click "Add Product" to create your first product</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
