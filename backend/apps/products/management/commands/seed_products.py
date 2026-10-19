from decimal import Decimal
from django.core.management.base import BaseCommand
from apps.products.models import Category, Subcategory, Product, ProductImage


class Command(BaseCommand):
    """
    Seeds initial authentic Indian Bazar catalog with categories, subcategories,
    detailed products, pricing, stock, and high-resolution Unsplash images.
    Usage:
        python manage.py seed_products
    """
    help = 'Populates the database with authentic Indian Bazar products'

    def handle(self, *args, **options):
        self.stdout.write("Seeding Indian Bazar product catalog...")

        data = [
            {
                "category": {
                    "name": "Ethnic & Festive Wear",
                    "slug": "ethnic-wear",
                    "description": "Handcrafted sarees, kurtas, lehengas, and royal festive attire.",
                    "image_url": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
                    "is_featured": True,
                    "order": 1,
                },
                "subcategories": [
                    {"name": "Sarees", "slug": "sarees", "description": "Silk, Georgette & Handloom Sarees"},
                    {"name": "Kurtas & Sets", "slug": "kurtas", "description": "Men & Women Designer Kurtas"},
                ],
                "products": [
                    {
                        "title": "Authentic Pure Silk Banarasi Saree (Royal Crimson & Zari Weave)",
                        "sku": "IB-ETH-001",
                        "subcategory_slug": "sarees",
                        "price": Decimal("6999.00"),
                        "discount_price": Decimal("4899.00"),
                        "stock_quantity": 25,
                        "unit": "piece",
                        "origin_region": "Varanasi, Uttar Pradesh",
                        "short_description": "Exquisite handwoven Banarasi Katan silk saree featuring intricate floral metallic zari motifs and matching unstitched blouse piece.",
                        "description": "Woven with precision by master artisans in Varanasi, this Pure Katan Silk Saree is the epitome of timeless Indian heritage. Finished with pure golden zari work across the pallu and border, making it ideal for weddings, Diwali, and royal occasions.",
                        "is_featured": True,
                        "images": [
                            {
                                "url": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
                                "alt_text": "Pure Silk Banarasi Saree in Crimson Red",
                                "is_primary": True,
                            },
                            {
                                "url": "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
                                "alt_text": "Close up of Banarasi zari weave",
                                "is_primary": False,
                            }
                        ]
                    },
                    {
                        "title": "Handcrafted Chikankari Cotton Kurta (Lucknowi Embroidered)",
                        "sku": "IB-ETH-002",
                        "subcategory_slug": "kurtas",
                        "price": Decimal("2499.00"),
                        "discount_price": Decimal("1799.00"),
                        "stock_quantity": 40,
                        "unit": "piece",
                        "origin_region": "Lucknow, Uttar Pradesh",
                        "short_description": "Breathable 100% fine mulmul cotton kurta with authentic shadow-work Chikankari hand embroidery.",
                        "description": "Made with artisanal care in Lucknow, this handcrafted kurta features delicate floral needlework on soft, breathable cotton. Pairs gracefully with pajama or denim for festive gatherings and casual celebrations.",
                        "is_featured": True,
                        "images": [
                            {
                                "url": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
                                "alt_text": "Lucknowi Chikankari Kurta",
                                "is_primary": True,
                            }
                        ]
                    }
                ]
            },
            {
                "category": {
                    "name": "Handground Spices & Grocery",
                    "slug": "spices-grocery",
                    "description": "Farm-fresh, non-irradiated organic spices direct from Indian growers.",
                    "image_url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80",
                    "is_featured": True,
                    "order": 2,
                },
                "subcategories": [
                    {"name": "Whole Spices", "slug": "whole-spices", "description": "Sun-dried natural spices"},
                    {"name": "Herbs & Saffron", "slug": "saffron-herbs", "description": "GI-tagged premium aromatics"},
                ],
                "products": [
                    {
                        "title": "Pure Grade-A+ Kashmiri Saffron / Kesar (5 Grams Authentic Mongra)",
                        "sku": "IB-SPC-001",
                        "subcategory_slug": "saffron-herbs",
                        "price": Decimal("1999.00"),
                        "discount_price": Decimal("1599.00"),
                        "stock_quantity": 50,
                        "unit": "5g box",
                        "origin_region": "Pampore, Kashmir",
                        "short_description": "GI Tagged 100% pure Kashmiri Mongra saffron with deep crimson stigmas and rich golden aroma.",
                        "description": "Harvested from the high valleys of Pampore, Kashmir, this saffron is renowned for its high crocin content, exquisite fragrance, and intense natural golden-orange color. Ideal for biryanis, kheer, and daily health wellness.",
                        "is_featured": True,
                        "images": [
                            {
                                "url": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80",
                                "alt_text": "Authentic Kashmiri Mongra Saffron",
                                "is_primary": True,
                            }
                        ]
                    },
                    {
                        "title": "Malabar Tellicherry Whole Black Pepper (500g Aromatic)",
                        "sku": "IB-SPC-002",
                        "subcategory_slug": "whole-spices",
                        "price": Decimal("650.00"),
                        "discount_price": Decimal("499.00"),
                        "stock_quantity": 80,
                        "unit": "500g pouch",
                        "origin_region": "Wayanad, Kerala",
                        "short_description": "Hand-sorted Tellicherry extra-bold peppercorns delivering bold pungency and woody citrus notes.",
                        "description": "Tellicherry peppercorns are left on the vine longer to mature into rich, fragrant berries. Sourced sustainably from Wayanad rainforests.",
                        "is_featured": False,
                        "images": [
                            {
                                "url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80",
                                "alt_text": "Tellicherry Black Pepper",
                                "is_primary": True,
                            }
                        ]
                    }
                ]
            },
            {
                "category": {
                    "name": "Artisan Handicrafts & Decor",
                    "slug": "handicrafts",
                    "description": "Centuries-old metalwork, clay pottery, and living room heritage decor.",
                    "image_url": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
                    "is_featured": True,
                    "order": 3,
                },
                "subcategories": [
                    {"name": "Brass Crafts", "slug": "brass-crafts", "description": "Hand-cast brass idols & lamps"},
                ],
                "products": [
                    {
                        "title": "Traditional Handmade Brass Peacock Diya (Antique Gold Finish)",
                        "sku": "IB-HND-001",
                        "subcategory_slug": "brass-crafts",
                        "price": Decimal("1499.00"),
                        "discount_price": Decimal("999.00"),
                        "stock_quantity": 30,
                        "unit": "piece",
                        "origin_region": "Moradabad, Uttar Pradesh",
                        "short_description": "Solid brass oil lamp crafted by generational metalsmiths, finished with warm antique patina.",
                        "description": "Bring sacred warmth and majestic artistry to your home puja room or living space with this heavy solid brass diya featuring a crowning peacock motif.",
                        "is_featured": True,
                        "images": [
                            {
                                "url": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
                                "alt_text": "Traditional Brass Peacock Diya",
                                "is_primary": True,
                            }
                        ]
                    }
                ]
            },
            {
                "category": {
                    "name": "Premium Dry Fruits & Nuts",
                    "slug": "dry-fruits",
                    "description": "Natural, unpolished healthy nuts packed with nutrients.",
                    "image_url": "https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=800&q=80",
                    "is_featured": True,
                    "order": 4,
                },
                "subcategories": [
                    {"name": "Almonds & Cashews", "slug": "almonds-cashews", "description": "Royal dry fruits"},
                ],
                "products": [
                    {
                        "title": "Royal Kashmiri Mamra Almonds / Giri (1 Kg Vacuum Packed)",
                        "sku": "IB-DFR-001",
                        "subcategory_slug": "almonds-cashews",
                        "price": Decimal("3200.00"),
                        "discount_price": Decimal("2550.00"),
                        "stock_quantity": 45,
                        "unit": "1kg pack",
                        "origin_region": "Kashmir Valley",
                        "short_description": "Natural organic Mamra Badam rich in oil content and natural crunch with zero chemical polish.",
                        "description": "Mamra almonds contain up to 50% natural almond oil. Handpicked in Kashmir, our almonds are 100% natural and sugar-free.",
                        "is_featured": True,
                        "images": [
                            {
                                "url": "https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=800&q=80",
                                "alt_text": "Kashmiri Mamra Almonds",
                                "is_primary": True,
                            }
                        ]
                    }
                ]
            }
        ]

        total_products_created = 0

        for cat_data in data:
            cat_info = cat_data["category"]
            category, _ = Category.objects.get_or_create(
                slug=cat_info["slug"],
                defaults={
                    "name": cat_info["name"],
                    "description": cat_info["description"],
                    "image_url": cat_info["image_url"],
                    "is_featured": cat_info["is_featured"],
                    "order": cat_info["order"],
                }
            )

            # Subcategories
            subcat_map = {}
            for sub_info in cat_data.get("subcategories", []):
                subcat, _ = Subcategory.objects.get_or_create(
                    category=category,
                    slug=sub_info["slug"],
                    defaults={
                        "name": sub_info["name"],
                        "description": sub_info["description"]
                    }
                )
                subcat_map[sub_info["slug"]] = subcat

            # Products
            for prod_info in cat_data.get("products", []):
                subcategory = subcat_map.get(prod_info.get("subcategory_slug"))
                product, created = Product.objects.get_or_create(
                    sku=prod_info["sku"],
                    defaults={
                        "title": prod_info["title"],
                        "category": category,
                        "subcategory": subcategory,
                        "price": prod_info["price"],
                        "discount_price": prod_info["discount_price"],
                        "stock_quantity": prod_info["stock_quantity"],
                        "unit": prod_info["unit"],
                        "origin_region": prod_info["origin_region"],
                        "short_description": prod_info["short_description"],
                        "description": prod_info["description"],
                        "is_featured": prod_info["is_featured"],
                    }
                )

                if created:
                    total_products_created += 1
                    for img_idx, img_info in enumerate(prod_info.get("images", [])):
                        ProductImage.objects.create(
                            product=product,
                            image_url=img_info["url"],
                            alt_text=img_info["alt_text"],
                            is_primary=img_info["is_primary"],
                            order=img_idx
                        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully seeded Indian Bazar catalog! Created {total_products_created} new products across {Category.objects.count()} categories."
            )
        )
