export interface Application {
  id: number;
  name: string;
  url: string;
  icon?: string;
  // This will represent the sort order of the application within a category
  order: number;
}

export interface Category {
  id:number;
  name: string;
  description?: string;
  icon?: string;
  enabled: boolean;
  // This will represent the sort order of the category on the dashboard
  order: number;
  applicationSortMode?: 'CUSTOM' | 'ALPHABETICAL';
  applications: Application[];
}