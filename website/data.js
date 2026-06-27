// Brew & Bloom Premium Menu Data
// All image URLs verified working (Unsplash CDN)

(function () {
  const CATEGORIES = [
    { id: 'pizza',      name: 'Pizza',       emoji: '🍕' },
    { id: 'burgers',    name: 'Burgers',     emoji: '🍔' },
    { id: 'sandwiches', name: 'Sandwiches',  emoji: '🥪' },
    { id: 'pasta',      name: 'Pasta',       emoji: '🍝' },
    { id: 'noodles',    name: 'Noodles',     emoji: '🍜' },
    { id: 'fries',      name: 'Fries',       emoji: '🍟' },
    { id: 'drinks',     name: 'Drinks',      emoji: '🥤' },
    { id: 'coffee',     name: 'Coffee',      emoji: '☕' },
    { id: 'desserts',   name: 'Desserts',    emoji: '🍰' },
    { id: 'combos',     name: 'Combo Meals', emoji: '🍱' }
  ];

  const DISHES = [

    // ── Pizza ──────────────────────────────────────────────────────
    {
      id: 'p1',
      categoryId: 'pizza',
      name: 'Truffle Margherita Pizza',
      price: 449, rating: 4.8, timeMin: 18, discountPct: 15,
      veg: true, bestseller: true,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'p2',
      categoryId: 'pizza',
      name: 'Peri-Peri Chicken Supreme',
      price: 549, rating: 4.7, timeMin: 22, discountPct: 10,
      veg: false, bestseller: false,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80'
    },

    // ── Burgers ────────────────────────────────────────────────────
    {
      id: 'b1',
      categoryId: 'burgers',
      name: 'Smash Signature Burger',
      price: 399, rating: 4.8, timeMin: 14, discountPct: 12,
      veg: false, bestseller: true,
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'b2',
      categoryId: 'burgers',
      name: 'Creamy Jalapeño Veg Burger',
      price: 329, rating: 4.6, timeMin: 13, discountPct: 8,
      veg: true, bestseller: false,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80'
    },

    // ── Sandwiches ─────────────────────────────────────────────────
    {
      id: 's1',
      categoryId: 'sandwiches',
      name: 'Roasted Veg & Pesto Panini',
      price: 289, rating: 4.7, timeMin: 12, discountPct: 0,
      veg: true, bestseller: true,
      image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 's2',
      categoryId: 'sandwiches',
      name: 'Chicken Alfredo Sandwich',
      price: 349, rating: 4.6, timeMin: 14, discountPct: 5,
      veg: false, bestseller: false,
      image: 'https://images.unsplash.com/photo-1567234669003-dce7a7a88821?auto=format&fit=crop&w=800&q=80'
    },

    // ── Pasta ──────────────────────────────────────────────────────
    {
      id: 'pa1',
      categoryId: 'pasta',
      name: 'Creamy Garlic Alfredo',
      price: 429, rating: 4.8, timeMin: 20, discountPct: 10,
      veg: true, bestseller: true,
      image: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'pa2',
      categoryId: 'pasta',
      name: 'Italian Spicy Arrabbiata',
      price: 459, rating: 4.7, timeMin: 22, discountPct: 0,
      veg: false, bestseller: false,
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=800&q=80'
    },

    // ── Noodles ────────────────────────────────────────────────────
    {
      id: 'n1',
      categoryId: 'noodles',
      name: 'Chili Garlic Schezwan Noodles',
      price: 339, rating: 4.6, timeMin: 16, discountPct: 12,
      veg: false, bestseller: true,
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'n2',
      categoryId: 'noodles',
      name: 'Veg Stir-Fry Noodles',
      price: 319, rating: 4.5, timeMin: 15, discountPct: 0,
      veg: true, bestseller: false,
      image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=800&q=80'
    },

    // ── Fries ──────────────────────────────────────────────────────
    {
      id: 'f1',
      categoryId: 'fries',
      name: 'Truffle Parmesan Fries',
      price: 199, rating: 4.8, timeMin: 8, discountPct: 15,
      veg: true, bestseller: true,
      image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'f2',
      categoryId: 'fries',
      name: 'Peri-Peri Crunch Fries',
      price: 189, rating: 4.6, timeMin: 8, discountPct: 0,
      veg: true, bestseller: false,
      image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=800&q=80'
    },

    // ── Drinks ─────────────────────────────────────────────────────
    {
      id: 'd1',
      categoryId: 'drinks',
      name: 'Citrus Iced Tea',
      price: 179, rating: 4.7, timeMin: 6, discountPct: 10,
      veg: true, bestseller: false,
      image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'd2',
      categoryId: 'drinks',
      name: 'Berry Fizz Soda',
      price: 189, rating: 4.6, timeMin: 6, discountPct: 0,
      veg: true, bestseller: true,
      image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&q=80'
    },

    // ── Coffee ─────────────────────────────────────────────────────
    {
      id: 'c1',
      categoryId: 'coffee',
      name: 'Hazelnut Latte',
      price: 279, rating: 4.9, timeMin: 7, discountPct: 12,
      veg: true, bestseller: true,
      image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'c2',
      categoryId: 'coffee',
      name: 'Espresso Con Panna',
      price: 249, rating: 4.7, timeMin: 5, discountPct: 0,
      veg: true, bestseller: false,
      image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80'
    },

    // ── Desserts ───────────────────────────────────────────────────
    {
      id: 'de1',
      categoryId: 'desserts',
      name: 'Salted Caramel Cheesecake',
      price: 349, rating: 4.8, timeMin: 10, discountPct: 15,
      veg: true, bestseller: true,
      image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'de2',
      categoryId: 'desserts',
      name: 'Choco Lava Cake',
      price: 319, rating: 4.7, timeMin: 12, discountPct: 0,
      veg: true, bestseller: false,
      image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=800&q=80'
    },

    // ── Combos ─────────────────────────────────────────────────────
    {
      id: 'co1',
      categoryId: 'combos',
      name: 'Coffee & Fries Combo',
      price: 469, rating: 4.8, timeMin: 15, discountPct: 18,
      veg: true, bestseller: true,
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'co2',
      categoryId: 'combos',
      name: 'Burger + Shake Duo',
      price: 579, rating: 4.7, timeMin: 18, discountPct: 12,
      veg: false, bestseller: false,
      image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=800&q=80'
    }

  ];

  window.BREWBLOOM_CATEGORIES = CATEGORIES;
  window.BREWBLOOM_DISHES     = DISHES;
})();
