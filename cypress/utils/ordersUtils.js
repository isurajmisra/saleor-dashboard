import * as checkoutRequest from "../apiRequests/Checkout";
import * as orderRequest from "../apiRequests/Order";

export function createWaitingForCaptureOrder(
  channelSlug,
  email,
  variantsList,
  shippingMethodId,
  address
) {
  let checkout;
  const auth = "token";
  cy.loginInShop();
  return checkoutRequest
    .createCheckout({ channelSlug, email, variantsList, address, auth })
    .then(checkoutResp => {
      checkout = checkoutResp;
      checkoutRequest.addShippingMethod(checkout.id, shippingMethodId);
    })
    .then(() => addPayment(checkout.id))
    .then(() => checkoutRequest.completeCheckout(checkout.id))
    .then(({ order }) => ({ checkout, order }));
}

export function createCheckoutWithVoucher({
  channelSlug,
  email = "email@example.com",
  variantsList,
  address,
  shippingMethodId,
  voucherCode,
  auth
}) {
  let checkout;
  return checkoutRequest
    .createCheckout({ channelSlug, email, variantsList, address, auth })
    .then(checkoutResp => {
      checkout = checkoutResp;
      checkoutRequest.addShippingMethod(checkout.id, shippingMethodId);
    })
    .then(() => {
      checkoutRequest.addVoucher(checkout.id, voucherCode);
    })
    .its("body.data.checkoutAddPromoCode");
}

export function createReadyToFulfillOrder(
  customerId,
  shippingMethodId,
  channelId,
  variantsList,
  address
) {
  let order;
  return orderRequest
    .createDraftOrder(customerId, shippingMethodId, channelId, address)
    .then(orderResp => {
      order = orderResp;
      assignVariantsToOrder(order, variantsList);
    })
    .then(() => orderRequest.markOrderAsPaid(order.id))
    .then(() => orderRequest.completeOrder(order.id));
}

export function createOrder({
  customerId,
  shippingMethodId,
  channelId,
  variantsList,
  address
}) {
  let order;
  return orderRequest
    .createDraftOrder(customerId, shippingMethodId, channelId, address)
    .then(orderResp => {
      order = orderResp;
      assignVariantsToOrder(order, variantsList);
    })
    .then(() => orderRequest.completeOrder(order.id))
    .then(() => order);
}

function assignVariantsToOrder(order, variantsList) {
  variantsList.forEach(variantElement => {
    orderRequest.addProductToOrder(order.id, variantElement.id);
  });
}

export function addPayment(checkoutId) {
  return checkoutRequest.addPayment({
    checkoutId,
    gateway: "mirumee.payments.dummy",
    token: "not-charged"
  });
}

export function addAdyenPayment(checkoutId, amount) {
  return checkoutRequest.addPayment({
    checkoutId,
    gateway: "mirumee.payments.adyen",
    amount
  });
}

export function createAndCompleteCheckoutWithoutShipping({
  channelSlug,
  email,
  variantsList,
  billingAddress,
  auth
}) {
  let checkout;
  return checkoutRequest
    .createCheckout({ channelSlug, email, variantsList, billingAddress, auth })
    .then(checkoutResp => {
      checkout = checkoutResp;
      addPayment(checkout.id);
    })
    .then(() => checkoutRequest.completeCheckout(checkout.id))
    .then(({ order }) => ({ checkout, order }));
}
