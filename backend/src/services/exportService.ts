import jsPDF from 'jspdf';
import Schedule from '../models/Schedule';
import Batch from '../models/Batch';
import Semester from '../models/Semester';
import fs from 'fs';
import path from 'path';

export class ExportService {
  /**
   * Export schedule to PDF with beautiful design
   */
  async exportToPDF(scheduleId: string): Promise<Buffer> {
    const schedule = await Schedule.findById(scheduleId)
      .populate('batchId')
      .populate('semesterId');
    
    if (!schedule) {
      throw new Error('Schedule not found');
    }

    const batch = schedule.batchId as any;
    const semester = schedule.semesterId as any;

    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let y = margin;

    // Load logo - try multiple possible paths
    const possiblePaths = [
      path.join(__dirname, '../../public/logo.jpg'),
      path.join(__dirname, '../../../public/logo.jpg'),
      path.join(process.cwd(), 'public/logo.jpg'),
      path.join(process.cwd(), 'backend/public/logo.jpg'),
    ];
    
    let logoData: string | null = null;
    
    for (const logoPath of possiblePaths) {
      try {
        if (fs.existsSync(logoPath)) {
          const logoBuffer = fs.readFileSync(logoPath);
          logoData = 'data:image/jpeg;base64,' + logoBuffer.toString('base64');
          break;
        }
      } catch (error) {
        // Try next path
        continue;
      }
    }
    
    if (!logoData) {
      console.warn('Logo not found in any expected location, continuing without logo');
    }

    // Header with logo and title
    doc.setFillColor(139, 0, 0); // Dark red (#8B0000)
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    // Logo
    if (logoData) {
      try {
        doc.addImage(logoData, 'JPEG', margin, 5, 25, 25);
      } catch (error) {
        console.warn('Could not add logo image');
      }
    }

    // University name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Wachemo University', logoData ? margin + 30 : margin, 15);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Class Schedule System', logoData ? margin + 30 : margin, 22);

    // Schedule title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const titleText = `Batch ${batch?.batchNumber || 'N/A'} - ${semester?.name || 'N/A'} - Section ${schedule.section}`;
    doc.text(
      titleText,
      logoData ? margin + 30 : margin,
      30
    );

    y = 45;

    // Info box
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(margin, y, pageWidth - 2 * margin, 15, 3, 3, 'F');
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const infoText = [
      `Department: ${schedule.department || 'All Departments'}`,
      `Status: ${schedule.status === 'published' ? 'Published' : 'Draft'}`,
      `Generated: ${new Date(schedule.generatedAt).toLocaleDateString()}`
    ].join('  |  ');
    
    doc.text(infoText, margin + 5, y + 10);

    y += 25;

    // Table setup
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const dayColWidth = 35;
    const timeColWidth = (pageWidth - 2 * margin - dayColWidth) / 2;
    const startX = margin;

    // Table header
    doc.setFillColor(139, 0, 0);
    doc.roundedRect(startX, y, dayColWidth, 10, 2, 2, 'F');
    doc.roundedRect(startX + dayColWidth, y, timeColWidth, 10, 2, 2, 'F');
    doc.roundedRect(startX + dayColWidth + timeColWidth, y, timeColWidth, 10, 2, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    const centerDayX = startX + dayColWidth / 2;
    const centerMorningX = startX + dayColWidth + timeColWidth / 2;
    const centerAfternoonX = startX + dayColWidth + timeColWidth + timeColWidth / 2;
    doc.text('Day', centerDayX - doc.getTextWidth('Day') / 2, y + 7);
    doc.text('Morning', centerMorningX - doc.getTextWidth('Morning') / 2, y + 7);
    doc.text('Afternoon', centerAfternoonX - doc.getTextWidth('Afternoon') / 2, y + 7);

    y += 12;

    // Table rows
    days.forEach((day, dayIndex) => {
      if (y > pageHeight - 40) {
        doc.addPage();
        y = margin + 10;
        
        // Repeat header on new page
        doc.setFillColor(139, 0, 0);
        doc.roundedRect(startX, y, dayColWidth, 10, 2, 2, 'F');
        doc.roundedRect(startX + dayColWidth, y, timeColWidth, 10, 2, 2, 'F');
        doc.roundedRect(startX + dayColWidth + timeColWidth, y, timeColWidth, 10, 2, 2, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        const centerDayX = startX + dayColWidth / 2;
        const centerMorningX = startX + dayColWidth + timeColWidth / 2;
        const centerAfternoonX = startX + dayColWidth + timeColWidth + timeColWidth / 2;
        doc.text('Day', centerDayX - doc.getTextWidth('Day') / 2, y + 7);
        doc.text('Morning', centerMorningX - doc.getTextWidth('Morning') / 2, y + 7);
        doc.text('Afternoon', centerAfternoonX - doc.getTextWidth('Afternoon') / 2, y + 7);
        y += 12;
      }

      const morningEntries = schedule.entries.filter(
        (e: any) => e.day === day && e.shift === 'morning'
      );
      const afternoonEntries = schedule.entries.filter(
        (e: any) => e.day === day && e.shift === 'afternoon'
      );

      const maxEntries = Math.max(morningEntries.length, afternoonEntries.length, 1);
      // Increased row height to accommodate all fields (course code, name, instructor, room, time, session)
      const rowHeight = Math.max(maxEntries * 26, 30);

      // Day cell
      if (dayIndex % 2 === 0) {
        doc.setFillColor(250, 250, 250);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      doc.roundedRect(startX, y, dayColWidth, rowHeight, 2, 2, 'F');
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const centerX = startX + dayColWidth / 2;
      doc.text(day, centerX - doc.getTextWidth(day) / 2, y + rowHeight / 2);

      // Morning cell
      if (dayIndex % 2 === 0) {
        doc.setFillColor(250, 250, 250);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      doc.roundedRect(startX + dayColWidth, y, timeColWidth, rowHeight, 2, 2, 'F');
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      
      let morningY = y + 5;
      if (morningEntries.length === 0) {
        doc.setTextColor(150, 150, 150);
        doc.text('No classes', startX + dayColWidth + 3, morningY);
      } else {
        morningEntries.forEach((entry: any) => {
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.text(`${entry.courseCode || 'N/A'}`, startX + dayColWidth + 3, morningY);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          const courseName = entry.courseName || 'Course Name';
          doc.text(`${courseName.substring(0, 30)}${courseName.length > 30 ? '...' : ''}`, startX + dayColWidth + 3, morningY + 4);
          doc.text(`Instructor: ${entry.instructorName || 'TBA'}`, startX + dayColWidth + 3, morningY + 8);
          doc.text(`Room: ${entry.roomNumber || 'Not Assigned'}`, startX + dayColWidth + 3, morningY + 12);
          doc.text(`Time: ${entry.startTime || 'N/A'}-${entry.endTime || 'N/A'}`, startX + dayColWidth + 3, morningY + 16);
          doc.text(`Session: ${entry.shift || 'N/A'}`, startX + dayColWidth + 3, morningY + 20);
          morningY += 24;
        });
      }

      // Afternoon cell
      if (dayIndex % 2 === 0) {
        doc.setFillColor(250, 250, 250);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      doc.roundedRect(startX + dayColWidth + timeColWidth, y, timeColWidth, rowHeight, 2, 2, 'F');
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      
      let afternoonY = y + 5;
      if (afternoonEntries.length === 0) {
        doc.setTextColor(150, 150, 150);
        doc.text('No classes', startX + dayColWidth + timeColWidth + 3, afternoonY);
      } else {
        afternoonEntries.forEach((entry: any) => {
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.text(`${entry.courseCode || 'N/A'}`, startX + dayColWidth + timeColWidth + 3, afternoonY);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          const courseName = entry.courseName || 'Course Name';
          doc.text(`${courseName.substring(0, 30)}${courseName.length > 30 ? '...' : ''}`, startX + dayColWidth + timeColWidth + 3, afternoonY + 4);
          doc.text(`Instructor: ${entry.instructorName || 'TBA'}`, startX + dayColWidth + timeColWidth + 3, afternoonY + 8);
          doc.text(`Room: ${entry.roomNumber || 'Not Assigned'}`, startX + dayColWidth + timeColWidth + 3, afternoonY + 12);
          doc.text(`Time: ${entry.startTime || 'N/A'}-${entry.endTime || 'N/A'}`, startX + dayColWidth + timeColWidth + 3, afternoonY + 16);
          doc.text(`Session: ${entry.shift || 'N/A'}`, startX + dayColWidth + timeColWidth + 3, afternoonY + 20);
          afternoonY += 24;
        });
      }

      y += rowHeight + 2;
    });

    // Footer
    const footerY = pageHeight - 15;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, footerY, pageWidth - margin, footerY);
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    const footerText = `Generated by Wachemo University Class Schedule System | Page 1`;
    doc.text(
      footerText,
      pageWidth / 2 - doc.getTextWidth(footerText) / 2,
      footerY + 8
    );

    return Buffer.from(doc.output('arraybuffer'));
  }

  /**
   * Export schedule to JSON
   */
  async exportToJSON(scheduleId: string): Promise<any> {
    const schedule = await Schedule.findById(scheduleId)
      .populate('batchId')
      .populate('semesterId');
    
    if (!schedule) {
      throw new Error('Schedule not found');
    }

    return {
      batch: schedule.batchId,
      semester: schedule.semesterId,
      section: schedule.section,
      department: schedule.department,
      entries: schedule.entries,
      generatedAt: schedule.generatedAt,
      status: schedule.status,
    };
  }
}

export default new ExportService();
