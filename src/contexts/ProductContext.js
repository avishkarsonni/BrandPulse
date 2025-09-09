import React, { createContext, useContext, useState } from 'react';

const ProductContext = createContext();

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productData, setProductData] = useState(null);

  const updateProduct = (product, data = null) => {
    setSelectedProduct(product);
    setProductData(data);
  };

  const clearProduct = () => {
    setSelectedProduct(null);
    setProductData(null);
  };

  const value = {
    selectedProduct,
    productData,
    updateProduct,
    clearProduct,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};
