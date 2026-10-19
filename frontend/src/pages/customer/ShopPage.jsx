import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Filter, ArrowRight } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const ShopPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-heading">
            Indian Bazar Catalog
          </h1>
          <p className="text-sm text-slate-500">
            Browse authentic spices, ethnic fashion, handicrafts, and dry fruits.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={Filter}>
            Filters & Sorting
          </Button>
        </div>
      </div>

      {/* Catalog placeholder ready for Step 5 models & API integration */}
      <div className="bg-white rounded-3xl p-12 text-center shadow-card border border-slate-200/80 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 font-heading">
          Product Catalog & Real-Time Filtering Architecture
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          The catalog UI and backend models (Category, Subcategory, Product, Reviews, and Multi-Facet Filters) will be activated in <strong>Step 5</strong>!
        </p>
        <Link to="/">
          <Button size="sm">
            Back to Home <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
