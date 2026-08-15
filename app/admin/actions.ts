"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireOwner } from "@/lib/auth";
import type { StockStatus } from "@/lib/types";

export type AdminActionState = { ok: boolean; message: string };
const initialError: AdminActionState = { ok: false, message: "Please check the highlighted information." };

const slugSchema = z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens.");
const productSchema = z.object({
  id: z.string().trim().optional(),
  name: z.string().trim().min(2).max(120),
  slug: slugSchema,
  categoryId: z.string().trim().min(2),
  description: z.string().trim().min(10).max(240),
  longDescription: z.string().trim().min(20).max(1200),
  price: z.coerce.number().min(0.01).max(100000),
  oldPrice: z.union([z.literal(""), z.coerce.number().min(0.01).max(100000)]),
  badge: z.enum(["", "New", "Popular", "Sale"]),
  stockStatus: z.enum(["in_stock", "low_stock", "out_of_stock"]),
  publicationStatus: z.enum(["draft", "published", "archived"]),
  sortOrder: z.coerce.number().int().min(0).max(10000),
});

const optionsSchema = z.array(z.object({ name: z.string().trim().min(1).max(40), values: z.array(z.string().trim().min(1).max(50)).min(1).max(10) })).max(2);
const variantsSchema = z.array(z.object({ label: z.string().trim().min(1).max(100), optionValues: z.record(z.string(), z.string()), priceCents: z.number().int().positive().nullable(), stockStatus: z.enum(["in_stock", "low_stock", "out_of_stock"]), active: z.boolean() })).max(100);

