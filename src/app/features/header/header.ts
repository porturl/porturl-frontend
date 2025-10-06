import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { EditModeService } from '../../core/services/edit-mode.service';
import { SearchService } from '../../core/services/search.service';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  public readonly editModeService = inject(EditModeService);
  public readonly searchService = inject(SearchService);
  public searchVisible = signal(false);

  onSearchInput(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.searchService.searchTerm.set(term);
  }
}
