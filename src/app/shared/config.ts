import { Injectable, signal, computed, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import Dexie, { Table } from 'dexie';

export interface ConfigItem {
  id?: number;
  category: 'sensation' | 'positiveEmotion' | 'negativeEmotion';
  label: string;
}

// ─── Default Data ───
const DEFAULT_SENSATIONS = [
  'Furnicături', 'Gol în stomac', 'Tensiune musculară',
  'Bătăi puternice ale inimii', 'Umeri încordați', 'Maxilar încleștat',
  'Presiune în zona frontală sau occipitală', 'Picioare/mâini grele sau ușoare',
  'Senzație generală de corp greu sau ușor', 'Greață',
  'Tensiune abdominala', 'Arsuri abdominale', 'Arsuri in piept', 'RLS'
];

const DEFAULT_POSITIVE_EMOTIONS = [
  'Acceptat', 'Calm', 'Energic', 'Încurajat', 'Lăudat', 'Nostalgic', 'Uimit',
  'Compătimitor', 'Milos', 'Entuziasmat', 'Împlinit', 'Liniștit', 'Optimist',
  'Special', 'Afectuos', 'Confortabil', 'Euforic', 'Important', 'Loial',
  'Capabil', 'Suportiv', 'Ambițios', 'Curajos', 'Extaziat', 'În siguranță',
  'Mândru', 'Pasionat', 'Triumfător', 'Amuzat', 'Curios', 'Fericit', 'Încântat',
  'Merituos', 'Relaxat', 'Voios', 'Aventuros', 'Demn', 'Frumos', 'Incitat',
  'Motivat', 'Puternic', 'Bucuros', 'Determinat', 'Generos', 'Iubit',
  'Mulțumit', 'Protejat', 'Bun', 'Dorit', 'Grijuliu', 'Jucăuș', 'Nerăbdător',
  'Sensibil'
];

const DEFAULT_NEGATIVE_EMOTIONS = [
  'Abandonat', 'Batjocorit', 'Distrat', 'Furios', 'Ineficient', 'Izolat',
  'Neastâmpărat', 'Abătut', 'Copleșit', 'Distrus', 'Gelos', 'Inhibat', 'Jenat',
  'Neapreciat', 'Agitat', 'Deprimat', 'Exasperat', 'Gol', 'Îngrozit',
  'Măcinat de gânduri', 'Neîncrezător', 'Alungat', 'Depășit', 'Exclus',
  'Ignorat', 'Îngrijorat', 'Mustrat', 'Neiubit', 'Amărât', 'Devastat', 'Expus',
  'Inadecvat', 'Înnebunit', 'Mohorât', 'Nemulțumit', 'Anxios', 'Dezamăgit',
  'Fără speranță', 'Incompetent', 'Înspăimântat', 'Neatrăgător', 'Ostil',
  'Confuz', 'Disprețuit', 'Frustrat', 'Indignat', 'Isteric', 'Panicată',
  'Pesimist', 'Pierdut', 'Plin de ură', 'Rănit', 'Rușinat', 'Siderat',
  'Singur', 'Șocat', 'Speriat', 'Stresat', 'Stupid', 'Temător', 'Tensionat',
  'Tulburat', 'Umilit', 'Vânat', 'Vinovat', 'Vulnerabil', 'Zăpăcit', 'Scârbit'
];

@Injectable({
  providedIn: 'root',
})
export class MbaConfig extends Dexie {
  public configItems!: Table<ConfigItem, number>;

  private _sensations = signal<ConfigItem[]>([]);
  private _positiveEmotions = signal<ConfigItem[]>([]);
  private _negativeEmotions = signal<ConfigItem[]>([]);

  // Public readonly signals — returnează doar label-urile
  readonly sensations = computed(() => this._sensations().map(i => i.label));
  readonly positiveEmotions = computed(() => this._positiveEmotions().map(i => i.label));
  readonly negativeEmotions = computed(() => this._negativeEmotions().map(i => i.label));

  // Raw items (cu id) — pentru admin UI
  readonly sensationItems = this._sensations.asReadonly();
  readonly positiveEmotionItems = this._positiveEmotions.asReadonly();
  readonly negativeEmotionItems = this._negativeEmotions.asReadonly();

  private _snackBar = inject(MatSnackBar);

  private _notify(message: string, type: 'success' | 'error' = 'success') {
    this._snackBar.open(message, 'OK', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar']
    });
  }

  constructor() {
    super('MindBodyConfigDB');
    this.version(1).stores({
      configItems: '++id, category, label'
    });

    this.initializeData();
  }

  private async initializeData() {
    const count = await this.configItems.count();
    if (count === 0) {
      await this.seedDefaults();
    }
    await this.refreshAll();
  }

  private async seedDefaults() {
    const items: ConfigItem[] = [
      ...DEFAULT_SENSATIONS.map(label => ({ category: 'sensation' as const, label })),
      ...DEFAULT_POSITIVE_EMOTIONS.map(label => ({ category: 'positiveEmotion' as const, label })),
      ...DEFAULT_NEGATIVE_EMOTIONS.map(label => ({ category: 'negativeEmotion' as const, label })),
    ];
    await this.configItems.bulkAdd(items);
  }

  private async refreshAll() {
    const all = await this.configItems.toArray();
    this._sensations.set(all.filter(i => i.category === 'sensation'));
    this._positiveEmotions.set(all.filter(i => i.category === 'positiveEmotion'));
    this._negativeEmotions.set(all.filter(i => i.category === 'negativeEmotion'));
  }

  async addItem(category: ConfigItem['category'], label: string) {
    const trimmed = label.trim();
    if (!trimmed) return;

    // Evită duplicatele
    const existing = await this.configItems.where({ category, label: trimmed }).count();
    if (existing > 0) return;

    await this.configItems.add({ category, label: trimmed });
    this._notify(`"${trimmed}" a fost adăugat cu succes!`);
    await this.refreshAll();
  }

  async removeItem(id: number) {
    const item = await this.configItems.get(id);
    if (item) {
      await this.configItems.delete(id);
      this._notify(`"${item.label}" a fost eliminat.`);
      await this.refreshAll();
    }
  }

  async resetDefaults(category: ConfigItem['category']) {
    try {
      await this.transaction('rw', this.configItems, async () => {
        // Șterge toate itemele din categorie
        await this.configItems.where('category').equals(category).delete();

        // Re-adaugă defaulturile
        let defaults: string[] = [];
        let catName = '';
        if (category === 'sensation') { defaults = DEFAULT_SENSATIONS; catName = 'Senzații'; }
        if (category === 'positiveEmotion') { defaults = DEFAULT_POSITIVE_EMOTIONS; catName = 'Emoții pozitive'; }
        if (category === 'negativeEmotion') { defaults = DEFAULT_NEGATIVE_EMOTIONS; catName = 'Emoții negative'; }

        const items = defaults.map(label => ({ category, label }));
        await this.configItems.bulkAdd(items);
        this._notify(`Lista "${catName}" a fost resetată la valorile implicite.`);
        await this.refreshAll();
      });
    } catch (e) {
      console.error('Error resetting defaults:', e);
      this._notify('Eroare la resetarea listei.', 'error');
    }
  }
}
