import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { ProductCard } from '../../components/customer/ProductCard';
import {
  Star,
  MapPin,
  ShieldCheck,
  Truck,
  RotateCcw,
  ShoppingBag,
  Heart,
  Plus,
  Minus,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  MessageSquarePlus,
} from 'lucide-react';

export const ProductDetailPage = () => {
  const { slug } = useParams();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeImage, setActiveImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const loadProductData = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await productService.getProductBySlug(slug);
        setProduct(data);
        if (data.images && data.images.length > 0) {
          const primary = data.images.find((img) => img.is_primary) || data.images[0];
          setActiveImage(primary.url);
        }

        // Fetch related products
        const related = await productService.getRelatedProducts(slug);
        setRelatedProducts(related);
      } catch (err) {
        console.error('Failed to load product details:', err);
        setError('Product not found or unavailable.');
      } finally {
        setLoading(false);
      }
    };

    loadProductData();
    window.scrollTo(0, 0);
  }, [slug]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewMsg({ type: '', text: '' });

    try {
      await productService.submitReview(slug, {
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });

      setReviewMsg({ type: 'success', text: 'Thank you! Your review has been published.' });
      setReviewTitle('');
      setReviewComment('');

      // Reload product to update reviews list and average rating
      const updated = await productService.getProductBySlug(slug);
      setProduct(updated);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Failed to submit review. You may have already reviewed this item.';
      setReviewMsg({ type: 'error', text: msg });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 font-medium text-sm">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-slate-500 text-sm">The product you are looking for may have been removed or updated.</p>
        <Link to="/shop">
          <Button size="sm">Browse All Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to="/shop" className="hover:text-primary-600">Shop</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to={`/shop?category=${product.category?.slug}`} className="hover:text-primary-600 font-medium">
          {product.category?.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-semibold truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Gallery Column */}
        <div className="lg:col-span-6 space-y-4">
          <div className="h-[460px] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-card relative">
            <img
              src={activeImage || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80'}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {product.discount_percentage > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-black bg-red-600 text-white shadow-md">
                -{product.discount_percentage}% OFF
              </span>
            )}
            {product.origin_region && (
              <span className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 shadow-md">
                <MapPin className="w-3.5 h-3.5 text-amber-400" /> Origin: {product.origin_region}
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.url)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    activeImage === img.url ? 'border-primary-600 ring-2 ring-primary-500/20' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.alt_text || product.title} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Actions Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">
                {product.category?.name}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-400 font-mono">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading leading-tight">
              {product.title}
            </h1>

            {/* Ratings Summary */}
            <div className="flex items-center gap-2 text-sm pt-1">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(product.average_rating) ? 'fill-amber-500' : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-slate-900">{product.average_rating}</span>
              <span className="text-slate-400">({product.reviews_count} customer reviews)</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="font-heading font-black text-3xl sm:text-4xl text-slate-900">
                {formatCurrency(product.effective_price)}
              </span>
              {product.discount_price && (
                <span className="text-base text-slate-400 line-through font-medium">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Inclusive of all taxes • Package unit: <strong className="text-slate-700">{product.unit}</strong>
            </p>
          </div>

          {/* Stock Status & Quantity Selector */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold">
              {product.is_in_stock ? (
                <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  In Stock ({product.stock_quantity} available)
                </span>
              ) : (
                <span className="text-red-700 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                  Currently Out of Stock
                </span>
              )}
            </div>

            {product.is_in_stock && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-600 uppercase">Quantity:</span>
                <div className="flex items-center border border-slate-300 rounded-xl bg-white shadow-sm overflow-hidden">
                  <button
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2.5 hover:bg-slate-100 disabled:opacity-40"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold">{quantity}</span>
                  <button
                    disabled={quantity >= product.stock_quantity}
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    className="p-2.5 hover:bg-slate-100 disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Button
              disabled={!product.is_in_stock}
              size="lg"
              className="flex-1 shadow-lg shadow-primary-500/20"
              icon={ShoppingBag}
            >
              Add to Bag
            </Button>
            <Button variant="outline" size="lg" className="flex items-center justify-center gap-2">
              <Heart className="w-4 h-4" /> Save to Wishlist
            </Button>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 text-center">
            <div className="p-3 rounded-2xl bg-white border border-slate-200/80 space-y-1">
              <ShieldCheck className="w-5 h-5 text-primary-600 mx-auto" />
              <p className="text-[11px] font-bold text-slate-800">100% Genuine</p>
              <p className="text-[10px] text-slate-400">Authentic craft</p>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-slate-200/80 space-y-1">
              <Truck className="w-5 h-5 text-primary-600 mx-auto" />
              <p className="text-[11px] font-bold text-slate-800">Fast Shipping</p>
              <p className="text-[10px] text-slate-400">All India delivery</p>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-slate-200/80 space-y-1">
              <RotateCcw className="w-5 h-5 text-primary-600 mx-auto" />
              <p className="text-[11px] font-bold text-slate-800">Easy Returns</p>
              <p className="text-[10px] text-slate-400">7-Day policy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Heritage Story */}
      <section className="bg-white rounded-3xl p-8 sm:p-10 shadow-card border border-slate-200/80 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 font-heading border-b border-slate-100 pb-4">
          Product Details & Heritage Story
        </h2>
        <div className="prose prose-slate max-w-none text-sm text-slate-600 leading-relaxed space-y-3">
          <p>{product.description}</p>
          {product.origin_region && (
            <div className="mt-4 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-amber-900 text-xs">
              <strong>Region of Origin:</strong> {product.origin_region}. Crafted in accordance with traditional regional techniques passed down through generations.
            </div>
          )}
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="bg-white rounded-3xl p-8 sm:p-10 shadow-card border border-slate-200/80 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-heading">
              Customer Reviews ({product.reviews_count})
            </h2>
            <p className="text-xs text-slate-500">Verified buyer ratings from across India</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black font-heading text-slate-900">{product.average_rating}</span>
            <div className="flex flex-col">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                ))}
              </div>
              <span className="text-[10px] text-slate-400">Out of 5 stars</span>
            </div>
          </div>
        </div>

        {/* Write Review Form */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 space-y-4">
          <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
            <MessageSquarePlus className="w-4 h-4 text-primary-600" /> Share Your Experience
          </h3>

          {!isAuthenticated ? (
            <p className="text-xs text-slate-600">
              Please{' '}
              <Link to="/login" className="text-primary-600 font-bold hover:underline">
                log in
              </Link>{' '}
              with your customer account to leave a verified rating and review.
            </p>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              {reviewMsg.text && (
                <div className={`p-3 rounded-xl text-xs font-semibold ${
                  reviewMsg.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {reviewMsg.text}
                </div>
              )}

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700">Your Rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 focus:outline-none"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                required
                placeholder="Review Headline (e.g. Authentic quality and fast delivery!)"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />

              <textarea
                required
                rows={3}
                placeholder="Tell us more about the packaging, taste, material, or overall experience..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />

              <Button type="submit" size="sm" loading={submittingReview}>
                Submit Review
              </Button>
            </form>
          )}
        </div>

        {/* Existing Reviews List */}
        <div className="space-y-4">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-2xl bg-white border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center text-xs font-bold">
                      {rev.customer_name?.charAt(0) || 'C'}
                    </div>
                    <span className="text-xs font-bold text-slate-800">{rev.customer_name}</span>
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                      Verified Buyer
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(rev.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <div className="flex text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>

                <h4 className="text-sm font-bold text-slate-900">{rev.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">No reviews submitted yet. Be the first to review!</p>
          )}
        </div>
      </section>

      {/* Related Products Carousel / Grid */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
            More from {product.category?.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
