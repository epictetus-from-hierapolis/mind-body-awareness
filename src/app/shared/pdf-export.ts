import { inject, Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { JournalStorage } from '../features/journal/journal-storage';

@Injectable({
  providedIn: 'root'
})
export class PdfExport {
  private readonly storageService = inject(JournalStorage);

  private readonly colors = {
    sage: [107, 143, 113],
    sageDark: [74, 107, 79],
    sageLight: [168, 213, 186],
    background: [247, 245, 240],
    text: [51, 51, 51],
    textLight: [140, 140, 140],
    positiveTx: [58, 107, 74],
    negativeTx: [139, 58, 62],
    positiveBg: [220, 240, 225],
    negativeBg: [250, 230, 232],
    divider: [220, 220, 220],
    white: [255, 255, 255]
  };

  private removeDiacritics(text: string): string {
    const map: { [key: string]: string } = {
      'ă': 'a', 'â': 'a', 'î': 'i', 'ș': 's', 'ț': 't',
      'Ă': 'A', 'Â': 'A', 'Î': 'I', 'Ș': 'S', 'Ț': 'T',
      'ş': 's', 'ţ': 't', 'Ş': 'S', 'Ţ': 'T'
    };
    return text.replace(/[ăâîșțĂÂÎȘȚşţŞŢ]/g, (ch) => map[ch] || ch);
  }

  private clean(text: string): string {
    return this.removeDiacritics(text || '');
  }

  private drawTag(doc: jsPDF, text: string, x: number, y: number, color: number[], vibrant: boolean): number {
    doc.setFontSize(7.5);
    const textWidth = doc.getTextWidth(text);
    const pillWidth = textWidth + 7;
    const pillHeight = 5.2;

    if (vibrant) {
      const bgColor = color === this.colors.positiveTx ? this.colors.positiveBg : this.colors.negativeBg;
      doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      doc.roundedRect(x, y - 3.7, pillWidth, pillHeight, 2.5, 2.5, 'F');
      doc.setTextColor(color[0], color[1], color[2]);
    } else {
      doc.setDrawColor(color[0], color[1], color[2]);
      doc.setLineWidth(0.25);
      doc.roundedRect(x, y - 3.7, pillWidth, pillHeight, 2.2, 2.2, 'S');
      doc.setTextColor(color[0], color[1], color[2]);
    }

    doc.text(text, x + 3.5, y);
    return pillWidth + 2;
  }

  private drawTagRow(doc: jsPDF, tags: string[], startX: number, y: number, maxWidth: number, color: number[], vibrant: boolean): number {
    let x = startX;
    let currentY = y;
    tags.forEach((tag) => {
      const cleanTag = this.clean(tag);
      doc.setFontSize(7.5);
      const tagWidth = doc.getTextWidth(cleanTag) + 9;
      if (x + tagWidth > startX + maxWidth) {
        x = startX;
        currentY += 6.5;
      }
      this.drawTag(doc, cleanTag, x, currentY, color, vibrant);
      x += tagWidth;
    });
    return currentY + 6.5;
  }

  exportPdf(vibrant: boolean = false): void {
    const doc = new jsPDF();
    const records = this.storageService.allRecords();
    const c = this.colors;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = vibrant ? 0 : 18;
    const effectiveMargin = 20;
    const contentWidth = pageWidth - (effectiveMargin * 2);

    if (vibrant) {
      doc.setFillColor(c.background[0], c.background[1], c.background[2]);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      doc.setFillColor(c.sage[0], c.sage[1], c.sage[2]);
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text('Mind-Body Awareness', pageWidth / 2, 22, { align: 'center' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(c.sageLight[0], c.sageLight[1], c.sageLight[2]);
      doc.text(this.clean('Călătorie spre conștientizare • ') + new Date().toLocaleDateString(), pageWidth / 2, 30, { align: 'center' });
    } else {
      doc.setDrawColor(c.sage[0], c.sage[1], c.sage[2]);
      doc.setLineWidth(0.5);
      doc.line(margin, 25, pageWidth - margin, 25);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(c.sageDark[0], c.sageDark[1], c.sageDark[2]);
      doc.text('Mind-Body Awareness', margin, 20);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(c.textLight[0], c.textLight[1], c.textLight[2]);
      doc.text(`Registru Printabil • ${new Date().toLocaleString()}`, pageWidth - margin, 20, { align: 'right' });
    }

    let y = vibrant ? 55 : 35;
    records.forEach((record) => {
      const estimatedHeight = 50;
      if (y + estimatedHeight > pageHeight - 20) {
        doc.addPage();
        if (vibrant) {
          doc.setFillColor(c.background[0], c.background[1], c.background[2]);
          doc.rect(0, 0, pageWidth, pageHeight, 'F');
        }
        y = 20;
      }

      const cardStartY = y - 1;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(c.sageDark[0], c.sageDark[1], c.sageDark[2]);
      doc.text(this.clean(new Date(record.timestamp).toLocaleString('ro-RO')), effectiveMargin + 5, y);
      y += 6;

      doc.setFontSize(9);
      if (record.rootCause) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(c.textLight[0], c.textLight[1], c.textLight[2]);
        doc.text(this.clean('CAUZA:'), effectiveMargin + 5, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(c.text[0], c.text[1], c.text[2]);
        const lines = doc.splitTextToSize(this.clean(record.rootCause), contentWidth - 25);
        doc.text(lines, effectiveMargin + 20, y);
        y += (lines.length * 4.5) + 2;
      }

      if (record.sensations.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(c.textLight[0], c.textLight[1], c.textLight[2]);
        doc.text(this.clean('SENZATII'), effectiveMargin + 5, y);
        y += 4;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(c.text[0], c.text[1], c.text[2]);
        const sensText = this.clean(record.sensations.join(' • '));
        const sensLines = doc.splitTextToSize(sensText, contentWidth - 10);
        doc.text(sensLines, effectiveMargin + 5, y);
        y += (sensLines.length * 4.5) + 2;
      }

      if (record.positiveEmotions.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(c.positiveTx[0], c.positiveTx[1], c.positiveTx[2]);
        doc.text(this.clean('EMOTII POZITIVE'), effectiveMargin + 5, y);
        y += 5;
        y = this.drawTagRow(doc, record.positiveEmotions, effectiveMargin + 5, y, contentWidth - 10, c.positiveTx, vibrant);
        y += 1;
      }

      if (record.negativeEmotions.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(c.negativeTx[0], c.negativeTx[1], c.negativeTx[2]);
        doc.text(this.clean('EMOTII NEGATIVE'), effectiveMargin + 5, y);
        y += 5;
        y = this.drawTagRow(doc, record.negativeEmotions, effectiveMargin + 5, y, contentWidth - 10, c.negativeTx, vibrant);
        y += 1;
      }

      const needsEntries = Object.entries(record.needs);
      if (needsEntries.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(c.textLight[0], c.textLight[1], c.textLight[2]);
        doc.text(this.clean('NEVOI PROCESATE'), effectiveMargin + 5, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(c.text[0], c.text[1], c.text[2]);
        needsEntries.forEach(([emotion, need]) => {
          if (need) {
            const needText = this.clean(`${emotion}: ${need}`);
            const needLines = doc.splitTextToSize(needText, contentWidth - 15);
            doc.text(needLines, effectiveMargin + 8, y);
            y += (needLines.length * 4.5);
          }
        });
        y += 2;
      }

      const cardHeight = y - cardStartY;
      doc.setDrawColor(c.sage[0], c.sage[1], c.sage[2]);
      doc.setLineWidth(vibrant ? 1.5 : 0.4);
      doc.line(effectiveMargin, cardStartY, effectiveMargin, cardStartY + cardHeight);
      y += 5;

      doc.setDrawColor(c.divider[0], c.divider[1], c.divider[2]);
      doc.setLineWidth(0.1);
      doc.line(effectiveMargin + 5, y, pageWidth - effectiveMargin, y);
      y += 10;
    });

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        if (vibrant && i === totalPages) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(9);
          doc.setTextColor(c.sageDark[0], c.sageDark[1], c.sageDark[2]);
          doc.text(this.clean('“Prezența este singurul moment în care putem fi cu adevărat vii.”'), pageWidth / 2, pageHeight - 15, { align: 'center' });
        }
        doc.setFontSize(8);
        doc.setTextColor(c.textLight[0], c.textLight[1], c.textLight[2]);
        doc.text(this.clean(`${i} / ${totalPages}`), pageWidth / 2, pageHeight - 8, { align: 'center' });
    }

    const type = vibrant ? 'vibrant' : 'print';
    doc.save(`awareness-${type}-${new Date().toISOString().split('T')[0]}.pdf`);
  }
}
