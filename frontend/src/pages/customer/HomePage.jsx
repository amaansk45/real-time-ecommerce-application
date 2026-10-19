import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Star,
  CheckCircle2,
  Flame,
  Truck,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { Button } from '../../components/common/Button';

export const HomePage = () => {
  const categories = [
    {
      title: 'Ethnic & Festive Wear',
      subtitle: 'Kurtas, Sarees & Lehengas',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
      badge: 'Festive Offer',
      slug: 'ethnic-wear',
    },
    {
      title: 'Handground Spices & Herbs',
      subtitle: 'Pure Kashmiri Saffron & Malabar Pepper',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
      badge: '100% Organic',
      slug: 'spices',
    },
    {
      title: 'Artisan Handicrafts',
      subtitle: 'Brass Idols, Pottery & Wood Carvings',
      image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
      badge: 'Handmade',
      slug: 'handicrafts',
    },
    {
      title: 'Premium Dry Fruits',
      subtitle: 'Mamra Almonds, Pistachios & Cashews',
      image: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=600&q=80',
      badge: 'Best Seller',
      slug: 'dry-fruits',
    },
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/60 via-amber-50/30 to-white pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-gradient-to-br from-primary-300/30 to-accent-300/20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-gradient-to-tr from-secondary-300/20 to-primary-300/20 blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 border border-primary-200/80 text-primary-800 text-xs font-bold uppercase tracking-wider shadow-sm">
                <Sparkles className="w-4 h-4 text-primary-600 animate-pulse" />
                The Authentic Indian Market
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight font-heading leading-tight">
                Authentic Flavors, <br />
                <span className="text-gradient-primary">Royal Attire</span> & Crafts
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Experience the soulful heritage of India delivered straight to your doorstep. From handwoven Banarasi weaves to single-origin organic spices and royal dry fruits.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link to="/shop">
                  <Button size="lg" className="rounded-full shadow-lg shadow-primary-500/25">
                    Explore Bazaar <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/shop?sort=trending">
                  <Button variant="outline" size="lg" className="rounded-full">
                    <Flame className="w-4 h-4 text-primary-600 mr-2" /> Trending Today
                  </Button>
                </Link>
              </div>

              {/* Highlights */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0 text-left">
                <div>
                  <p className="font-heading font-black text-2xl text-slate-900">100%</p>
                  <p className="text-xs text-slate-500 font-medium">Pure & Authentic</p>
                </div>
                <div>
                  <p className="font-heading font-black text-2xl text-slate-900">₹999+</p>
                  <p className="text-xs text-slate-500 font-medium">Free Pan-India Shipping</p>
                </div>
                <div>
                  <p className="font-heading font-black text-2xl text-slate-900">4.9 ★</p>
                  <p className="text-xs text-slate-500 font-medium">Customer Ratings</p>
                </div>
              </div>
            </div>

            {/* Right Hero Graphic Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                <img
                  src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80"
                  alt="Indian Ethnic Traditional Crafts"
                  className="w-full h-[440px] object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="inline-block px-3 py-1 rounded-md bg-amber-500 text-slate-900 text-xs font-bold w-fit mb-2">
                    Handpicked Festive Collection
                  </span>
                  <h3 className="text-xl font-bold font-heading">Royal Heritage Essentials</h3>
                  <p className="text-xs text-slate-200 mt-1">Exclusive handcrafted treasures sourced across India</p>
                </div>
              </div>

              {/* Floating review card */}
              <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-100 flex items-center gap-3 max-w-xs">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center text-amber-500 text-xs gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">Verified Indian Heritage</p>
                  <p className="text-[10px] text-slate-500">Over 50,000+ satisfied customers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-primary-600 text-xs font-bold uppercase tracking-wider">
              <Tag className="w-3.5 h-3.5" /> Curated Collections
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight mt-1">
              Shop by Popular Categories
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 group"
          >
            View All Categories <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              to={`/shop?category=${cat.slug}`}
              className="group relative rounded-3xl overflow-hidden shadow-card hover:shadow-premium transition-all duration-300 bg-white border border-slate-200/80 flex flex-col"
            >
              <div className="h-56 overflow-hidden relative">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur-md text-slate-900 shadow-sm">
                  {cat.badge}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 group-hover:text-primary-600 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{cat.subtitle}</p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-primary-600">
                  <span>Browse Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
