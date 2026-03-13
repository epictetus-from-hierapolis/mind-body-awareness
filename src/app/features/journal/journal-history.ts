import { Component, inject, viewChild, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { JournalStorage } from './journal-storage';
import { PdfExport } from '../../shared/pdf-export';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ScrollingModule, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ScrollTop } from '../../shared/scroll-top/scroll-top';

@Component({
  selector: 'mba-journal-history',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatMenuModule, ScrollingModule, ScrollTop],
  templateUrl: './journal-history.html',
  styleUrl: './journal-history.scss',
})
export class JournalHistory implements OnInit {
  protected readonly viewport = viewChild(CdkVirtualScrollViewport);
  protected readonly scrollTopComp = viewChild(ScrollTop);

  private readonly storageService = inject(JournalStorage);
  protected readonly pdfService = inject(PdfExport);
  protected readonly records = this.storageService.allRecords;

  ngOnInit() {
    // Forțează verificarea dimensiunii viewport-ului după ce componenta este inițializată
    // Aceasta rezolvă problema randării incomplete în tab-uri
    setTimeout(() => {
      this.viewport()?.checkViewportSize();
    }, 100);
  }

  protected onScroll() {
    const viewport = this.viewport();
    const scrollTopComp = this.scrollTopComp();
    if (viewport && scrollTopComp) {
      const offset = viewport.measureScrollOffset('top');
      scrollTopComp.updateVisibility(offset);
    }
  }

  protected async deleteEntry(id: string) {
    if (confirm('Sigur vrei să ștergi această înregistrare?')) {
      await this.storageService.deleteRecord(id);
    }
  }
}
