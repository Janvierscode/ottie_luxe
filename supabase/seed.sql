insert into public.categories (id, name, slug, description, sort_order, active) values
('cat-perfumes', 'Perfumes', 'perfumes', 'Elegant fragrances for every mood, moment and signature style.', 1, true),
('cat-earrings', 'Earrings', 'earrings', 'Polished hoops and statement pairs that finish every look.', 2, true),
('cat-necklaces', 'Necklaces', 'necklaces', 'Delicate and expressive necklaces made for effortless layering.', 3, true),
('cat-bracelets', 'Bracelets', 'bracelets', 'Charming finishing touches with a graceful everyday glow.', 4, true),
('cat-rings', 'Rings', 'rings', 'Simple statement rings designed for mixing and matching.', 5, true),
('cat-gift-sets', 'Gift Sets', 'gift-sets', 'Thoughtful fragrance and jewellery pairings for beautiful occasions.', 6, true)
on conflict (id) do update set name = excluded.name, slug = excluded.slug, description = excluded.description, sort_order = excluded.sort_order, active = excluded.active;

insert into public.products (id, slug, name, category_id, description, long_description, price_cents, old_price_cents, badge, featured, is_new, publication_status, stock_status, sort_order) values
('signature-bloom', 'womens-signature-perfume', 'Women''s Signature Perfume', 'cat-perfumes', 'A polished, feminine fragrance for confident everyday wear.', 'An easy signature scent chosen for graceful everyday wear, with a refined finish that moves beautifully from daytime plans to evening moments.', 1800, null, 'Popular', true, false, 'published', 'in_stock', 1),
('vanilla-cloud', 'sweet-vanilla-fragrance', 'Sweet Vanilla Fragrance', 'cat-perfumes', 'Warm, creamy and sweet—an easy scent for day or night.', 'A cosy vanilla-led fragrance with a smooth, inviting character, selected for relaxed days and soft evening looks.', 1500, 1800, 'Sale', true, false, 'published', 'low_stock', 2),
('floral-muse', 'floral-muse-perfume', 'Floral Muse Perfume', 'cat-perfumes', 'A light floral scent with a soft, modern finish.', 'Fresh floral notes meet a clean modern finish in this bright, feminine fragrance selected for effortless daily confidence.', 1700, null, 'New', true, true, 'published', 'in_stock', 3),
('midnight-luxe', 'luxury-inspired-fragrance', 'Luxury Inspired Fragrance', 'cat-perfumes', 'A deeper, sophisticated scent for evenings and occasions.', 'A confident, evening-ready fragrance with a richer profile and a polished dry-down.', 2200, null, 'Popular', true, false, 'published', 'in_stock', 4),
('gold-drop-earrings', 'gold-tone-drop-earrings', 'Gold-Tone Drop Earrings', 'cat-earrings', 'Elegant statement earrings with an easy golden glow.', 'A graceful drop silhouette with a warm gold-tone finish, selected to add a polished statement.', 800, null, 'New', true, true, 'published', 'in_stock', 5),
('classic-hoops', 'classic-hoop-earrings', 'Classic Hoop Earrings', 'cat-earrings', 'A versatile everyday pair that works with every look.', 'Clean, flattering hoops made for repeat wear, available in finishes to suit your jewellery mood.', 600, 800, 'Sale', true, false, 'published', 'in_stock', 6),
('delicate-necklace', 'elegant-layering-necklace', 'Elegant Layering Necklace', 'cat-necklaces', 'A delicate piece designed to shine alone or layered.', 'A refined necklace with a delicate profile that feels complete on its own and layers beautifully.', 1200, null, 'Popular', true, false, 'published', 'in_stock', 7),
('charm-bracelet', 'everyday-charm-bracelet', 'Everyday Charm Bracelet', 'cat-bracelets', 'A playful polished bracelet for a touch of personality.', 'A light, charming bracelet selected to bring personality and movement to everyday outfits.', 1000, null, 'New', true, true, 'published', 'low_stock', 8),
('stacking-ring', 'minimal-fashion-ring', 'Minimal Fashion Ring', 'cat-rings', 'A simple statement ring made for mixing and matching.', 'A sleek fashion ring with a clean silhouette. Wear it alone or combine it with favourites.', 700, null, 'New', false, true, 'published', 'in_stock', 9),
('luxe-gift-set', 'jewellery-perfume-gift-set', 'Jewellery & Perfume Gift Set', 'cat-gift-sets', 'A ready-to-delight pairing for celebrations and surprises.', 'A thoughtful Ottie Luxe pairing presented for gifting. Confirm current choices on WhatsApp.', 2800, 3300, 'Popular', true, false, 'published', 'in_stock', 10)
on conflict (id) do update set slug = excluded.slug, name = excluded.name, category_id = excluded.category_id, description = excluded.description, long_description = excluded.long_description, price_cents = excluded.price_cents, old_price_cents = excluded.old_price_cents, badge = excluded.badge, featured = excluded.featured, is_new = excluded.is_new, publication_status = excluded.publication_status, stock_status = excluded.stock_status, sort_order = excluded.sort_order;

