// Définit la structure des données d'un livre
// Utilise un tableau de catégories pour permettre plusieurs catégories par livre
export interface BookProps {
    id?: number;                    // Identifiant unique du livre (optionnel pour la création)
    title: string;                  // Titre du livre
    description: string;            // Description détaillée du livre
    cover: string;                  // URL de l'image de couverture
    user_id: number;                // ID de l'utilisateur qui a créé le livre
    status: string;                 // État du livre (draft, published, etc.)
    categories?: number[];          // Tableau des IDs des catégories du livre
    booktype_id: number;            // Type de livre (roman, BD, manga, etc.)
    createdat?: Date;               // Date de création du livre
} 