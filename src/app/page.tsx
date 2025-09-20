"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";

type Product = { id: string; name: string; price: number; stock: number; image?: string };
type SortOption = "" | "price_asc" | "price_desc" | "stock_asc" | "stock_desc";

const uid = () => Math.random().toString(36).slice(2, 9);

const defaultProducts: Product[] = [
  { id: uid(), name: "Produk 1", price: 50000, stock: 10, image: "/img/imgdummy.jpg" },
  { id: uid(), name: "Produk 2", price: 75000, stock: 5, image: "/img/imgdummy.jpg" },
  { id: uid(), name: "Produk 3", price: 120000, stock: 8, image: "/img/imgdummy.jpg" },
  { id: uid(), name: "Produk 4", price: 95000, stock: 15, image: "/img/imgdummy.jpg" },
];

// modal
function ProductFormModal({
  open,
  onClose,
  onSubmit,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (p: Product) => void;
  editing?: Product | null;
}) {
  const [form, setForm] = useState({ name: "", price: "0", stock: "0" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (editing) setForm({ name: editing.name, price: String(editing.price), stock: String(editing.stock) });
    else setForm({ name: "", price: "0", stock: "0" });
  }, [editing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(form.price), stock = Number(form.stock);
    if (!form.name.trim()) return setError("Nama produk wajib diisi.");
    if (isNaN(price)) return setError("Harga harus angka.");
    if (isNaN(stock)) return setError("Stok harus angka.");
    if (price < 0) return setError("Harga harus positif.");
    if (!Number.isInteger(stock) || stock < 0) return setError("Stok harus bilangan bulat.");
    onSubmit({ id: editing?.id ?? uid(), name: form.name.trim(), price, stock, image: editing?.image ?? "/img/imgdummy.jpg" });
    onClose();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-md bg-white rounded shadow-lg p-5">
        <h3 className="text-lg font-semibold mb-3">{editing ? "Edit Produk" : "Tambah Produk"}</h3>
        {error && <div className="mb-2 text-sm text-red-600">{error}</div>}
        {["Nama", "Harga", "Stok"].map((label, i) => (
          <label key={label} className="block mb-2">
            <div className="text-sm mb-1">{label}</div>
            <input
              type={i === 0 ? "text" : "number"}
              min={0}
              step={i === 2 ? 1 : undefined}
              value={Object.values(form)[i]}
              onChange={(e) => setForm({ ...form, [Object.keys(form)[i]]: e.target.value })}
              className="w-full border px-3 py-2 rounded"
              autoFocus={i === 0}
            />
          </label>
        ))}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-2 rounded border">Batal</button>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            {editing ? "Simpan Perubahan" : "Tambah"}
          </button>
        </div>
      </form>
    </div>
  );
}

function DeleteModal({ open, onClose, onDelete, product }: { open: boolean; onClose: () => void; onDelete: () => void; product: Product | null }) {
  if (!open || !product) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-white rounded shadow-lg p-5">
        <h3 className="text-lg font-semibold mb-2">Konfirmasi Hapus</h3>
        <p className="mb-4 text-sm text-gray-700">Ingin menghapus <strong>{product.name}</strong> ?</p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded border">Batal</button>
          <button onClick={onDelete} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">Hapus</button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [delModal, setDelModal] = useState(false);
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [search, setSearch] = useState(""), [debounced, setDebounced] = useState("");
  const [sort, setSort] = useState<SortOption>("");

  useEffect(() => { const t = setTimeout(() => setDebounced(search), 300); return () => clearTimeout(t); }, [search]);

  useEffect(() => {
    const raw = localStorage.getItem("products_v1");
    setProducts(raw ? JSON.parse(raw) : defaultProducts);
  }, []);
  useEffect(() => { if (products) localStorage.setItem("products_v1", JSON.stringify(products)); }, [products]);

  const displayed = useMemo(() => {
    if (!products) return [];
    let list = products.filter((p) => p.name.toLowerCase().includes(debounced.toLowerCase()));
    const sorters: Record<SortOption, (a: Product, b: Product) => number> = {
      "": () => 0,
      price_asc: (a, b) => a.price - b.price,
      price_desc: (a, b) => b.price - a.price,
      stock_asc: (a, b) => a.stock - b.stock,
      stock_desc: (a, b) => b.stock - a.stock,
    };
    return list.sort(sorters[sort]);
  }, [products, debounced, sort]);

  // API states
  const [abilities, setAbilities] = useState<any[]>([]);
  const [battleArmorEffects, setBattleArmorEffects] = useState<string[]>([]);

  useEffect(() => {
    async function fetchAbilities() {
      const res = await fetch("https://pokeapi.co/api/v2/ability?limit=10");
      const data = await res.json();
      setAbilities(data.results);
    }
    async function fetchBattleArmor() {
      const res = await fetch("https://pokeapi.co/api/v2/ability/battle-armor");
      const data = await res.json();
      setBattleArmorEffects(data.effect_entries.map((e: any) => e.effect));
    }
    fetchAbilities();
    fetchBattleArmor();
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold">Frontend Product</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="flex gap-2 items-center w-full sm:w-auto">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari produk" className="w-full sm:w-64 px-3 py-2 border rounded" />
            <select value={sort} onChange={(e) => setSort(e.target.value as SortOption)} className="px-3 py-2 border rounded">
              <option value="">Urutkan</option>
              <option value="price_asc">Harga Tertinggi</option>
              <option value="price_desc">Harga Terendah</option>
              <option value="stock_asc">Stok Terbanyak</option>
              <option value="stock_desc">Stok Sedikit</option>
            </select>
          </div>
          <div className="ml-auto flex gap-2">
            <button onClick={() => { setEditing(null); setFormOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded">Tambah Produk</button>
            <button onClick={() => { localStorage.removeItem("products_v1"); setProducts(defaultProducts); }} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded">Reset Produk</button>
          </div>
        </div>
      </header>

      {/* states */}
      {!products && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 border rounded animate-pulse space-y-3"><div className="h-40 bg-gray-300 rounded" /><div className="h-4 bg-gray-300 rounded w-3/4" /><div className="h-3 bg-gray-300 rounded w-1/2" /><div className="h-3 bg-gray-300 rounded w-1/3" /></div>
      ))}</div>}

      {products?.length === 0 && <div className="text-center py-12">
        <p className="mb-4 text-gray-700">Belum ada produk.</p>
        <button onClick={() => setFormOpen(true)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Tambah Produk Pertama</button>
      </div>}

      {products && products.length > 0 && (
        displayed.length === 0 ? <div className="text-center py-8 text-gray-600">Tidak ada hasil pencarian.</div> :
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayed.map((p) => (
              <article key={p.id} className="border rounded shadow-sm hover:shadow-md transition p-4 flex flex-col bg-white">
                <div className="w-full h-40 relative mb-3 bg-gray-50 rounded overflow-hidden">
                  <Image src={p.image ?? "/img/imgdummy.jpg"} alt={p.name} fill className="object-cover" />
                </div>
                <h2 className="font-semibold text-lg mb-1">{p.name}</h2>
                <p className="text-gray-700 mb-1">Harga: <span className="font-medium">Rp {p.price.toLocaleString()}</span></p>
                <p className="text-gray-600 mb-3">Stok: {p.stock}</p>
                <div className="mt-auto flex gap-2">
                  <button onClick={() => { setEditing(p); setFormOpen(true); }} className="flex-1 border px-3 py-2 rounded hover:bg-gray-50">Edit</button>
                  <button onClick={() => { setToDelete(p); setDelModal(true); }} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded">Hapus</button>
                </div>
              </article>
            ))}
          </div>
      )}

      {/* modals */}
      <ProductFormModal open={formOpen} onClose={() => setFormOpen(false)} editing={editing}
        onSubmit={(prod) => setProducts((prev) => editing ? prev!.map((p) => (p.id === prod.id ? prod : p)) : [prod, ...(prev ?? [])])} />
      <DeleteModal open={delModal} onClose={() => setDelModal(false)} product={toDelete}
        onDelete={() => { setProducts((prev) => prev?.filter((p) => p.id !== toDelete?.id) || []); setDelModal(false); }} />

      {/* API */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Pokemon List</h2>
        <table className="table-auto border-collapse border border-gray-400 w-full mb-8">
          <thead>
            <tr>
              <th className="border border-gray-400 px-4 py-2 text-left">No</th>
              <th className="border border-gray-400 px-4 py-2 text-left">Ability Name</th>
            </tr>
          </thead>
          <tbody>
            {abilities.map((ability, index) => (
              <tr key={ability.name}>
                <td className="border border-gray-400 px-4 py-2">{index + 1}</td>
                <td className="border border-gray-400 px-4 py-2 capitalize">{ability.name}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="text-2xl font-bold mb-4">Battle Armor Ability (Detail)</h2>
        <ul className="list-disc ml-6">
          {battleArmorEffects.map((effect, idx) => (
            <li key={idx} className="mb-2">{effect}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
