import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Clock, Gem, Gift, HeartHandshake, Instagram, MapPin, MessageCircle, PackageCheck, ShieldCheck, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { getProducts, getPromotions, usingSeedCatalogue } from "@/lib/data";
import { buildWhatsAppUrl, SITE_CONFIG, WHATSAPP_NUMBER } from "@/lib/site-config";

export default async function HomePage() {
  const [products, promotions] = await Promise.all([getProducts(), getPromotions()]);
  const featured = products.filter((product) => product.featured).slice(0, 8);
  const newArrivals = products.filter((product) => product.isNew).slice(0, 4);
  const categoryHighlights = [
    { title: "Perfumes", slug: "perfumes", copy: "Elegant fragrances for every mood and signature style.", icon: Sparkles },
    { title: "Jewellery", slug: "jewellery", copy: "Earrings, necklaces, bracelets and rings for every look.", icon: Gem },
    { title: "Gift Sets", slug: "gift-sets", copy: "Thoughtful pairings for birthdays, milestones and just because.", icon: Gift },
  ];

  return (
    <main id="main-content">
      <section className="hero section">
        <div className="hero__orb hero__orb--one" aria-hidden="true" />
        <div className="hero__orb hero__orb--two" aria-hidden="true" />
        <div className="container hero__grid">
          <div className="hero__copy">
            <p className="eyebrow"><span /> Jewellery · Fragrance · Gifts</p>
            <h1>Wear the sparkle.<br /><em>Own the scent.</em></h1>
            <p className="hero__lead">Discover beautiful jewellery and irresistible fragrances selected to make everyday luxury feel wonderfully affordable.</p>
            <div className="hero__actions">
              <Link className="button" href="/shop">Shop collection <ArrowRight aria-hidden="true" /></Link>
              <a className="button button--secondary" href={buildWhatsAppUrl("Hi Ottie Luxe, I’d love to browse the collection and place an order.")} target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" /> Order on WhatsApp</a>
            </div>
            <ul className="hero__proof" aria-label="Shopping benefits">
              <li><Check /> Beautifully affordable</li><li><Check /> Gift-ready options</li><li><Check /> Easy ordering</li>
            </ul>
          </div>
          <div className="hero__visual">
            <div className="hero__image"><Image src="/assets/ottie-luxe-hero.webp" alt="Stylish Black woman wearing gold jewellery and holding an unbranded plum perfume bottle" fill priority unoptimized sizes="(max-width: 840px) 100vw, 48vw" /></div>
            <div className="hero-note glass-card"><Sparkles /><span><small>Curated for you</small><strong>Little luxuries, big energy.</strong></span></div>
            <div className="hero-stamp" aria-hidden="true"><small>Affordable</small><strong>LUXE</strong><small>Every day</small></div>
          </div>
        </div>
      </section>

      <section className="section category-section" aria-labelledby="categories-title">
        <div className="container">
          <div className="section-heading section-heading--split"><div><p className="eyebrow">Find your favourite</p><h2 id="categories-title">A little luxury for <em>every moment.</em></h2></div><p>Start with what feels most like you, then explore every detail before you enquire.</p></div>
          <div className="category-grid">
            {categoryHighlights.map(({ title, slug, copy, icon: Icon }, index) => (
              <Link className={`category-card category-card--${slug}`} href={`/shop?category=${slug}`} key={slug}>
                <span className="category-card__number">0{index + 1}</span><Icon aria-hidden="true" /><h3>{title}</h3><p>{copy}</p><span className="text-link">Explore {title.toLowerCase()} <ArrowRight /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section shop-preview" aria-labelledby="featured-title">
        <div className="container">
          <div className="section-heading section-heading--center"><p className="eyebrow">Shop the edit</p><h2 id="featured-title">Your next favourite is <em>right here.</em></h2><p>Browse the featured collection, save what catches your eye and build one easy WhatsApp basket.</p></div>
          {featured.length ? <div className="product-grid">{featured.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-state empty-state--inline"><PackageCheck /><h3>The new edit is being prepared</h3><p>Message us on WhatsApp for current availability.</p></div>}
          <div className="section-action"><Link className="button button--secondary" href="/shop">View the full collection <ArrowRight /></Link></div>
        </div>
      </section>

      <section className="section offers" id="offers" aria-labelledby="offers-title">
        <div className="container">
          <div className="section-heading section-heading--split section-heading--light"><div><p className="eyebrow">Made to delight</p><h2 id="offers-title">More sparkle, <em>beautifully bundled.</em></h2></div><p>Ask about available combinations and we will help you put together something special.</p></div>
          <div className="offer-grid">
            {promotions.map((promotion, index) => (
              <article className="offer-card" key={promotion.id}>
                <span className="offer-card__number">0{index + 1}</span><p>{promotion.subtitle}</p><h3>{promotion.title}</h3><p>{promotion.description}</p><strong>{promotion.priceLabel}</strong>
                <a href={buildWhatsAppUrl(`Hi Ottie Luxe, I’m interested in the ${promotion.title}. What combinations are currently available?`)} target="_blank" rel="noreferrer" data-umami-event="offer_click" data-umami-event-offer={promotion.slug}>Ask about this offer <ArrowRight /></a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section benefits" aria-labelledby="benefits-title">
        <div className="container"><div className="section-heading section-heading--center"><p className="eyebrow">Why Ottie Luxe</p><h2 id="benefits-title">Luxury that feels <em>easy.</em></h2></div>
          <div className="benefit-grid">
            {[
              [Gem, "Affordable luxury", "Beautiful finishing touches chosen with value in mind."],
              [ShieldCheck, "Carefully selected", "A focused collection with style, gifting and everyday wear in mind."],
              [MessageCircle, "Easy WhatsApp ordering", "One clear basket, one helpful conversation and no complicated checkout."],
              [Gift, "Beautiful gift options", "Thoughtful combinations for birthdays, anniversaries and milestones."],
              [HeartHandshake, "Friendly service", "Personal support when you need help choosing or confirming availability."],
              [PackageCheck, "Clear availability", "Stock states are visible and every final order is personally confirmed."],
            ].map(([Icon, title, copy]) => {
              const BenefitIcon = Icon as typeof Gem;
              return <article key={title as string}><BenefitIcon /><h3>{title as string}</h3><p>{copy as string}</p></article>;
            })}
          </div>
        </div>
      </section>

      {newArrivals.length > 0 && <section className="section arrivals" aria-labelledby="arrivals-title"><div className="container"><div className="section-heading section-heading--split"><div><p className="eyebrow">Just added</p><h2 id="arrivals-title">Meet the <em>new arrivals.</em></h2></div><Link className="text-link" href="/shop">See everything <ArrowRight /></Link></div><div className="product-grid product-grid--compact">{newArrivals.map((product) => <ProductCard key={product.id} product={product} compact />)}</div></div></section>}

      <section className="section about" id="about" aria-labelledby="about-title">
        <div className="container about__grid"><div className="about__visual"><Image src="/assets/ottie-luxe-about.webp" alt="Confident Black woman wearing elegant gold jewellery in a warm Ottie Luxe setting" fill sizes="(max-width: 840px) 100vw, 45vw" /></div><div className="about__copy"><p className="eyebrow">Our story</p><h2 id="about-title">Made for looking good, smelling good and <em>feeling confident.</em></h2><p>Ottie Luxe is a young Zimbabwean beauty and accessories brand bringing together jewellery, fragrances and thoughtful gifts for people who love style without unnecessary overspending.</p><p>Every piece is selected to make everyday moments feel more polished, personal and beautifully yours.</p><Link className="button button--secondary" href="/shop">Discover the collection <ArrowRight /></Link></div></div>
      </section>

      <section className="section testimonials" aria-labelledby="reviews-title"><div className="container"><div className="section-heading section-heading--center"><p className="eyebrow">Kind words</p><h2 id="reviews-title">Loved in the <em>little moments.</em></h2></div><div className="testimonial-grid">{[
        ["The fragrance was exactly the soft, sweet scent I wanted. Ordering was so easy.", "Tariro M."],
        ["My earrings looked even better with my outfit, and the packaging felt really special.", "Rudo K."],
        ["I needed a birthday gift quickly and got such friendly help choosing the right combination.", "Nyasha P."],
      ].map(([quote, name]) => <figure key={name}><blockquote>“{quote}”</blockquote><figcaption>{name}</figcaption></figure>)}</div></div></section>

      <section className="section order-steps" aria-labelledby="order-title"><div className="container"><div className="section-heading section-heading--center"><p className="eyebrow">Simple from start to finish</p><h2 id="order-title">How to <em>order.</em></h2></div><ol>{[
        ["Browse", "Explore the collection and open any product for details."],
        ["Choose", "Select your option and add up to ten favourites to your basket."],
        ["Send", "Add your name and preference, then send one WhatsApp enquiry."],
        ["Confirm", "We will confirm availability, payment and delivery or collection."],
      ].map(([title, copy], index) => <li key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></li>)}</ol></div></section>

      <section className="section social-section"><div className="container social-card"><div><p className="eyebrow">Stay in the loop</p><h2>Follow the <em>Ottie Luxe edit.</em></h2><p>See new arrivals, styling inspiration and current offers on our social pages.</p></div><div className="social-card__actions"><a className="button" href={SITE_CONFIG.instagramUrl} target="_blank" rel="noreferrer"><Instagram /> Follow {SITE_CONFIG.instagramHandle}</a><a className="button button--secondary" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer"><MessageCircle /> Chat on WhatsApp</a></div></div></section>

      <section className="section contact" id="contact" aria-labelledby="contact-title"><div className="container contact__grid"><div><p className="eyebrow">We would love to help</p><h2 id="contact-title">Let’s find your <em>next favourite.</em></h2><p>Ask about products, gift ideas and current availability. We will respond during business hours.</p><a className="button button--whatsapp" href={buildWhatsAppUrl("Hi Ottie Luxe, I’d like some help choosing from the collection.")} target="_blank" rel="noreferrer"><MessageCircle /> Start a WhatsApp chat</a></div><div className="contact-card glass-card"><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer"><MessageCircle /><span><small>WhatsApp</small><strong>{SITE_CONFIG.phoneDisplay}</strong></span></a><a href={`mailto:${SITE_CONFIG.email}`}><HeartHandshake /><span><small>Email</small><strong>{SITE_CONFIG.email}</strong></span></a><div><MapPin /><span><small>Service area</small><strong>{SITE_CONFIG.serviceArea}</strong></span></div><div><Clock /><span><small>Business hours</small><strong>{SITE_CONFIG.businessHours}</strong></span></div></div></div></section>

      {usingSeedCatalogue() && <p className="catalogue-mode-note">Catalogue preview data is active until the owner database is connected.</p>}
    </main>
  );
}
