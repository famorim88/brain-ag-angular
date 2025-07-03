export interface CultureCreate {
  crop_year: string;
  name: string;
}

export interface CultureResponse extends CultureCreate {
  id: number;
  producer_id: number;
}

export interface ProducerCreate {
  cpf_cnpj: string;
  name: string;
  farm_name: string;
  city: string;
  state: string;
  total_area: number;
  agricultural_area: number;
  vegetation_area: number;
  cultures?: CultureCreate[]; // Optional for creation, as they can be added later
}

export interface ProducerUpdate {
  name?: string;
  farm_name?: string;
  city?: string;
  state?: string;
  total_area?: number;
  agricultural_area?: number;
  vegetation_area?: number;
  cultures?: CultureCreate[]; // Optional for update, cultures are managed separately
}

export interface ProducerResponse {
  id: number;
  cpf_cnpj: string;
  name: string;
  farm_name: string;
  city: string;
  state: string;
  total_area: number;
  agricultural_area: number;
  vegetation_area: number;
  cultures: CultureResponse[]; // Cultures will come with IDs from the backend
  created_at: string;
  updated_at: string;
}

// Interface for form data that might temporarily hold cultures without backend IDs
export interface ProducerFormData {
  cpf_cnpj: string;
  name: string;
  farm_name: string;
  city: string;
  state: string;
  total_area: number;
  agricultural_area: number;
  vegetation_area: number;
  cultures: (CultureCreate | CultureResponse)[]; // Can hold both new and existing cultures
}