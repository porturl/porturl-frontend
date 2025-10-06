export interface Application {
  id: string;
  name: string;
  url: string;
  icon: string;
  order: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  enabled: boolean;
  order: number;
  applications: Application[];
}