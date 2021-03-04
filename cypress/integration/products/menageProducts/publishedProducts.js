import faker from "faker";

import ProductSteps from "../../../steps/productSteps";
import { productDetailsUrl } from "../../../url/urlList";
import * as channelsUtils from "../../../utils/channelsUtils";
import * as productsUtils from "../../../utils/productsUtils";
import { isProductVisible } from "../../../utils/storeFront/storeFrontProductUtils";

// <reference types="cypress" />
describe("Published products", () => {
  const productSteps = new ProductSteps();

  const startsWith = "Cy-";
  const name = `${startsWith}${faker.random.number()}`;
  let productType;
  let attribute;
  let category;

  before(() => {
    cy.clearSessionData().loginUserViaRequest();
    productsUtils.deleteProperProducts(startsWith);
    productsUtils.createTypeAttributeAndCategoryForProduct(name).then(() => {
      productType = productsUtils.getProductType();
      attribute = productsUtils.getAttribute();
      category = productsUtils.getCategory();
    });
  });

  beforeEach(() => {
    cy.clearSessionData().loginUserViaRequest();
  });
  it("should update product to published", () => {
    const productName = `${startsWith}${faker.random.number()}`;
    let defaultChannel;
    channelsUtils
      .getDefaultChannel()
      .then(channel => {
        defaultChannel = channel;
        productsUtils.createProductInChannel({
          name: productName,
          channelId: defaultChannel.id,
          productTypeId: productType.id,
          attributeId: attribute.id,
          categoryId: category.id,
          isPublished: false,
          isAvailableForPurchase: false
        });
      })
      .then(() => {
        const product = productsUtils.getCreatedProduct();
        const productUrl = productDetailsUrl(product.id);
        productSteps.updateProductPublish(productUrl, true);
        isProductVisible(product.id, defaultChannel.slug, productName);
      })
      .then(isVisible => {
        expect(isVisible).to.be.eq(true);
      });
  });
  it("should update product to not published", () => {
    const productName = `${startsWith}${faker.random.number()}`;
    let defaultChannel;
    let product;

    channelsUtils
      .getDefaultChannel()
      .then(channel => {
        defaultChannel = channel;
        productsUtils.createProductInChannel({
          name: productName,
          channelId: defaultChannel.id,
          productTypeId: productType.id,
          attributeId: attribute.id,
          categoryId: category.id
        });
      })
      .then(() => {
        product = productsUtils.getCreatedProduct();
        const productUrl = productDetailsUrl(product.id);
        productSteps.updateProductPublish(productUrl, false);
        isProductVisible(product.id, defaultChannel.slug, productName);
      })
      .then(isVisible => {
        expect(isVisible).to.be.eq(false);
        cy.loginInShop();
      })
      .then(() => {
        isProductVisible(product.id, defaultChannel.slug, productName);
      })
      .then(isVisible => {
        expect(isVisible).to.be.eq(true);
      });
  });
});
