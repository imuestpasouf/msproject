export type StatutCommande =
  | 'en_attente_paiement'
  | 'paiement_recu'
  | 'validee'
  | 'en_preparation'
  | 'expediee'
  | 'livree'
  | 'annulee'
  | 'remboursee'

export interface Product {
  id: string
  ordre: number | null
  nom: string
  ref: string
  collection: string | null
  prix: number
  reduction: number | null
  prix_reduc: number | null
  mention: string | null
  stock: number
  boitier: string | null
  materiau: string | null
  bracelet: string | null
  fermoir: string | null
  lunette: string | null
  fond: string | null
  cadran: string | null
  aiguilles: string | null
  verre: string | null
  mouvement: string | null
  resistance: string | null
  sku: string | null
  description: string | null
  photo_principale: string | null
  photo_2: string | null
  photo_3: string | null
  photo_4: string | null
  photo_5: string | null
  actif: boolean
  created_at: string
}

export interface Order {
  id: string
  order_ref: string
  statut: StatutCommande
  product_id: string | null
  quantite: number
  prix_total: number
  client_prenom: string
  client_nom: string
  client_email: string
  client_tel: string
  livraison_adresse: string
  livraison_ville: string
  livraison_code_postal: string | null
  livraison_instructions: string | null
  paiement_statut: string | null
  paiement_methode: string | null
  paiement_ref: string | null
  suivi_numero: string | null
  suivi_lien: string | null
  notes_commercial: string | null
  traite_le: string | null
  expedie_le: string | null
  created_at: string
}

export interface SiteImage {
  id: string
  cle: string
  url: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      products: {
        Row: Product
        Insert: Omit<Product, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<Product, 'id' | 'created_at'>>
      }
      orders: {
        Row: Order
        Insert: Omit<Order, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<Order, 'id' | 'created_at'>>
      }
      site_images: {
        Row: SiteImage
        Insert: Omit<SiteImage, 'id' | 'updated_at'> & {
          id?: string
          updated_at?: string
        }
        Update: Partial<Omit<SiteImage, 'id'>>
      }
    }
    Enums: {
      statut_commande: StatutCommande
    }
  }
}
