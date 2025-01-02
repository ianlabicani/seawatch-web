import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
} from '@angular/fire/firestore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

@Injectable({
  providedIn: 'root',
})
export class ExportPdfService {
  constructor(private firestore: Firestore) {}

  /**
   * Exports data from any Firestore collection to a PDF file.
   * @param collectionName The name of the Firestore collection to query.
   * @param start Start date for filtering.
   * @param end End date for filtering.
   * @param columns Column names for the PDF table.
   * @param mapRow Function to map a document to a row in the PDF table.
   */
  async exportToPDF<T>(
    collectionName: string,
    start: Date,
    end: Date,
    columns: string[],
    dateCol: string,
    mapRow: (doc: T) => any[]
  ): Promise<void> {
    try {
      // Step 1: Query Firestore for the collection
      const dataQuery = query(
        collection(this.firestore, collectionName),
        where(dateCol, '>=', start),
        where(dateCol, '<=', end)
      );

      const querySnapshot = await getDocs(dataQuery);

      // Step 2: Map Firestore data to usable format
      const data = querySnapshot.docs.map(
        (doc) => ({ ...doc.data(), id: doc.id } as T)
      );

      if (data.length === 0) {
        throw new Error(
          `No data found in the ${collectionName} collection for the selected date range.`
        );
      }

      const rows = data.map(mapRow);

      // Step 3: Generate PDF
      const doc = new jsPDF();
      doc.text(
        `Report from ${start.toDateString()} to ${end.toDateString()}`,
        10,
        10
      );

      (doc as any).autoTable({
        head: [columns],
        body: rows,
        startY: 20,
      });

      // Step 4: Save the PDF
      const filename = `${collectionName}-report-${
        start.toISOString().split('T')[0]
      }-${end.toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
    } catch (error) {
      console.error(`Error exporting ${collectionName} data to PDF:`, error);
      throw error;
    }
  }
}
