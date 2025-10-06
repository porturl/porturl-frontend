import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Observable, take } from 'rxjs';
import { Application, Category } from '../../core/models/data.models';
import { DataService } from '../../core/services/data.service';
import { EditModeService } from '../../core/services/edit-mode.service';
import { SearchService } from '../../core/services/search.service';
import { CategoryDialog } from '../../dialogs/category-dialog/category-dialog';
import { ApplicationDialog } from '../../dialogs/application-dialog/application-dialog';
import { SearchFilterPipe } from '../../core/pipes/search-filter-pipe';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, DragDropModule, MatCardModule, MatIconModule, MatButtonModule, FontAwesomeModule, SearchFilterPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  public readonly dataService = inject(DataService);
  public readonly editModeService = inject(EditModeService);
  public readonly searchService = inject(SearchService);
  private readonly dialog = inject(MatDialog);

  public categories$: Observable<Category[]> = this.dataService.getCategories();

  onCategoryDrop(event: CdkDragDrop<Category[]>): void {
    this.dataService.moveCategory(event.previousIndex, event.currentIndex);
  }

  onAppDrop(event: CdkDragDrop<Application[]>): void {
    const previousContainerId = event.previousContainer.id;
    const currentContainerId = event.container.id;

    if (previousContainerId === currentContainerId) {
      // Move within the same category
      this.dataService.moveApplicationInSameCategory(
        currentContainerId,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      // Move to a different category
      this.dataService.moveApplicationToDifferentCategory(
        previousContainerId,
        currentContainerId,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  addCategory(): void {
    const dialogRef = this.dialog.open(CategoryDialog);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataService.addCategory(result);
      }
    });
  }

  addApplication(): void {
    this.categories$.pipe(take(1)).subscribe(categories => {
      const dialogRef = this.dialog.open(ApplicationDialog, {
        data: { categories },
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          const { categoryIds, ...appData } = result;
          this.dataService.addApplication(appData, categoryIds);
        }
      });
    });
  }

  getCategoryIds(categories: Category[]): string[] {
    if (!categories) {
      return [];
    }
    return categories.map(c => c.id);
  }

  editCategory(category: Category): void {
    const dialogRef = this.dialog.open(CategoryDialog, {
      data: category,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const updatedCategory: Category = { ...category, ...result };
        this.dataService.updateCategory(updatedCategory);
      }
    });
  }

  editApplication(app: Application, categoryId: string): void {
    this.categories$.pipe(take(1)).subscribe(categories => {
      const applicationCategoryIds = categories
        .filter(c => c.applications.some(a => a.id === app.id))
        .map(c => c.id);

      const dialogRef = this.dialog.open(ApplicationDialog, {
        data: {
          application: app,
          categories: categories,
          applicationCategoryIds: applicationCategoryIds,
        },
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          const { categoryIds, ...appData } = result;
          const updatedApp: Application = { ...app, ...appData };
          this.dataService.updateApplication(updatedApp, categoryIds);
        }
      });
    });
  }
}
