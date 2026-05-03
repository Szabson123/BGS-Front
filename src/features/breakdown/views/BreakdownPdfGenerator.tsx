import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { robotoRegularBase64 } from '../../../assets/fonts/base64';

interface PdfGeneratorProps {
  filters: {
    search: string;
    status: string;
    priority: string;
    date_from: string;
    date_to: string;
    machine: string;
  };
}

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'HIGH': return 'Wysoki';
    case 'MID': return 'Średni';
    case 'LOW': return 'Niski';
    default: return 'Brak';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'RP': return 'Oczekujące';
    case 'ST': return 'W naprawie';
    case 'ED': return 'Zakończone';
    default: return 'Nieznany';
  }
};

const calculateDuration = (startStr: string, endStr?: string) => {
  const start = new Date(startStr).getTime();
  const end = endStr ? new Date(endStr).getTime() : new Date().getTime();
  const diffMs = end - start;
  if (diffMs < 0) return '-';
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(diffMins / (60 * 24));
  const hours = Math.floor((diffMins % (60 * 24)) / 60);
  const mins = diffMins % 60;
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
};

export const BreakdownPdfGenerator: React.FC<PdfGeneratorProps> = ({ filters }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    try {
      const params = new URLSearchParams();
      params.append('no_pagination', 'True');
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.date_from) params.append('date_range_after', filters.date_from);
      if (filters.date_to) params.append('date_range_before', filters.date_to);

      const response = await fetch(`/api/machines/all-break-downs-to-report/?${params.toString()}`);
      if (!response.ok) throw new Error('Błąd pobierania danych do PDF');
      
      const rawData = await response.json();
      const dataList = Array.isArray(rawData) ? rawData : rawData.results || [];

      generateDocument(dataList);
    } catch (error) {
      console.error("Błąd podczas generowania PDF:", error);
      alert("Nie udało się wygenerować raportu PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateDocument = (data: any[]) => {
    const doc = new jsPDF('landscape');

    doc.addFileToVFS('Roboto-Regular.ttf', robotoRegularBase64);
  
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    
    doc.setFont('Roboto'); 
    
    doc.setFontSize(14);
    doc.text('Raport Zgloszen UR', 5, 12);

    const tableColumn = [
      "Maszyna", "Zgloszono", "Prio.", "Zglaszajacy", 
      "Opis usterki", "Status", "Opis naprawy", "Opis koncowy", 
      "Start", "Zamknal", "Interwencja", "Czas"
    ];

    const tableRows = data.map(item => {
      const history = item.history || [];
      const latest = history[0];
      const started = history.find((h: any) => h.status === 'ST');
      const ended = history.find((h: any) => h.status === 'ED');

      const addedDateObj = new Date(item.created_at);
      const addedDate = addedDateObj.toLocaleDateString('pl-PL') + '\n' + addedDateObj.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

      const startedDateObj = started ? new Date(started.created_at) : null;
      const startedDate = startedDateObj 
        ? startedDateObj.toLocaleDateString('pl-PL') + '\n' + startedDateObj.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }) 
        : '-';

      const reporterName = item.reporter ? `${item.reporter.first_name} ${item.reporter.last_name}`.trim() : 'System';
      const closerName = ended ? `${ended.user.first_name} ${ended.user.last_name}`.trim() : '-';
      const intervenorName = started ? `${started.user.first_name} ${started.user.last_name}`.trim() : (latest ? `${latest.user.first_name} ${latest.user.last_name}`.trim() : '-');

      return [
        item.machine.name + (item.machine.alias ? `\n(${item.machine.alias})` : ''),
        addedDate,
        getPriorityLabel(item.priority),
        reporterName,
        item.description || '-',
        latest ? getStatusLabel(latest.status) : getStatusLabel('RP'),
        started?.description || '-',
        ended?.description || '-',
        startedDate,
        closerName,
        intervenorName,
        calculateDuration(item.created_at, ended?.created_at)
      ];
    });

autoTable(doc, {
      theme: 'grid',
      head: [tableColumn],
      body: tableRows,
      startY: 16,
      margin: { top: 16, right: 5, bottom: 5, left: 5 },
      styles: { 
        font: 'Roboto',
        fontSize: 7,
        cellPadding: 1.5,
        overflow: 'linebreak',
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: { 
        fillColor: [29, 78, 216],
        textColor: 255,
        halign: 'center',
        valign: 'middle',
        fontStyle: 'normal'
      },
      bodyStyles: {
        valign: 'middle'
      },
        columnStyles: {
        0: { cellWidth: 21 },
        1: { cellWidth: 16, halign: 'center' },
        2: { cellWidth: 14, halign: 'center' },
        3: { cellWidth: 17, halign: 'center' },
        4: { cellWidth: 36 },
        5: { cellWidth: 17, halign: 'center' },
        6: { cellWidth: 50 },
        7: { cellWidth: 50 },
        8: { cellWidth: 16, halign: 'center' },
        9: { cellWidth: 17, halign: 'center' },
        10: { cellWidth: 17, halign: 'center' },
        11: { cellWidth: 16, halign: 'center' }
        }
    });

    const pdfBlobUrl = doc.output('bloburl');
    window.open(pdfBlobUrl, '_blank');
  };

  return (
    <button 
      onClick={handleGeneratePdf} 
      disabled={isGenerating}
      style={{
        padding: '8px 16px',
        backgroundColor: isGenerating ? 'var(--ar-text-muted)' : 'var(--ar-primary-blue)',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: isGenerating ? 'not-allowed' : 'pointer',
        fontWeight: 600,
        marginLeft: 'auto'
      }}
    >
      {isGenerating ? 'Generowanie...' : 'Generuj PDF'}
    </button>
  );
};