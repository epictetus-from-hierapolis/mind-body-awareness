import { Injectable, signal, computed, inject } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { JournalRecord } from './journal-record'; // Use the class directly
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class JournalStorage extends Dexie {
  private readonly snackBar = inject(MatSnackBar);
  
  private openSnackBarSuccess(message: string) {
    this.snackBar.open('Jurnalul a fost ' + message + ' cu succes!', 'OK', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  private openSnackBarError(message: string) {
    this.snackBar.open('Eroare la ' + message + '. Încearcă din nou.', 'OK', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  protected readonly journalRecords!: Table<JournalRecord>;

  private readonly recordsSignal = signal<JournalRecord[]>([]);
  public readonly allRecords = this.recordsSignal.asReadonly();
  public readonly totalEntries = computed(() => this.recordsSignal()?.length ?? 0);

  constructor() {
    super('MindBodyJournalDB');
    this.version(1).stores({
      journalRecords: 'id, timestamp'
    });

    this.loadInitialData();
  }

  private async loadInitialData() {
    const data = await this.journalRecords.orderBy('timestamp').reverse().toArray();
    this.recordsSignal.set(data.filter(r => !!r).map(r => new JournalRecord(r)));
  }

  public async addRecord(recordData: Partial<JournalRecord>) {
    try {
      const record = new JournalRecord(recordData);
      await this.journalRecords.add(record);
      this.openSnackBarSuccess('salvat');
      this.recordsSignal.update(records => [record, ...records]);
    } catch (error) {
      console.error('Error adding record:', error);
      this.openSnackBarError('salvare');
    }
  }

  public async getAllRecords() {
    return await this.journalRecords.orderBy('timestamp').reverse().toArray();
  }

  public async deleteRecord(id: string) {
    try {
      await this.journalRecords.delete(id);
      this.openSnackBarSuccess('șters');
      this.recordsSignal.update(records => records.filter(record => record.id !== id));
    } catch (error) {
      console.error('Error deleting record:', error);
      this.openSnackBarError('ștergere');
    }
  }
}
