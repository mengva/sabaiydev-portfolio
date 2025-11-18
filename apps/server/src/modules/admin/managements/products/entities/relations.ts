import { relations } from "drizzle-orm";
import { productImages, products, translationProducts } from "./product";
import { staffs } from "../../staff/entities/staff";

export const productRelations = relations(products, ({ one, many }) => ({
  addByStaff: one(staffs, {
    fields: [products.addByStaffId],
    references: [staffs.id],
  }),
  updatedByStaff: one(staffs, {
    fields: [products.updatedByStaffId],
    references: [staffs.id],
  }),
  images: many(productImages),
  translationProducts: many(translationProducts)
}));

export const productImageRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const translationProductsRelations = relations(translationProducts, ({ one }) => ({
  product: one(products, {
    fields: [translationProducts.productId],
    references: [products.id],
  }),
}));