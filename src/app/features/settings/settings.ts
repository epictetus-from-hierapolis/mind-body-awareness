import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MbaConfig, ConfigItem } from '../../shared/config';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ScrollTop } from '../../shared/scroll-top/scroll-top';

@Component({
  selector: 'mba-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatExpansionModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ScrollTop,
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  private readonly configService = inject(MbaConfig);

  protected readonly sensationItems = this.configService.sensationItems;
  protected readonly positiveEmotionItems = this.configService.positiveEmotionItems;
  protected readonly negativeEmotionItems = this.configService.negativeEmotionItems;

  protected readonly newSensation = signal('');
  protected readonly newPositiveEmotion = signal('');
  protected readonly newNegativeEmotion = signal('');

  protected async addItem(category: ConfigItem['category'], label: string) {
    await this.configService.addItem(category, label);
    if (category === 'sensation') this.newSensation.set('');
    if (category === 'positiveEmotion') this.newPositiveEmotion.set('');
    if (category === 'negativeEmotion') this.newNegativeEmotion.set('');
  }

  protected async removeItem(id: number) {
    await this.configService.removeItem(id);
  }

  protected async resetDefaults(category: ConfigItem['category']) {
    if (window.confirm('Sigur vrei să resetezi lista la valorile implicite?')) {
      await this.configService.resetDefaults(category);
    }
  }
}