export async function saveProductAction(_previous: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const parsed = productSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"), slug: formData.get("slug"), categoryId: formData.get("categoryId"),
    description: formData.get("description"), longDescription: formData.get("longDescription"),
    price: formData.get("price"), oldPrice: formData.get("oldPrice") || "", badge: formData.get("badge") || "",
    stockStatus: formData.get("stockStatus"), publicationStatus: formData.get("publicationStatus"), sortOrder: formData.get("sortOrder") || 0,
  });
  if (!parsed.success) return { ...initialError, message: parsed.error.issues[0]?.message || initialError.message };

  let options: z.infer<typeof optionsSchema> = [];
  let variants: z.infer<typeof variantsSchema> = [];
  try {
    options = optionsSchema.parse(JSON.parse(String(formData.get("optionsJson") || "[]")));
    variants = variantsSchema.parse(JSON.parse(String(formData.get("variantsJson") || "[]")));
  } catch {
    return { ok: false, message: "Product options could not be validated. Review the option names and values." };
  }

  const optionNames = options.map((option) => option.name.toLowerCase());
  if (new Set(optionNames).size !== optionNames.length) return { ok: false, message: "Option names must be unique." };
  if (options.some((option) => new Set(option.values.map((value) => value.toLowerCase())).size !== option.values.length)) {
    return { ok: false, message: "Each option value must be unique." };
  }
  const expectedVariants = options.length ? options.reduce((total, option) => total * option.values.length, 1) : 0;
  if (variants.length !== expectedVariants) return { ok: false, message: "Every active option combination needs a variant." };

  const value = parsed.data;
  if (value.oldPrice !== "" && Number(value.oldPrice) <= value.price) {
    return { ok: false, message: "The previous price must be higher than the current price." };
  }

  const files = formData.getAll("images").filter((entry): entry is File => entry instanceof File && entry.size > 0);
  const alt = String(formData.get("imageAlt") || "").trim();
  if (files.length > 4) return { ok: false, message: "Upload up to four product images at a time." };
  if (files.length && alt.length < 5) return { ok: false, message: "Add descriptive alt text for the new product images." };
  for (const file of files) {
    if (file.size > 4 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
      return { ok: false, message: `${file.name} must be a JPG, PNG, WebP or AVIF file no larger than 4 MB.` };
    }
  }

  const { supabase } = await requireOwner();
  const id = value.id || `product-${randomUUID()}`;
  const { error: productError } = await supabase.from("products").upsert({
    id, name: value.name, slug: value.slug, category_id: value.categoryId, description: value.description,
    long_description: value.longDescription, price_cents: Math.round(value.price * 100),
    old_price_cents: value.oldPrice === "" ? null : Math.round(Number(value.oldPrice) * 100),
    badge: value.badge || null, featured: formData.get("featured") === "on", is_new: formData.get("isNew") === "on",
    stock_status: value.stockStatus, publication_status: value.publicationStatus, sort_order: value.sortOrder,
  });
  if (productError) return { ok: false, message: productError.code === "23505" ? "That product URL is already in use." : productError.message };

  const { error: configurationError } = await supabase.rpc("replace_product_configuration", {
    p_product_id: id,
    p_options: options.map((option, index) => ({ name: option.name, values: option.values, sort_order: index + 1 })),
    p_variants: variants.map((variant) => ({ label: variant.label, option_values: variant.optionValues, price_cents: variant.priceCents, stock_status: variant.stockStatus, active: variant.active })),
  });
  if (configurationError) return { ok: false, message: "The product saved, but its options could not be refreshed safely." };

  const removeIds = formData.getAll("removeImageIds").map(String);
  if (removeIds.length) {
    const { data: removed } = await supabase.from("product_images").select("id, storage_path").eq("product_id", id).in("id", removeIds);
    const paths = (removed || []).map((image) => image.storage_path).filter(Boolean) as string[];
    if (paths.length) await supabase.storage.from("product-images").remove(paths);
    await supabase.from("product_images").delete().eq("product_id", id).in("id", removeIds);
  }

  const primaryImageId = String(formData.get("primaryImageId") || "");
  const retainedPrimaryImageId = removeIds.includes(primaryImageId) ? "" : primaryImageId;
  const imageOrderEntries = Array.from(formData.entries()).filter(([key]) => key.startsWith("imageOrder:"));
  await supabase.from("product_images").update({ is_primary: false }).eq("product_id", id);
  for (const [key, order] of imageOrderEntries) {
    const imageId = key.replace("imageOrder:", "");
    await supabase.from("product_images").update({ sort_order: Number(order) || 0, is_primary: imageId === retainedPrimaryImageId }).eq("product_id", id).eq("id", imageId);
  }

  for (const [index, file] of files.entries()) {
    const extension = ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" } as const)[file.type as "image/jpeg" | "image/png" | "image/webp" | "image/avif"];
    const storagePath = `${id}/${randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("product-images").upload(storagePath, file, { contentType: file.type, upsert: false });
    if (uploadError) return { ok: false, message: uploadError.message };
    const { data: publicUrl } = supabase.storage.from("product-images").getPublicUrl(storagePath);
    const { error: imageError } = await supabase.from("product_images").insert({ product_id: id, url: publicUrl.publicUrl, storage_path: storagePath, alt_text: files.length > 1 ? `${alt} — view ${index + 1}` : alt, sort_order: 100 + index, is_primary: !retainedPrimaryImageId && index === 0 });
    if (imageError) return { ok: false, message: imageError.message };
  }

  revalidatePath("/"); revalidatePath("/shop"); revalidatePath(`/products/${value.slug}`); revalidatePath("/admin");
  return { ok: true, message: value.publicationStatus === "published" ? "Product saved and published." : "Product saved." };
}

export async function archiveProductAction(formData: FormData) {
  const id = z.string().min(2).parse(formData.get("id"));
  const { supabase } = await requireOwner();
  await supabase.from("products").update({ publication_status: "archived" }).eq("id", id);
  revalidatePath("/"); revalidatePath("/shop"); revalidatePath("/admin");
}

const categorySchema = z.object({ name: z.string().trim().min(2).max(60), slug: slugSchema, description: z.string().trim().min(5).max(240), sortOrder: z.coerce.number().int().min(0).max(1000) });
export async function saveCategoryAction(formData: FormData) {
  const value = categorySchema.parse({ name: formData.get("name"), slug: formData.get("slug"), description: formData.get("description"), sortOrder: formData.get("sortOrder") || 0 });
  const { supabase } = await requireOwner();
  await supabase.from("categories").upsert({ id: `cat-${value.slug}`, name: value.name, slug: value.slug, description: value.description, sort_order: value.sortOrder, active: true }, { onConflict: "id" });
  revalidatePath("/admin"); revalidatePath("/shop");
}

const promotionSchema = z.object({ id: z.string().optional(), title: z.string().trim().min(2).max(100), slug: slugSchema, subtitle: z.string().trim().min(2).max(120), description: z.string().trim().min(10).max(400), priceLabel: z.string().trim().min(2).max(120), status: z.enum(["draft", "published", "archived"]), sortOrder: z.coerce.number().int().min(0).max(1000), startsAt: z.string(), endsAt: z.string() });
export async function savePromotionAction(_previous: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const parsed = promotionSchema.safeParse({ id: formData.get("id") || undefined, title: formData.get("title"), slug: formData.get("slug"), subtitle: formData.get("subtitle"), description: formData.get("description"), priceLabel: formData.get("priceLabel"), status: formData.get("status"), sortOrder: formData.get("sortOrder") || 0, startsAt: formData.get("startsAt") || "", endsAt: formData.get("endsAt") || "" });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message || "Review the promotion details." };
  const value = parsed.data;
  if (value.startsAt && value.endsAt && new Date(value.startsAt) >= new Date(value.endsAt)) return { ok: false, message: "The end date must be after the start date." };
  const { supabase } = await requireOwner();
  const { error } = await supabase.from("promotions").upsert({ id: value.id || `promo-${randomUUID()}`, title: value.title, slug: value.slug, subtitle: value.subtitle, description: value.description, price_label: value.priceLabel, product_ids: formData.getAll("productIds").map(String), starts_at: value.startsAt || null, ends_at: value.endsAt || null, publication_status: value.status, sort_order: value.sortOrder });
  if (error) return { ok: false, message: error.message };
  revalidatePath("/"); revalidatePath("/admin/promotions");
  return { ok: true, message: "Promotion saved." };
}

export async function signOutAction() {
  const { supabase } = await requireOwner();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function setProductStockAction(formData: FormData) {
  const id = z.string().min(2).parse(formData.get("id"));
  const stockStatus = z.enum(["in_stock", "low_stock", "out_of_stock"]).parse(formData.get("stockStatus")) as StockStatus;
  const { supabase } = await requireOwner();
  await supabase.from("products").update({ stock_status: stockStatus }).eq("id", id);
  revalidatePath("/"); revalidatePath("/shop"); revalidatePath("/admin");
}
