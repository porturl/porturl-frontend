import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Category, Application } from '../models/data.models';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private categories: Category[] = [
    {
      id: 'media',
      name: 'Media',
      enabled: true,
      order: 1,
      applications: [
        { id: 'jellyfin', name: 'Jellyfin', url: '#', icon: 'https://cdn.worldvectorlogo.com/logos/jellyfin.svg', order: 1 },
      ],
    },
    {
      id: 'office',
      name: 'Office',
      enabled: true,
      order: 2,
      applications: [
        { id: 'wiki', name: 'Wiki', url: '#', icon: 'https://www.vectorlogo.zone/logos/js_wiki/js_wiki-icon.svg', order: 1 },
      ],
    },
    {
      id: 'hardware',
      name: 'Hardware',
      enabled: true,
      order: 3,
      applications: [
        { id: 'proxmox', name: 'Proxmox', url: '#', icon: 'https://www.vectorlogo.zone/logos/proxmox/proxmox-icon.svg', order: 1 },
        { id: 'hp-officejet', name: 'HP OfficeJet Pro 8620', url: '#', icon: 'https://i.imgur.com/AB0TAl5.png', order: 2 },
        { id: 'synology-nas', name: 'Synology nas-daten', url: '#', icon: 'https://i.imgur.com/OiyAav2.png', order: 3 },
        { id: 'synology-backup', name: 'Synology Backup', url: '#', icon: 'https://i.imgur.com/OiyAav2.png', order: 4 },
      ],
    },
    {
      id: 'photo',
      name: 'Photo',
      enabled: true,
      order: 4,
      applications: [
        { id: 'synology-photos', name: 'Synology Photos', url: '#', icon: 'https://i.imgur.com/pFk1s39.png', order: 1 },
      ],
    },
    {
      id: 'selfhosted',
      name: 'Selfhosted',
      enabled: true,
      order: 5,
      applications: [
        { id: 'portainer', name: 'Portainer', url: '#', icon: 'https://cdn.worldvectorlogo.com/logos/portainer-io.svg', order: 1 },
        { id: 'keycloak', name: 'Keycloak', url: '#', icon: 'https://www.vectorlogo.zone/logos/keycloak/keycloak-icon.svg', order: 2 },
        { id: 'guacamole', name: 'Guacamole', url: '#', icon: 'https://i.imgur.com/BAF25OL.png', order: 3 },
      ],
    },
  ];

  private categoriesSubject = new BehaviorSubject<Category[]>(this.categories);

  getCategories(): Observable<Category[]> {
    return this.categoriesSubject.asObservable();
  }

  private updateData(): void {
    // A real implementation would persist changes here
    this.categories.sort((a, b) => a.order - b.order);
    this.categories.forEach(c => c.applications.sort((a, b) => a.order - b.order));
    this.categoriesSubject.next([...this.categories]); // Emit a new array to trigger change detection
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  addCategory(category: Omit<Category, 'id' | 'order' | 'applications' | 'enabled'>): void {
    const newCategory: Category = {
      ...category,
      id: this.generateId(),
      order: this.categories.length + 1,
      applications: [],
      enabled: true,
    };
    this.categories.push(newCategory);
    this.updateData();
  }

  updateCategory(updatedCategory: Category): void {
    const index = this.categories.findIndex(c => c.id === updatedCategory.id);
    if (index > -1) {
      this.categories[index] = { ...this.categories[index], ...updatedCategory };
      this.updateData();
    }
  }

  deleteCategory(categoryId: string): void {
    this.categories = this.categories.filter(c => c.id !== categoryId);
    this.updateData();
  }

  addApplication(applicationData: Omit<Application, 'id' | 'order'>, categoryIds: string[]): void {
    // Create the new application object once to ensure it has a single unique ID.
    const newApp: Application = {
      ...applicationData,
      id: this.generateId(),
      order: 0, // Order will be set per-category by updateOrder.
    };

    // Add the same application object to all selected categories.
    categoryIds.forEach(catId => {
      const category = this.categories.find(c => c.id === catId);
      if (category) {
        category.applications.push(newApp);
        this.updateOrder(category.applications); // Recalculate order for this category.
      }
    });

    this.updateData();
  }

  updateApplication(updatedApp: Application, newCategoryIds: string[]): void {
    // First, remove the application from all categories
    this.categories.forEach(category => {
      category.applications = category.applications.filter(a => a.id !== updatedApp.id);
    });

    // Then, add the updated application to its new categories
    newCategoryIds.forEach(catId => {
      const category = this.categories.find(c => c.id === catId);
      if (category) {
        category.applications.push(updatedApp);
      }
    });

    this.updateData();
  }

  deleteApplication(categoryId: string, appId: string): void {
    const category = this.categories.find(c => c.id === categoryId);
    if (category) {
      category.applications = category.applications.filter(a => a.id !== appId);
      this.updateData();
    }
  }

  moveCategory(previousIndex: number, currentIndex: number): void {
    const [movedCategory] = this.categories.splice(previousIndex, 1);
    this.categories.splice(currentIndex, 0, movedCategory);
    this.updateOrder(this.categories);
    this.updateData();
  }

  moveApplicationInSameCategory(categoryId: string, previousIndex: number, currentIndex: number): void {
    const category = this.categories.find(c => c.id === categoryId);
    if (category) {
      const [movedApp] = category.applications.splice(previousIndex, 1);
      category.applications.splice(currentIndex, 0, movedApp);
      this.updateOrder(category.applications);
      this.updateData();
    }
  }

  moveApplicationToDifferentCategory(
    previousCategoryId: string,
    newCategoryId: string,
    previousIndex: number,
    currentIndex: number
  ): void {
    const previousCategory = this.categories.find(c => c.id === previousCategoryId);
    const newCategory = this.categories.find(c => c.id === newCategoryId);

    if (previousCategory && newCategory) {
      const [movedApp] = previousCategory.applications.splice(previousIndex, 1);
      newCategory.applications.splice(currentIndex, 0, movedApp);
      this.updateOrder(previousCategory.applications);
      this.updateOrder(newCategory.applications);
      this.updateData();
    }
  }

  private updateOrder(items: { order: number }[]): void {
    items.forEach((item, index) => {
      item.order = index + 1;
    });
  }
}