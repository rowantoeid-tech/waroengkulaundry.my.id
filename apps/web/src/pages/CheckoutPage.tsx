import React, { useMemo, useState } from "react";

type CartItem = {
  id: number;
  name: string;
  category: string;
  qty: number;
  price: number;
};

export default function CheckoutPage() {
  const [address, setAddress] = useState<string>("");
  const [distance, setDistance] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("QRIS");

  const cartItems: CartItem[] = [
    { id: 1, name: "Beras Premium 5 Kg", category: "Sembako", qty: 1, price: 68000 },
    { id: 2, name: "Telur Ayam 1 Kg", category: "Sembako", qty: 1, price: 28000 },
    { id: 3, name: "Laundry Reguler", category: "Laundry", qty: 3, price: 7000 },
  ];

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.qty * item.price, 0);
  }, [cartItems]);

  const ongkirAntar = useMemo(() => {
    if (distance <= 2) return 0;
    return Math.ceil(distance) * 2500;
  }, [distance]);

  const totalEstimasi = subtotal + ongkirAntar;

  const handleCheckDistance = () => {
    if (!address.trim()) {
      alert("Silakan isi alamat pengiriman terlebih dahulu.");
      return;
    }

    alert(
      distance <= 2
        ? "Jarak maksimal 2 KM. Ongkir gratis."
        : `Jarak ${distance} KM. Ongkir ${formatRupiah(ongkirAntar)}.`
    );
  };

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Checkout Waroengku
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Toko sembako & laundry — Jl. Sumatra No. 79, Ciputat
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Alamat Pengiriman
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="address"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Alamat Lengkap
                  </label>

                  <textarea
                    id="address"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    rows={4}
                    placeholder="Contoh: Jl. Rawalele, Ciputat, Tangerang Selatan"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="distance"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Jarak Pengiriman dari Toko dalam KM
                  </label>

                  <input
                    id="distance"
                    type="number"
                    min={0}
                    step={0.1}
                    value={distance}
                    onChange={(event) =>
                      setDistance(Number(event.target.value))
                    }
                    placeholder="Contoh: 3.5"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCheckDistance}
                  className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700"
                >
                  Cek Jarak & Ongkir
                </button>

                <div
                  className={`rounded-xl p-4 text-sm ${
                    ongkirAntar === 0
                      ? "bg-green-50 text-green-700"
                      : "bg-yellow-50 text-yellow-700"
                  }`}
                >
                  {ongkirAntar === 0 ? (
                    <p>
                      Ongkir Antar: <strong>Gratis</strong> untuk jarak maksimal
                      2 KM.
                    </p>
                  ) : (
                    <p>
                      Ongkir Antar: <strong>{formatRupiah(ongkirAntar)}</strong>{" "}
                      berdasarkan rumus {distance} KM × Rp 2.500.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Metode Pembayaran
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="cursor-pointer rounded-xl border border-gray-200 p-4 hover:border-green-500">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="QRIS"
                      checked={paymentMethod === "QRIS"}
                      onChange={(event) =>
                        setPaymentMethod(event.target.value)
                      }
                      className="h-4 w-4 accent-green-600"
                    />

                    <div>
                      <p className="font-semibold text-gray-900">QRIS</p>
                      <p className="text-sm text-gray-500">
                        GoPay, OVO, DANA
                      </p>
                    </div>
                  </div>
                </label>

                <label className="cursor-pointer rounded-xl border border-gray-200 p-4 hover:border-green-500">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Virtual Account"
                      checked={paymentMethod === "Virtual Account"}
                      onChange={(event) =>
                        setPaymentMethod(event.target.value)
                      }
                      className="h-4 w-4 accent-green-600"
                    />

                    <div>
                      <p className="font-semibold text-gray-900">
                        Virtual Account
                      </p>
                      <p className="text-sm text-gray-500">
                        BCA, Mandiri, BRI
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Barang & Laundry
              </h2>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-gray-200 p-4"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.category} • Qty: {item.qty}
                      </p>
                    </div>

                    <p className="font-semibold text-gray-900">
                      {formatRupiah(item.qty * item.price)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Ringkasan Nota
            </h2>

            <div className="space-y-3 border-b border-gray-200 pb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal Belanja</span>
                <span className="font-medium text-gray-900">
                  {formatRupiah(subtotal)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Jarak Pengiriman</span>
                <span className="font-medium text-gray-900">
                  {distance} KM
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Ongkir Antar</span>
                <span className="font-medium text-gray-900">
                  {ongkirAntar === 0 ? "Gratis" : formatRupiah(ongkirAntar)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Pembayaran</span>
                <span className="font-medium text-gray-900">
                  {paymentMethod}
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-green-50 p-4">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total Estimasi</span>
                <span>{formatRupiah(totalEstimasi)}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={!address.trim()}
              className="mt-6 w-full rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Buat Pesanan
            </button>

            {!address.trim() && (
              <p className="mt-3 text-center text-xs text-red-500">
                Isi alamat pengiriman terlebih dahulu.
              </p>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}