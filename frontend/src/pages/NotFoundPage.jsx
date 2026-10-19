import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-16 px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 rounded-3xl bg-primary-100 text-primary-600 flex items-center justify-center mx-auto shadow-md">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <p className="text-6xl font-black text-slate-900 font-heading">404</p>
          <h1 className="text-2xl font-bold text-slate-800">Page Not Found</h1>
          <p className="text-sm text-slate-500">
            The page you are looking for does not exist in Indian Bazar or has been relocated.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Link to="/">
            <Button icon={Home}>
              Return to Store
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
