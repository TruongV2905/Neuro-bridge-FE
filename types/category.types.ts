export interface CategoryResponse {
  id: number;
  categoryName: string;
  categoryDescription: string;
  createdAt: string;
  deleted: boolean;
}
export interface CategoryRequest {
  categoryName: string;
  categoryDescription: string;
}

export interface CategoryForExpertRequest {
  categoryIds: number[];
  code: string;
}