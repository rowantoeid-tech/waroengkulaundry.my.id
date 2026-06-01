export type FulfillmentMethod = 'antar' | 'ambil';

export interface ShippingFormData {
  customerName: string;
  phone: string;
  addressLine: string;
  addressDetail: string;
  notes: string;
  fulfillment: FulfillmentMethod;
}

export const EMPTY_SHIPPING_FORM: ShippingFormData = {
  customerName: '',
  phone: '',
  addressLine: '',
  addressDetail: '',
  notes: '',
  fulfillment: 'antar',
};
