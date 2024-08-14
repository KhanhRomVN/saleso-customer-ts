import ProductGrid from "@/components/ProductGrid";
import { BACKEND_URI } from "@/api";

const FlashsaleAPI = `${BACKEND_URI}/product/flash-sale`;

function HomePage() {
  return (
    <div>
      <ProductGrid title="Flashsale" api={FlashsaleAPI} grid="1x4" />
    </div>
  );
}

export default HomePage;
