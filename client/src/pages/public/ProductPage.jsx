import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { getProduct, trackClick, simulatePurchase } from '../../utils/api';

export default function ProductPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [commission, setCommission] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    getProduct(id)
      .then((data) => setProduct(data.product))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Track click when page loads with ref
  useEffect(() => {
    if (ref && id) {
      trackClick(id, ref).catch(() => {});
    }
  }, [id, ref]);

  const handlePurchase = async () => {
    setPurchasing(true);
    setError('');
    try {
      const data = await simulatePurchase(id, ref);
      setPurchased(true);
      setCommission(data.commission || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="product-page">
        <div className="loading" style={{ minHeight: '100vh' }}><div className="spinner"></div></div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="product-page">
        <div className="product-page-nav">
          <h1>PopCom</h1>
          <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
        </div>
        <div className="product-detail">
          <div className="empty-state">
            <div className="empty-icon">😕</div>
            <h3>Product not found</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-page">
      <div className="product-page-nav">
        <h1>PopCom</h1>
        <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
      </div>

      <div className="product-detail">
        <div className="product-card-big">
          <div className="brand-name">by {product.brand?.name}</div>
          <h2>{product.name}</h2>
          <div className="product-price">₹{product.price?.toLocaleString()}</div>

          {product.description && (
            <div className="product-desc">{product.description}</div>
          )}

          {!purchased ? (
            <>
              {error && <div className="alert alert-error" style={{ textAlign: 'left' }}>⚠️ {error}</div>}
              <button
                className="btn btn-primary buy-btn"
                onClick={handlePurchase}
                disabled={purchasing}
              >
                {purchasing ? 'Processing...' : '🛒 Buy Now'}
              </button>
            </>
          ) : (
            <div className="purchase-success">
              <div className="check-icon">✅</div>
              <h3>Purchase Successful!</h3>
              <p>Thank you for your purchase of {product.name}</p>
              {commission > 0 && (
                <p style={{ marginTop: 8, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Creator earned ₹{commission.toLocaleString()} commission
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
