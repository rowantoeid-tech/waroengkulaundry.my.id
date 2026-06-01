import type { CartItem } from '@/types/cart';
import type { ShippingFormData } from '@/types/checkout';
import { formatRupiah } from './format';

/** Sesuai promo di announcement bar */
export const FREE_DELIVERY_MIN_ORDER = 50_000;

export function getLineTotal(item: CartItem): number {
  return item.price * item.quantity;
}

export function getDeliveryFee(
  subtotal: number,
  fulfillment: ShippingFormData['fulfillment'],
): number {
  if (fulfillment === 'ambil') return 0;
  return subtotal >= FREE_DELIVERY_MIN_ORDER ? 0 : 0;
}

export function isFreeDeliveryEligible(
  subtotal: number,
  fulfillment: ShippingFormData['fulfillment'],
): boolean {
  return fulfillment === 'antar' && subtotal >= FREE_DELIVERY_MIN_ORDER;
}

export function buildWhatsAppOrderMessage(
  items: CartItem[],
  subtotal: number,
  deliveryFee: number,
  form: ShippingFormData,
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

  return [
    'Halo Waroengku, saya ingin memesan:',
    '',
    ...lines,
    '',
    `Subtotal: ${formatRupiah(subtotal)}`,
    form.fulfillment === 'antar'
      ? isFreeDeliveryEligible(subtotal, form.fulfillment)
        ? 'Ongkir: Gratis antar (radius 2 km, min. belanja terpenuhi)'
        : 'Ongkir: Akan dikonfirmasi (min. belanja Rp 50.000 untuk gratis antar 2 km)'
      : 'Pengambilan: Di toko',
    `*Total estimasi: ${formatRupiah(total)}*`,
    '',
    '--- Data pelanggan ---',
    `Nama: ${form.customerName}`,
    `HP: ${form.phone}`,
    `Cara: ${fulfillmentLabel}`,
    form.fulfillment === 'antar'
      ? `Alamat: ${form.addressLine}${form.addressDetail ? `, ${form.addressDetail}` : ''}`
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
