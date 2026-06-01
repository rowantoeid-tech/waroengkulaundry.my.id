import React, { useMemo, useState } from "react";

type CartItem = {
  id: number;
  name: string;
  category: string;
  qty: number;
  price: number;
};

type LocationStatus = "idle" | "loading" | "success" | "error";
type PaymentMethod = "QRIS" | "BCA" | "MANDIRI";

const STORE_LATITUDE = -6.2917;
const STORE_LONGITUDE = 106.7058;
const FREE_DISTANCE_KM = 2;
const SHIPPING_RATE_PER_KM = 2500;

export default function CheckoutPage() {
  const [address, setAddress] = useState<string>("");
  const [manualDistance, setManualDistance] = useState<number>(0);
  const [gpsDistance, setGpsDistance] = useState<number | null>(null);
  const [customerLatitude, setCustomerLatitude] = useState<number | null>(null);
  const [customerLongitude, setCustomerLongitude] = useState<number | null>(
    null
  );
  const [locationStatus, setLocationStatus] =
    useState<LocationStatus>("idle");
  const [locationMessage, setLocationMessage] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("QRIS");
  const [copyMessage, setCopyMessage] = useState<string>("");

  const cartItems: CartItem[] = [
    {
      id: 1,
      name: "Beras Premium 5 Kg",
      category: "Sembako",
      qty: 1,
      price: 68000,
    },
    {
      id: 2,
      name: "Telur Ayam 1 Kg",
      category: "Sembako",
      qty: 1,
      price: 28000,
    },
    {
      id: 3,
      name: "Laundry Reguler",
      category: "Laundry",
      qty: 3,
      price: 7000,
    },
  ];

  const formatRupiah = (value: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const calculateDistanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
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

  const activeDistance = gpsDistance !== null ? gpsDistance : manualDistance;

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      return total + item.qty * item.price;
    }, 0);
  }, []);

  const ongkirAntar = useMemo(() => {
    if (activeDistance <= FREE_DISTANCE_KM) {
      return 0;
    }

    return Math.ceil(activeDistance) * SHIPPING_RATE_PER_KM;
  }, [activeDistance]);

  const totalEstimasi = subtotal + ongkirAntar;

  const handleUseCurrentLocation = (): void => {
    if (!navigator.geolocation) {
      setGpsDistance(null);
      setLocationStatus("error");
      setLocationMessage(
        "Browser Anda tidak mendukung GPS. Silakan isi jarak manual."
      );
      return;
    }

    setLocationStatus("loading");
    setLocationMessage("Mengambil lokasi GPS Anda...");

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

        setCustomerLatitude(userLat);
        setCustomerLongitude(userLon);
        setGpsDistance(Number(distance.toFixed(2)));
        setLocationStatus("success");
        setLocationMessage(
          "Lokasi berhasil didapatkan. Ongkir diperbarui otomatis."
        );
      },
      () => {
        setGpsDistance(null);
        setLocationStatus("error");
        setLocationMessage(
          "GPS ditolak atau gagal mengambil lokasi. Silakan isi jarak manual."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleManualDistanceChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = Number(event.target.value);

    setManualDistance(value);
    setGpsDistance(null);
    setCustomerLatitude(null);
    setCustomerLongitude(null);
    setLocationStatus("idle");
    setLocationMessage("Menggunakan jarak manual sebagai cadangan.");
  };

  const handleCopyAccountNumber = async (accountNumber: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopyMessage("Nomor rekening berhasil disalin.");
    } catch {
      setCopyMessage("Gagal menyalin. Silakan salin nomor rekening manual.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Checkout Waroengku
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Toko sembako & laundry — Jl. Sumatra No. 79, Jombang, Ciputat
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Alamat & Lokasi Pengiriman
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

                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={locationStatus === "loading"}
                  className="w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 px-4 py-3 font-semibold text-white shadow-sm transition hover:from-green-700 hover:to-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {locationStatus === "loading"
                    ? "Mengambil Posisi..."
                    : "📍 Gunakan Posisi Saya Saat Ini"}
                </button>

                {locationMessage && (
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

                {customerLatitude !== null && customerLongitude !== null && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                    <p>
                      Koordinat pelanggan: {customerLatitude.toFixed(5)},{" "}
                      {customerLongitude.toFixed(5)}
                    </p>
                    <p className="mt-1">
                      Jarak GPS dari toko:{" "}
                      <strong>{activeDistance.toFixed(2)} KM</strong>
                    </p>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="manualDistance"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Input Jarak Manual Cadangan dalam KM
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

                  <p className="mt-2 text-xs text-gray-500">
                    Isi manual jika GPS gagal, ditolak, atau lokasi tidak
                    akurat.
                  </p>
                </div>

                <div
                  className={`rounded-xl p-4 text-sm ${
                    ongkirAntar === 0
                      ? "bg-green-50 text-green-700"
                      : "bg-yellow-50 text-yellow-700"
                  }`}
                >
                  {ongkirAntar === 0 ? (
                    <p>
                      Ongkir Antar: <strong>Gratis</strong> karena jarak maksimal{" "}
                      {FREE_DISTANCE_KM} KM dari toko.
                    </p>
                  ) : (
                    <p>
                      Ongkir Antar: <strong>{formatRupiah(ongkirAntar)}</strong>{" "}
                      berdasarkan rumus {activeDistance.toFixed(2)} KM ×{" "}
                      {formatRupiah(SHIPPING_RATE_PER_KM)}.
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
                <label className="cursor-pointer rounded-xl border border-gray-200 p-4 hover:border-green-500">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="QRIS"
                      checked={paymentMethod === "QRIS"}
                      onChange={() => {
                        setPaymentMethod("QRIS");
                        setCopyMessage("");
                      }}
                      className="h-4 w-4 accent-green-600"
                    />

                    <div>
                      <p className="font-semibold text-gray-900">
                        QRIS / GoPay
                      </p>
                      <p className="text-sm text-gray-500">
                        Scan QRIS
                      </p>
                    </div>
                  </div>
                </label>

                <label className="cursor-pointer rounded-xl border border-gray-200 p-4 hover:border-green-500">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="BCA"
                      checked={paymentMethod === "BCA"}
                      onChange={() => {
                        setPaymentMethod("BCA");
                        setCopyMessage("");
                      }}
                      className="h-4 w-4 accent-green-600"
                    />

                    <div>
                      <p className="font-semibold text-gray-900">
                        Transfer BCA
                      </p>
                      <p className="text-sm text-gray-500">
                        Bank BCA
                      </p>
                    </div>
                  </div>
                </label>

                <label className="cursor-pointer rounded-xl border border-gray-200 p-4 hover:border-green-500">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="MANDIRI"
                      checked={paymentMethod === "MANDIRI"}
                      onChange={() => {
                        setPaymentMethod("MANDIRI");
                        setCopyMessage("");
                      }}
                      className="h-4 w-4 accent-green-600"
                    />

                    <div>
                      <p className="font-semibold text-gray-900">
                        Transfer Mandiri
                      </p>
                      <p className="text-sm text-gray-500">
                        Bank Mandiri
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-5">
                {paymentMethod === "QRIS" && (
                  <div className="text-center">
                    <p className="font-bold text-gray-900">
                      QRIS / GoPay
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Silakan scan QRIS berikut menggunakan GoPay, OVO, DANA,
                      atau mobile banking.
                    </p>
                    <img
                      src="/qris-gopay.jpg"
                      alt="QRIS GoPay"
                      className="w-64 h-auto mx-auto mt-2 rounded-lg border"
                    />
                  </div>
                )}

                {paymentMethod === "BCA" && (
                  <div>
                    <p className="font-bold text-gray-900">
                      Bank BCA — No. Rek: 4971422691 a.n Suriah
                    </p>
                    <button
                      type="button"
                      onClick={() => handleCopyAccountNumber("4971422691")}
                      className="mt-3 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Salin No. Rek
                    </button>
                  </div>
                )}

                {paymentMethod === "MANDIRI" && (
                  <div>
                    <p className="font-bold text-gray-900">
                      Bank Mandiri — No. Rek: 1050005833474 a.n Rowanto
                    </p>
                    <button
                      type="button"
                      onClick={() => handleCopyAccountNumber("1050005833474")}
                      className="mt-3 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Salin No. Rek
                    </button>
                  </div>
                )}

                {copyMessage && (
                  <p className="mt-3 text-sm font-medium text-green-700">
                    {copyMessage}
                  </p>
                )}
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
                  {activeDistance.toFixed(2)} KM
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Sumber Jarak</span>
                <span className="font-medium text-gray-900">
                  {gpsDistance !== null ? "GPS" : "Manual"}
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
              disabled={!address.trim() && gpsDistance === null}
              className="mt-6 w-full rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Buat Pesanan
            </button>

            {!address.trim() && gpsDistance === null && (
              <p className="mt-3 text-center text-xs text-red-500">
                Isi alamat atau gunakan posisi GPS terlebih dahulu.
              </p>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}