import { webMethod, Permissions } from '@wix/web-methods';
import { currentCart } from 'wix-ecom-backend';

export const createCheckoutFromCart = webMethod(
  Permissions.Anyone,
  async () => {
    return await currentCart.createCheckoutFromCurrentCart();
  }
);
