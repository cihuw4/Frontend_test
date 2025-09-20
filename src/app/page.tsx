"use client";

import React, { useEffect, useMemo, useState } from "react";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number; 
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function Home() { 
  const [products, setProducts] = useState<Product[] | null>(null);

  // loading
  useEffect(() => {
    setProducts(null);
    const t = setTimeout(() => {
      const raw = localStorage.getItem("products_v1");
      setProducts(raw ? JSON.parse(raw) : []);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  // localStorage
  useEffect(() => {
    if (products !== null) {
      localStorage.setItem("products_v1", JSON.stringify(products));
    }
  }, [products]);

  const addDummy = () => {
    const newP: Product = {
      id: uid(),
      name: "Produk " + (products?.length || 0 + 1),
      price: Math.floor(Math.random() * 100000),
      stock: Math.floor(Math.random() * 50),
    };
    setProducts((prev) => (prev ? [newP, ...prev] : [newP]));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Frontend Product</h1>
        <button
          onClick={addDummy}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Tambah Produk
        </button>
      </header>

      {/* Loading */}
      {products === null && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-4 border rounded animate-pulse space-y-2"
            >
              <div className="h-4 bg-gray-300 rounded w-3/4" />
              <div className="h-3 bg-gray-300 rounded w-1/2" />
              <div className="h-3 bg-gray-300 rounded w-1/3" />
            </div>
          ))}
        </div>
      )}

      {/* empty state */}
      {products !== null && products.length === 0 && (
        <div className="text-center py-12">
          <p className="mb-4">Belum ada produk.</p>
          <button
            onClick={addDummy}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Tambah produk pertama
          </button>
        </div>
      )}

      {/* produk */}
      {products !== null && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="p-4 border rounded">
              <h2 className="font-medium text-lg">{p.name}</h2>
              <p className="text-sm text-gray-600">
                Harga: Rp {p.price.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Stok: {p.stock}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
