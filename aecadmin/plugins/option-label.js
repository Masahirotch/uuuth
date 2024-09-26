import { PRODUCT, PRODUCT_PRICE } from "@/constants/";

export default ({ app }, inject) => {
  inject('PRODUCT', PRODUCT)
  inject('PRODUCT_PRICE', PRODUCT_PRICE)
}
