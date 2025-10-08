import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BehaviorSubject, forkJoin, Observable, switchMap, take } from 'rxjs';
import { Application, Category } from '../../core/models/data.models';
import { ApiService } from '../../api.service';
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
export class Dashboard implements OnInit {
  public readonly apiService = inject(ApiService);
  public readonly editModeService = inject(EditModeService);
  public readonly searchService = inject(SearchService);
  private readonly dialog = inject(MatDialog);

  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  public categories$: Observable<Category[]> = this.categoriesSubject.asObservable();

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.apiService.getCategories().subscribe(categories => {
      this.categoriesSubject.next(categories);
    });
  }

  onCategoryDrop(event: CdkDragDrop<Category[]>): void {
    const categories = this.categoriesSubject.getValue();
    moveItemInArray(categories, event.previousIndex, event.currentIndex);
    this.categoriesSubject.next(categories); // Optimistic update

    this.apiService.reorderCategories(categories).subscribe({
      error: () => this.loadCategories(), // Revert on error
    });
  }

  onAppDrop(event: CdkDragDrop<Application[]>): void {
    const previousCategoryId = +event.previousContainer.id;
    const currentCategoryId = +event.container.id;
    const categories = this.categoriesSubject.getValue();
    const prevCategory = categories.find(c => c.id === previousCategoryId);
    const currentCategory = categories.find(c => c.id === currentCategoryId);

    if (!prevCategory || !currentCategory) return;

    if (previousCategoryId === currentCategoryId) {
      // Move within the same category
      moveItemInArray(currentCategory.applications, event.previousIndex, event.currentIndex);
      this.categoriesSubject.next([...categories]); // Optimistic update

      this.apiService.reorderApplications(currentCategoryId, currentCategory.applications).subscribe({
        error: () => this.loadCategories(),
      });
    } else {
      // Move to a different category
      const appToMove = prevCategory.applications[event.previousIndex];
      transferArrayItem(
        prevCategory.applications,
        currentCategory.applications,
        event.previousIndex,
        event.currentIndex
      );
      this.categoriesSubject.next([...categories]); // Optimistic update

      const newCategoryIds = categories
        .filter(c => c.applications.some(a => a.id === appToMove.id))
        .map(c => c.id);

      // Update app's categories, then reorder both source and destination lists
      this.apiService.updateApplication(appToMove, newCategoryIds).pipe(
        switchMap(() => forkJoin([
          this.apiService.reorderApplications(currentCategoryId, currentCategory.applications),
          this.apiService.reorderApplications(previousCategoryId, prevCategory.applications)
        ]))
      ).subscribe({
        error: () => this.loadCategories(),
      });
    }
  }

  addCategory(): void {
    const dialogRef = this.dialog.open(CategoryDialog);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.apiService.addCategory(result).subscribe(() => this.loadCategories());
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
          this.apiService.addApplication(appData, categoryIds).subscribe(() => this.loadCategories());
        }
      });
    });
  }

  getCategoryIds(categories: Category[]): number[] {
    if (!categories) return [];
    return categories.map(c => c.id);
  }

  editCategory(category: Category): void {
    const dialogRef = this.dialog.open(CategoryDialog, {
      data: { category }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const updatedCategory: Category = { ...category, ...result };
        this.apiService.updateCategory(updatedCategory).subscribe(() => this.loadCategories());
      }
    });
  }

  deleteCategory(categoryId: number): void {
    this.apiService.deleteCategory(categoryId).subscribe(() => this.loadCategories());
  }

  editApplication(app: Application): void {
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
          this.apiService.updateApplication(updatedApp, categoryIds).subscribe(() => this.loadCategories());
        }
      });
    });
  }

  deleteApplication(appId: number): void {
    this.apiService.deleteApplication(appId).subscribe(() => this.loadCategories());
  }
}