delete from public.product_options where product_id in ('signature-bloom', 'classic-hoops', 'stacking-ring');
delete from public.product_variants where product_id in ('signature-bloom', 'classic-hoops', 'stacking-ring');
insert into public.product_options (id, product_id, name, values, sort_order) values
('option-signature-size', 'signature-bloom', 'Size', '["30 ml", "50 ml"]', 1),
('option-hoops-finish', 'classic-hoops', 'Finish', '["Gold tone", "Silver tone"]', 1),
('option-ring-size', 'stacking-ring', 'Size', '["6", "7", "8"]', 1);
insert into public.product_variants (id, product_id, label, option_values, price_cents, stock_status, active) values
('variant-signature-30', 'signature-bloom', '30 ml', '{"Size":"30 ml"}', null, 'in_stock', true),
('variant-signature-50', 'signature-bloom', '50 ml', '{"Size":"50 ml"}', 2400, 'low_stock', true),
('variant-hoops-gold', 'classic-hoops', 'Gold tone', '{"Finish":"Gold tone"}', null, 'in_stock', true),
('variant-hoops-silver', 'classic-hoops', 'Silver tone', '{"Finish":"Silver tone"}', null, 'low_stock', true),
('variant-ring-6', 'stacking-ring', 'Size 6', '{"Size":"6"}', null, 'in_stock', true),
('variant-ring-7', 'stacking-ring', 'Size 7', '{"Size":"7"}', null, 'low_stock', true),
('variant-ring-8', 'stacking-ring', 'Size 8', '{"Size":"8"}', null, 'out_of_stock', true);

insert into public.promotions (id, slug, title, subtitle, description, price_label, product_ids, publication_status, sort_order) values
('promo-duo', 'ottie-duo', 'The Ottie Duo', 'Perfume + Earrings', 'Pair a signature scent with an elegant finishing touch.', 'Ask for the current duo price', '["signature-bloom", "gold-drop-earrings"]', 'published', 1),
('promo-birthday', 'birthday-luxe-box', 'Birthday Luxe Box', 'Perfume + Jewellery + Gift Packaging', 'A celebration-ready combination made to feel extra special.', 'Customise your box on WhatsApp', '["luxe-gift-set"]', 'published', 2),
('promo-bestie', 'bestie-bundle', 'Bestie Bundle', 'Two favourites, one special price', 'Choose selected fragrances or accessories for you and your favourite person.', 'Message us for available combinations', '["vanilla-cloud", "classic-hoops"]', 'published', 3)
on conflict (id) do update set title = excluded.title, subtitle = excluded.subtitle, description = excluded.description, price_label = excluded.price_label, product_ids = excluded.product_ids, publication_status = excluded.publication_status, sort_order = excluded.sort_order;

-- After creating the owner in Supabase Auth, provision access with:
-- insert into public.admin_profiles (user_id) values ('OWNER_AUTH_USER_UUID');
