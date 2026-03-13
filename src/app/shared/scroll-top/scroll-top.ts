import { Component, input, inject, Renderer2, OnInit, OnDestroy, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'mba-scroll-top',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    @if (show()) {
      <button mat-mini-fab class="scroll-top-btn" (click)="scrollTop()" aria-label="Scroll to top">
        <mat-icon>arrow_upward</mat-icon>
      </button>
    }
  `,
  styles: [`
    .scroll-top-btn {
      position: fixed;
      bottom: 85px;
      right: 12px;
      z-index: 1000;
      background-color: #6B8F71 !important;
      color: white !important;
      opacity: 0.6;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(107, 143, 113, 0.3) !important;

      &:hover {
        opacity: 1;
        transform: scale(1.1);
      }

      @media screen and (max-width: 600px) {
        bottom: 75px;
        right: 8px;
      }
    }
  `]
})
export class ScrollTop implements OnInit, OnDestroy {
  public readonly threshold = input(200);
  public readonly target = input<any>(); 
  
  protected readonly show = signal(false);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly renderer = inject(Renderer2);
  private scrollUnsub?: () => void;

  ngOnInit() {
    this.scrollUnsub = this.renderer.listen('window', 'scroll', (event) => {
      this.onScroll(event);
    }, { capture: true } as any);
  }

  ngOnDestroy() {
    if (this.scrollUnsub) this.scrollUnsub();
  }

  protected onScroll(event?: any) {
    if (this.target()) return;

    const scrollContainer = document.querySelector('.mat-mdc-tab-body-active .mat-mdc-tab-body-content');
    const scrollOffset = scrollContainer ? scrollContainer.scrollTop : (window.pageYOffset || document.documentElement.scrollTop);
    this.show.set(scrollOffset > this.threshold());
    this.cdr.detectChanges();
  }

  public updateVisibility(offset: number) {
    this.show.set(offset > this.threshold());
    this.cdr.detectChanges();
  }

  protected scrollTop() {
    const target = this.target();
    if (target && typeof target.scrollToIndex === 'function') {
      target.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (target && typeof target.scrollTo === 'function') {
      target.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const scrollContainer = document.querySelector('.mat-mdc-tab-body-active .mat-mdc-tab-body-content');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }
}
