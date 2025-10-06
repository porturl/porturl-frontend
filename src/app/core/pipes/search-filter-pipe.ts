import { Pipe, PipeTransform } from '@angular/core';
import { Category, Application } from '../models/data.models';

@Pipe({
  name: 'searchFilter',
  standalone: true,
})
export class SearchFilterPipe implements PipeTransform {
  transform(categories: Category[] | null, searchTerm: string): Category[] {
    if (!categories) {
      return [];
    }
    if (!searchTerm) {
      return categories;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    return categories
      .map(category => {
        const filteredApplications = category.applications.filter(app =>
          app.name.toLowerCase().includes(lowerCaseSearchTerm)
        );

        // Return a new category object with the filtered applications
        return {
          ...category,
          applications: filteredApplications,
        };
      })
      .filter(category => category.applications.length > 0); // Only include categories that have matching apps
  }
}