import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { FacturacionData } from "../../../types/reportes";
import type { MaintenanceStatistics } from "../../../types/mantenimiento";
import type { ReportKey } from "../constants/reportOptions";

export type PDFSection = {
  title: string;
  content: string[];
};

export type ExportPayload = {
  prefix: string;
  title: string;
  subtitle: string;
  columns: string[];
  rows: string[][];
  sections?: PDFSection[];
};

interface PDFExportOptions {
  exportData: ExportPayload;
  selectedReport: ReportKey;
  facturacionData?: FacturacionData | null;
  mantenimientoData?: MaintenanceStatistics | null;
  formatCurrency: (value: number) => string;
}

export function exportToPDF({
  exportData,
  selectedReport,
  facturacionData,
  formatCurrency,
}: PDFExportOptions): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Colors
  const primaryColor = [67, 56, 202]; // Indigo-700
  const secondaryColor = [14, 165, 233]; // Sky-500
  const accentColor = [34, 197, 94]; // Green-500
  const textColor = [31, 41, 55]; // Gray-800
  const lightGray = [243, 244, 246]; // Gray-100

  // Header with gradient effect
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 120, "F");

  // Company logo area (decorative circle)
  doc.setFillColor(255, 255, 255);
  doc.circle(40, 40, 20, "F");
  doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.circle(40, 40, 15, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(exportData.title, 40, 90);

  // Subtitle bar
  doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.rect(0, 120, pageWidth, 60, "F");

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const generatedDate = new Date().toLocaleString("es-AR", {
    dateStyle: "long",
    timeStyle: "short",
  });
  doc.text(`Generado: ${generatedDate}`, 40, 145);
  doc.text(exportData.subtitle, 40, 165);

  // Decorative line
  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setLineWidth(3);
  doc.line(40, 190, pageWidth - 40, 190);

  // Table with autoTable
  autoTable(doc, {
    startY: 210,
    head: [exportData.columns],
    body: exportData.rows,
    theme: "grid",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 11,
      fontStyle: "bold",
      halign: "center",
      cellPadding: 8,
    },
    bodyStyles: {
      fontSize: 10,
      cellPadding: 6,
      textColor: textColor,
    },
    alternateRowStyles: {
      fillColor: lightGray,
    },
    columnStyles: {
      0: { fontStyle: "bold" },
    },
    styles: {
      lineColor: [209, 213, 219],
      lineWidth: 0.5,
    },
    margin: { left: 40, right: 40 },
    didDrawPage: () => {
      // Footer
      const footerY = pageHeight - 30;
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.setFont("helvetica", "normal");

      // Page number
      const pageNum = `Página ${doc.getCurrentPageInfo().pageNumber}`;
      doc.text(pageNum, pageWidth - 40, footerY, { align: "right" });

      // Company name or watermark
      doc.text("Sistema de Gestión de Alquileres", 40, footerY);

      // Decorative footer line
      doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.setLineWidth(1);
      doc.line(40, footerY - 10, pageWidth - 40, footerY - 10);
    },
  });

  // Add summary statistics if available
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable.finalY || 210;

  if (selectedReport === "facturacion" && facturacionData?.acumulado) {
    const summaryY = finalY + 30;

    // Summary box
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.roundedRect(40, summaryY, pageWidth - 80, 80, 5, 5, "F");

    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.rect(40, summaryY, 5, 80, "F");

    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Resumen Total", 55, summaryY + 25);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const summary = [
      `Alquileres: ${formatCurrency(facturacionData.acumulado.total_alquileres)}`,
      `Sanciones: ${formatCurrency(facturacionData.acumulado.total_sanciones)}`,
      `Total General: ${formatCurrency(facturacionData.acumulado.total_general)}`,
    ];

    for (const [index, line] of summary.entries()) {
      doc.text(line, 55, summaryY + 45 + index * 15);
    }
  }

  return doc;
}

export function buildFileName(prefix: string, extension: string): string {
  const timestamp = new Date().toISOString().split("T")[0];
  return `${prefix}-${timestamp}.${extension}`;
}
