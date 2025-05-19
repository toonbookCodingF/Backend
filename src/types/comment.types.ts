// Définit la structure des données d'un commentaire
// Permet des commentaires sur le contenu d'un livre ou sur un chapitre spécifique
export interface CommentProps {
    id?: number;                    // Identifiant unique du commentaire
    bookContent_id?: number;        // ID du contenu commenté (optionnel)
    chapter_id?: number;            // ID du chapitre commenté (optionnel)
    user_id: number;                // ID de l'utilisateur qui a posté le commentaire
    content: string;                // Contenu textuel du commentaire
    parentComment_id?: number;      // ID du commentaire parent pour les réponses
    like?: number;                  // Nombre de likes du commentaire
    createdAt?: Date;               // Date de création du commentaire
    visible?: boolean;              // État de visibilité du commentaire
} 