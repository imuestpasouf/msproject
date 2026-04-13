-- ============================================================
-- D1 Milano Maroc — Schéma Supabase
-- ============================================================

-- Enum statut commande
CREATE TYPE statut_commande AS ENUM (
  'en_attente_paiement',
  'paiement_recu',
  'validee',
  'en_preparation',
  'expediee',
  'livree',
  'annulee',
  'remboursee'
);

-- ============================================================
-- TABLE : products
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ordre            INTEGER,
  nom              TEXT NOT NULL,
  ref              TEXT NOT NULL UNIQUE,
  collection       TEXT,
  prix             NUMERIC(10, 2) NOT NULL CHECK (prix >= 0),
  reduction        NUMERIC(5, 2) CHECK (reduction >= 0 AND reduction <= 100),
  prix_reduc       NUMERIC(10, 2) CHECK (prix_reduc >= 0),
  mention          TEXT,
  stock            INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  boitier          TEXT,
  materiau         TEXT,
  bracelet         TEXT,
  fermoir          TEXT,
  lunette          TEXT,
  fond             TEXT,
  cadran           TEXT,
  aiguilles        TEXT,
  verre            TEXT,
  mouvement        TEXT,
  resistance       TEXT,
  sku              TEXT UNIQUE,
  description      TEXT,
  photo_principale TEXT,
  photo_2          TEXT,
  photo_3          TEXT,
  photo_4          TEXT,
  photo_5          TEXT,
  actif            BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_actif    ON products (actif);
CREATE INDEX idx_products_ordre    ON products (ordre);
CREATE INDEX idx_products_collection ON products (collection);

-- ============================================================
-- TABLE : orders
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_ref               TEXT NOT NULL UNIQUE,
  statut                  statut_commande NOT NULL DEFAULT 'en_attente_paiement',
  product_id              UUID REFERENCES products(id) ON DELETE SET NULL,
  quantite                INTEGER NOT NULL DEFAULT 1 CHECK (quantite > 0),
  prix_total              NUMERIC(10, 2) NOT NULL CHECK (prix_total >= 0),
  client_prenom           TEXT NOT NULL,
  client_nom              TEXT NOT NULL,
  client_email            TEXT NOT NULL,
  client_tel              TEXT NOT NULL,
  livraison_adresse       TEXT NOT NULL,
  livraison_ville         TEXT NOT NULL,
  livraison_code_postal   TEXT,
  livraison_instructions  TEXT,
  paiement_statut         TEXT,
  paiement_methode        TEXT,
  paiement_ref            TEXT,
  suivi_numero            TEXT,
  suivi_lien              TEXT,
  notes_commercial        TEXT,
  traite_le               TIMESTAMPTZ,
  expedie_le              TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_statut     ON orders (statut);
CREATE INDEX idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX idx_orders_product_id ON orders (product_id);
CREATE INDEX idx_orders_client_email ON orders (client_email);

-- ============================================================
-- TABLE : site_images
-- ============================================================
CREATE TABLE IF NOT EXISTS site_images (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cle        TEXT NOT NULL UNIQUE,
  url        TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;

-- Products : lecture publique, écriture admin uniquement
CREATE POLICY "products_select_public"
  ON products FOR SELECT
  USING (actif = true);

CREATE POLICY "products_all_admin"
  ON products FOR ALL
  USING (auth.role() = 'authenticated');

-- Orders : pas de lecture publique — admin seulement
CREATE POLICY "orders_all_admin"
  ON orders FOR ALL
  USING (auth.role() = 'authenticated');

-- Orders : insert public (passage de commande sans compte)
CREATE POLICY "orders_insert_public"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Site images : lecture publique, écriture admin
CREATE POLICY "site_images_select_public"
  ON site_images FOR SELECT
  USING (true);

CREATE POLICY "site_images_all_admin"
  ON site_images FOR ALL
  USING (auth.role() = 'authenticated');
