import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts.js';
import { useCategories } from '../../hooks/useCategories.js';
import { ProductGrid } from '../../components/home/ProductGrid.jsx';

export const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const currentParams = useMemo(() => {
    const p = { limit: 12 };
    if (searchParams.get("search")) p.search = searchParams.get("search");
    if (searchParams.get("category")) p.category = searchParams.get("category");
    if (searchParams.get("minPrice")) p.minPrice = searchParams.get("minPrice");
    if (searchParams.get("maxPrice")) p.maxPrice = searchParams.get("maxPrice");
    if (searchParams.get("sort")) p.sort = searchParams.get("sort") || "newest";
    if (searchParams.get("page")) p.page = searchParams.get("page");
    return p;
  }, [searchParams]);

  const { products, meta, loading, error, setParams, refetch } = useProducts(currentParams);
  const { categories, loading: categoriesLoading } = useCategories();

  useEffect(() => {
    setParams(currentParams);
  }, [JSON.stringify(currentParams)]);

  const [searchInput, setSearchInput] = useState(currentParams.search || '');
  const [minPriceInput, setMinPriceInput] = useState(currentParams.minPrice || '');
  const [maxPriceInput, setMaxPriceInput] = useState(currentParams.maxPrice || '');

  useEffect(() => {
    setSearchInput(currentParams.search || '');
    setMinPriceInput(currentParams.minPrice || '');
    setMaxPriceInput(currentParams.maxPrice || '');
  }, [currentParams.search, currentParams.minPrice, currentParams.maxPrice]);

  const updateFilters = (newFilters) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    
    if (newFilters.page === undefined && !newFilters.preservePage) {
      newParams.delete('page');
    } else if (newFilters.preservePage) {
      newParams.delete('preservePage');
    }
    
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    updateFilters({ search: searchInput });
  };

  const clearSearch = () => {
    setSearchInput('');
    updateFilters({ search: '' });
  };

  const handlePriceSubmit = (e) => {
    e.preventDefault();
    const min = parseFloat(minPriceInput);
    const max = parseFloat(maxPriceInput);
    
    if (min < 0 || max < 0) return;
    if (!isNaN(min) && !isNaN(max) && min > max) return;
    
    updateFilters({ 
      minPrice: !isNaN(min) ? min : '', 
      maxPrice: !isNaN(max) ? max : '' 
    });
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage) => {
    updateFilters({ page: newPage, preservePage: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeFilterCount = Array.from(searchParams.keys()).filter(k => k !== 'page' && k !== 'sort' && k !== 'limit').length;

  const FilterContent = () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Search</h3>
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          {searchInput && (
            <button type="button" onClick={clearSearch} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          )}
        </form>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
        {categoriesLoading ? (
          <div className="space-y-2">
            {[1,2,3,4].map(i => <div key={i} className="h-6 bg-gray-200 rounded animate-pulse"></div>)}
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            <button
              onClick={() => updateFilters({ category: '' })}
              className={`block w-full text-left px-2 py-1.5 rounded-md text-sm ${!currentParams.category ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => updateFilters({ category: cat._id })}
                className={`block w-full text-left px-2 py-1.5 rounded-md text-sm ${currentParams.category === cat._id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Price Range</h3>
        <form onSubmit={handlePriceSubmit} className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              placeholder="Min"
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              min="0"
              placeholder="Max"
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <button type="submit" className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors text-sm">
            Apply Price Filter
          </button>
        </form>
      </div>

      {activeFilterCount > 0 && (
        <button onClick={clearFilters} className="w-full py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors text-sm">
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Shop Products</h1>
          <p className="mt-2 text-gray-500">Discover our collection of premium items.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <FilterContent />
        </aside>

        {/* Mobile Filter Toggle */}
        <div className="md:hidden flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <button 
            onClick={() => setIsMobileFiltersOpen(true)}
            className="flex items-center gap-2 font-medium text-gray-700 hover:text-blue-600 transition-colors"
          >
            <Filter className="w-5 h-5" />
            Filters {activeFilterCount > 0 && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{activeFilterCount}</span>}
          </button>
          
          <select 
            value={currentParams.sort || "newest"}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className="border-none bg-transparent text-gray-700 font-medium focus:outline-none focus:ring-0 text-sm cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="best-selling">Best Selling</option>
          </select>
        </div>

        {/* Mobile Filter Drawer */}
        <AnimatePresence>
          {isMobileFiltersOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={() => setIsMobileFiltersOpen(false)}
              />
              <motion.div 
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-xl z-50 overflow-y-auto"
              >
                <div className="p-4 flex items-center justify-between border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                  <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4">
                  <FilterContent />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1">
          <div className="hidden md:flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <span className="text-gray-600 text-sm">
              {meta ? `Showing ${(meta.page - 1) * meta.limit + 1}-${Math.min(meta.page * meta.limit, meta.totalProducts)} of ${meta.totalProducts} results` : 'Loading...'}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select 
                value={currentParams.sort || "newest"}
                onChange={(e) => updateFilters({ sort: e.target.value })}
                className="border border-gray-300 text-gray-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer bg-white"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="best-selling">Best Selling</option>
              </select>
            </div>
          </div>

          <div className="-mx-4 sm:mx-0">
             <ProductGrid 
              title="" 
              products={products} 
              loading={loading}
              error={error}
              onRetry={refetch}
              showMore={false} 
              emptyTitle="No products found"
              emptyMessage="Try changing your search or filters."
              emptyAction={
                <button onClick={clearFilters} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Clear Filters
                </button>
              }
            />
          </div>

          {/* Pagination */}
          {!loading && !error && meta && meta.totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2">
              <button
                onClick={() => handlePageChange(meta.page - 1)}
                disabled={meta.page === 1}
                className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(meta.totalPages)].map((_, i) => {
                  const pageNumber = i + 1;
                  // Show current, first, last, and pages adjacent to current
                  if (
                    pageNumber === 1 || 
                    pageNumber === meta.totalPages ||
                    (pageNumber >= meta.page - 1 && pageNumber <= meta.page + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                          meta.page === pageNumber 
                            ? 'bg-blue-600 text-white' 
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === meta.page - 2 || 
                    pageNumber === meta.page + 2
                  ) {
                    return <span key={pageNumber} className="text-gray-400 px-1">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => handlePageChange(meta.page + 1)}
                disabled={meta.page === meta.totalPages}
                className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
