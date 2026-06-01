import type { CartItem } from '@/types/cart';
import type { ShippingFormData } from '@/types/checkout';
import { DELIVERY } from '@/config/delivery';
import type { DeliveryQuote } from '@/utils/delivery';
import { formatRupiah } from './format';
import { formatDistanceKm } from './geo';

export function getLineTotal(item: CartItem): number {
  return item.price * item.quantity;
}

export function getDeliveryFeeForCheckout(
  fulfillment: ShippingFormData['fulfillment'],
  quote: DeliveryQuote | null,
): number {
  if (fulfillment === 'ambil') return 0;
  return quote?.fee ?? 0;
}

export function buildWhatsAppOrderMessage(
  items: CartItem[],
  subtotal: number,
  deliveryFee: number,
  form: ShippingFormData,
  quote: DeliveryQuote | null,
): string {
  const lines = items.map((item) => {
    const total = getLineTotal(item);
    const tag = item.type === 'product' ? 'Sembako' : 'Laundry';
    return `• [${tag}] ${item.name} × ${item.quantity} ${item.unit} = ${formatRupiah(total)}`;
  });

  const total = subtotal + deliveryFee;
  const fulfillmentLabel =
    form.fulfillment === 'antar'
      ? 'Antar ke alamat'
      : 'Ambil sendiri di toko';

  let ongkirLine = 'Pengambilan: Di toko';
  if (form.fulfillment === 'antar' && quote) {
    if (quote.isFree) {
      ongkirLine = `Ongkir: GRATIS (${formatDistanceKm(quote.distanceKm)} dari toko, ≤ ${DELIVERY.freeRadiusKm} km)`;
    } else {
      ongkirLine = `Ongkir: ${formatRupiah(deliveryFee)} — jarak ${formatDistanceKm(quote.distanceKm)} (${quote.billableKm} km × Rp ${DELIVERY.ratePerKm.toLocaleString('id-ID')})`;
    }
  } else if (form.fulfillment === 'antar') {
    ongkirLine = 'Ongkir: (belum dihitung)';
  }

  return [
    'Halo Waroengku, saya ingin memesan:',
    '',
    ...lines,
    '',
    `Subtotal: ${formatRupiah(subtotal)}`,
    ongkirLine,
    `*Total: ${formatRupiah(total)}*`,
    '',
    '--- Data pelanggan ---',
    `Nama: ${form.customerName}`,
    `HP: ${form.phone}`,
    `Cara: ${fulfillmentLabel}`,
    form.fulfillment === 'antar'
      ? `Alamat: ${form.addressLine}${form.addressDetail ? `, ${form.addressDetail}` : ''}`
      : '',
    form.fulfillment === 'antar' && quote
      ? `Jarak dari toko: ${formatDistanceKm(quote.distanceKm)}`
      : '',
    form.notes ? `Catatan: ${form.notes}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildWhatsAppUrl(message: string): string {
  const base = 'https://wa.me/628116144092';
  return `${base}?text=${encodeURIComponent(message)}`;
}
