import React, { useState } from "react";

type PaymentMethod = "QRIS" | "BCA" | "MANDIRI";
type LocationStatus = "idle" | "loading" | "success" | "error";

type CartItem = {
  id: number;
  name: string;
  qty: number;
  price: number;
};

const CheckoutPage = () => {
  const STORE_LATITUDE = -6.2917;
  const STORE_LONGITUDE = 106.7058;

  const [address, setAddress] = useState<string>("");
  const [gpsDistance, setGpsDistance] = useState<number | null>(null);
  const [manualDistance, setManualDistance] = useState<number | "">("");
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [locationMessage, setLocationMessage] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("QRIS");

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const cartItems: CartItem[] = [
    { id: 1, name: "Beras Premium 5 Kg", qty: 1, price: 68000 },
    { id: 2, name: "Telur Ayam 1 Kg", qty: 1, price: 28000 },
    { id: 3, name: "Laundry Reguler 3 Kg", qty: 1, price: 21000 },
  ];

  const activeDistance =
    gpsDistance !== null
      ? gpsDistance
      : typeof manualDistance === "number"
      ? manualDistance
      : 0;

  const ongkir = activeDistance <= 2 ? 0 : activeDistance * 2500;

  const subtotal = cartItems.reduce((total, item) => {
    return total + item.qty * item.price;
  }, 0);

  const totalEstimasi = subtotal + ongkir;

  const isCheckoutDisabled = address.trim() === "" && gpsDistance === null;

  const calculateDistanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const earthRadiusKm = 6371;
    const toRadians = (degree: number) => degree * (Math.PI / 180);

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusKm * c;
  };

  const handleManualDistanceChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;

    if (value === "") {
      setManualDistance("");
      setGpsDistance(null);
      setLocationMessage("");
      setLocationStatus("idle");
      return;
    }

    setManualDistance(Number(value));
    setGpsDistance(null);
    setLocationMessage("Menggunakan jarak manual.");
    setLocationStatus("idle");
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      setLocationMessage("Browser tidak mendukung GPS.");
      return;
    }

    setLocationStatus("loading");
    setLocationMessage("Mengambil lokasi GPS...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;

        const distance = calculateDistanceKm(
          STORE_LATITUDE,
          STORE_LONGITUDE,
          userLat,
          userLon
        );

        setGpsDistance(Number(distance.toFixed(2)));
        setLocationStatus("success");
        setLocationMessage("Lokasi berhasil didapatkan. Ongkir diperbarui.");
      },
      () => {
        setGpsDistance(null);
        setLocationStatus("error");
        setLocationMessage("GPS ditolak. Silakan isi jarak manual.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
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
            Jl. Sumatra No. 79, Jombang, Ciputat
          </p>
        </header>

        <form className="grid gap-6 lg:grid-cols-3">
          <section className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Alamat & Lokasi
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="address"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Alamat Pengiriman
                  </label>

                  <textarea
                    id="address"
                    rows={4}
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder="Masukkan alamat lengkap pelanggan"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={locationStatus === "loading"}
                  className="w-full rounded-xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {locationStatus === "loading"
                    ? "Mengambil Posisi..."
                    : "📍 Gunakan Posisi Saya Saat Ini"}
                </button>

                {locationMessage !== "" && (
                  <div
                    className={`rounded-xl p-4 text-sm ${
                      locationStatus === "success"
                        ? "bg-green-50 text-green-700"
                        : locationStatus === "error"
                        ? "bg-red-50 text-red-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    <p>{locationMessage}</p>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="manualDistance"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Jarak Manual dalam KM
                  </label>

                  <input
                    id="manualDistance"
                    type="number"
                    min={0}
                    step={0.1}
                    value={manualDistance}
                    onChange={handleManualDistanceChange}
                    placeholder="Contoh: 3.5"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <div
                  className={`rounded-xl p-4 text-sm ${
                    ongkir === 0
                      ? "bg-green-50 text-green-700"
                      : "bg-yellow-50 text-yellow-700"
                  }`}
                >
                  {ongkir === 0 ? (
                    <p>
                      Ongkir: <strong>Gratis</strong> untuk jarak maksimal 2 KM.
                    </p>
                  ) : (
                    <p>
                      Ongkir: <strong>{formatRupiah(ongkir)}</strong> dari jarak{" "}
                      {activeDistance.toFixed(2)} KM × Rp 2.500.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Metode Pembayaran
              </h2>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="cursor-pointer rounded-xl border p-4 hover:border-green-500">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "QRIS"}
                    onChange={() => setPaymentMethod("QRIS")}
                    className="mr-2 accent-green-600"
                  />
                  QRIS / GoPay
                </label>

                <label className="cursor-pointer rounded-xl border p-4 hover:border-green-500">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "BCA"}
                    onChange={() => setPaymentMethod("BCA")}
                    className="mr-2 accent-green-600"
                  />
                  Transfer BCA
                </label>

                <label className="cursor-pointer rounded-xl border p-4 hover:border-green-500">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "MANDIRI"}
                    onChange={() => setPaymentMethod("MANDIRI")}
                    className="mr-2 accent-green-600"
                  />
                  Transfer Mandiri
                </label>
              </div>

              <div className="mt-5 rounded-xl border bg-gray-50 p-5">
                {paymentMethod === "QRIS" && (
                  <div className="text-center">
                    <p className="font-bold text-gray-900">QRIS / GoPay</p>
                    <img
                      src="/qris-gopay.jpg"
                      alt="QRIS"
                      className="w-64 h-auto mx-auto mt-2 rounded-lg"
                    />
                  </div>
                )}

                {paymentMethod === "BCA" && (
                  <p className="font-bold text-gray-900">
                    Bank BCA — No. Rek: 4971422691 a.n Suriah
                  </p>
                )}

                {paymentMethod === "MANDIRI" && (
                  <p className="font-bold text-gray-900">
                    Bank Mandiri — No. Rek: 1050005833474 a.n Rowanto
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Pesanan
              </h2>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border p-4"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.qty}</p>
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

            <div className="space-y-3 border-b pb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatRupiah(subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Jarak</span>
                <span className="font-medium">
                  {activeDistance.toFixed(2)} KM
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Ongkir</span>
                <span className="font-medium">
                  {ongkir === 0 ? "Gratis" : formatRupiah(ongkir)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Pembayaran</span>
                <span className="font-medium">
                  {paymentMethod === "QRIS"
                    ? "QRIS / GoPay"
                    : paymentMethod === "BCA"
                    ? "Transfer BCA"
                    : "Transfer Mandiri"}
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
              disabled={isCheckoutDisabled}
              className="mt-6 w-full rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Buat Pesanan
            </button>

            {isCheckoutDisabled && (
              <p className="mt-3 text-center text-xs text-red-500">
                Isi alamat atau gunakan posisi GPS terlebih dahulu.
              </p>
            )}
          </aside>
        </form>
      </div>
    </main>
  );
};

export default CheckoutPage;