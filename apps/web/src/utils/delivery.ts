import { DELIVERY } from '@/config/delivery';
import { haversineDistanceKm } from './geo';

export interface GeoPoint {
  lat: number;
  lng: number;
  displayName?: string;
}

export interface DeliveryQuote {
  distanceKm: number;
  fee: number;
  isFree: boolean;
  billableKm: number;
  /** Teks singkat untuk UI */
  summary: string;
}

export function calculateDeliveryFee(distanceKm: number): DeliveryQuote {
  const roundedDistance = Math.round(distanceKm * 10) / 10;

  if (roundedDistance <= DELIVERY.freeRadiusKm) {
    return {
      distanceKm: roundedDistance,
      fee: 0,
      isFree: true,
      billableKm: 0,
      summary: `Gratis (≤ ${DELIVERY.freeRadiusKm} km dari toko)`,
    };
  }

  const billableKm = Math.ceil(roundedDistance - DELIVERY.freeRadiusKm);
  const fee = billableKm * DELIVERY.ratePerKm;

  return {
    distanceKm: roundedDistance,
    fee,
    isFree: false,
    billableKm,
    summary: `${billableKm} km × ${DELIVERY.ratePerKm.toLocaleString('id-ID')} = ongkir`,
  };
}

export function quoteFromCoordinates(
  destination: GeoPoint,
): DeliveryQuote {
  const distanceKm = haversineDistanceKm(
    DELIVERY.store.lat,
    DELIVERY.store.lng,
    destination.lat,
    destination.lng,
  );
  return calculateDeliveryFee(distanceKm);
}

async function geocodeAddress(query: string): Promise<GeoPoint> {
  const fullQuery = query.includes('Indonesia')
    ? query
    : `${query}, ${DELIVERY.geocodeSuffix}`;

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'json');
  url.searchParams.set('q', fullQuery);
  url.searchParams.set('limit', '1');
  url.searchParams.set('countrycodes', 'id');

  const res = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'id',
    },
  });

  if (!res.ok) {
    throw new Error('geocode_failed');
  }

  const data = (await res.json()) as {
    lat: string;
    lon: string;
    display_name: string;
  }[];

  if (!data.length) {
    throw new Error('address_not_found');
  }

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  };
}

export async function fetchDeliveryQuoteFromAddress(
  addressLine: string,
  addressDetail: string,
): Promise<DeliveryQuote & { destination?: GeoPoint }> {
  const parts = [addressLine.trim(), addressDetail.trim()].filter(Boolean);
  if (parts.join('').length < 8) {
    throw new Error('address_too_short');
  }

  const destination = await geocodeAddress(parts.join(', '));
  const quote = quoteFromCoordinates(destination);
  return { ...quote, destination };
}

export async function fetchDeliveryQuoteFromGeolocation(): Promise<
  DeliveryQuote & { destination: GeoPoint }
> {
  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('geolocation_unsupported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 12_000,
      maximumAge: 60_000,
    });
  });

  const destination: GeoPoint = {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
    displayName: 'Lokasi GPS Anda',
  };

  const quote = quoteFromCoordinates(destination);
  return { ...quote, destination };
}
