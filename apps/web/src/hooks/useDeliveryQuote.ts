import { useCallback, useEffect, useRef, useState } from 'react';
import type { FulfillmentMethod } from '@/types/checkout';
import {
  fetchDeliveryQuoteFromAddress,
  fetchDeliveryQuoteFromGeolocation,
  type DeliveryQuote,
} from '@/utils/delivery';

export type DeliveryQuoteStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'error';

export function useDeliveryQuote(
  fulfillment: FulfillmentMethod,
  addressLine: string,
  addressDetail: string,
) {
  const [quote, setQuote] = useState<DeliveryQuote | null>(null);
  const [status, setStatus] = useState<DeliveryQuoteStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const requestId = useRef(0);

  const reset = useCallback(() => {
    setQuote(null);
    setStatus('idle');
    setErrorMessage(null);
  }, []);

  const applyQuote = useCallback((q: DeliveryQuote) => {
    setQuote(q);
    setStatus('ready');
    setErrorMessage(null);
  }, []);

  const runAddressQuote = useCallback(async () => {
    if (fulfillment !== 'antar') return;

    const line = addressLine.trim();
    if (line.length < 8) {
      reset();
      return;
    }

    const id = ++requestId.current;
    setStatus('loading');
    setErrorMessage(null);

    try {
      const result = await fetchDeliveryQuoteFromAddress(line, addressDetail);
      if (id !== requestId.current) return;
      applyQuote(result);
    } catch (err) {
      if (id !== requestId.current) return;
      setStatus('error');
      setQuote(null);
      const code = err instanceof Error ? err.message : '';
      if (code === 'address_not_found') {
        setErrorMessage(
          'Alamat tidak ditemukan. Tambahkan nama jalan/RT/RW atau gunakan tombol GPS.',
        );
      } else if (code === 'address_too_short') {
        setErrorMessage('Alamat terlalu singkat untuk hitung jarak.');
      } else {
        setErrorMessage('Gagal menghitung jarak. Coba lagi atau pakai GPS.');
      }
    }
  }, [fulfillment, addressLine, addressDetail, applyQuote, reset]);

  useEffect(() => {
    if (fulfillment === 'ambil') {
      setQuote({
        distanceKm: 0,
        fee: 0,
        isFree: true,
        billableKm: 0,
        summary: 'Ambil sendiri di toko',
      });
      setStatus('ready');
      setErrorMessage(null);
      return;
    }

    reset();

    const line = addressLine.trim();
    if (line.length < 8) return;

    const timer = window.setTimeout(() => {
      void runAddressQuote();
    }, 800);

    return () => window.clearTimeout(timer);
  }, [fulfillment, addressLine, addressDetail, runAddressQuote, reset]);

  const quoteFromGps = useCallback(async () => {
    if (fulfillment !== 'antar') return;

    const id = ++requestId.current;
    setStatus('loading');
    setErrorMessage(null);

    try {
      const result = await fetchDeliveryQuoteFromGeolocation();
      if (id !== requestId.current) return;
      applyQuote(result);
    } catch {
      if (id !== requestId.current) return;
      setStatus('error');
      setQuote(null);
      setErrorMessage(
        'Lokasi GPS ditolak atau tidak tersedia. Isi alamat lengkap manual.',
      );
    }
  }, [fulfillment, applyQuote]);

  return {
    quote,
    status,
    errorMessage,
    recalculate: runAddressQuote,
    quoteFromGps,
  };
}
