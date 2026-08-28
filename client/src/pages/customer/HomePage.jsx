import { Hero } from "../../components/home/Hero.jsx";
import { PromoCards } from "../../components/home/PromoCards.jsx";
import { CategoryStrip } from "../../components/home/CategoryStrip.jsx";
import { ProductGrid } from "../../components/home/ProductGrid.jsx";
import { Specifications } from "../../components/home/Specifications.jsx";
import { Newsletter } from "../../components/home/Newsletter.jsx";
import { useProducts } from "../../hooks/useProducts.js";

export const HomePage = () => {
  const { 
    products: latestProducts, 
    loading: latestLoading, 
    error: latestError, 
    refetch: refetchLatest 
  } = useProducts({ limit: 4, sort: 'newest' });

  const { 
    products: bestSellingProducts, 
    loading: bestLoading, 
    error: bestError, 
    refetch: refetchBest 
  } = useProducts({ limit: 8, sort: 'best-selling' });

  return (
    <div>
      <Hero />
      <PromoCards />
      <CategoryStrip />
      <ProductGrid 
        title="Latest Products" 
        products={latestProducts} 
        loading={latestLoading}
        error={latestError}
        onRetry={refetchLatest}
        showMore={true} 
      />
      <ProductGrid 
        title="Best Selling" 
        products={bestSellingProducts} 
        loading={bestLoading}
        error={bestError}
        onRetry={refetchBest}
        showMore={true} 
      />
      <Specifications />
      <Newsletter />
    </div>
  );
};
