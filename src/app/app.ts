import { Component, signal, AfterViewInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { JournalForm } from "./features/journal/journal-form"
import { JournalHistory } from "./features/journal/journal-history"
import { Settings } from "./features/settings/settings"
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'mba-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, JournalForm, JournalHistory, Settings, MatTabsModule, MatToolbarModule, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements AfterViewInit {
  protected readonly title = signal('mind-body-awareness');
  protected readonly activeTabIndex = signal(0);

  ngAfterViewInit() {
    // Smoothly remove splash screen after app initialization
    setTimeout(() => {
      const splash = document.getElementById('splash-screen');
      if (splash) {
        splash.style.opacity = '0';
        splash.style.visibility = 'hidden';
        setTimeout(() => splash.remove(), 500);
      }
    }, 1000); // Give it a moment to show the logo
  }
}
