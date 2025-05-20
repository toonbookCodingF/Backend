export interface MyReading {
    id: number;
    user_id: number;
    book_id: number;
    createdat: Date;
    isverified: boolean;
}

export interface CreateMyReadingDTO {
    user_id: number;
    book_id: number;
}

export interface UpdateMyReadingDTO {
    isverified: boolean;
} 