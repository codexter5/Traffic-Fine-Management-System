const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const outputPath = path.join(__dirname, 'Traffic_Fine_Management_Academic_Report.pdf');

const doc = new PDFDocument({
  size: 'A4',
  margin: 55,
  info: {
    Title: 'Traffic Fine Management System - Academic Report',
    Author: 'Project Team',
    Subject: 'Academic format implementation report',
  },
});

doc.pipe(fs.createWriteStream(outputPath));

const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

function setBody() {
  doc.font('Times-Roman').fontSize(11).fillColor('#111827');
}

function coverPage() {
  doc.moveDown(3);
  doc.font('Times-Bold').fontSize(22).text('Traffic Fine Management System', {
    width: pageWidth,
    align: 'center',
  });
  doc.moveDown(0.6);
  doc.font('Times-Bold').fontSize(15).text('Academic Implementation Report', {
    width: pageWidth,
    align: 'center',
  });
  doc.moveDown(2);

  setBody();
  doc.text('Course Project Documentation', { align: 'center' });
  doc.moveDown(0.5);
  doc.text('Department of Computer Science / Information Technology', { align: 'center' });
  doc.moveDown(0.5);
  doc.text('Date: March 16, 2026', { align: 'center' });

  doc.moveDown(8);
  doc.font('Times-Italic').fontSize(10).fillColor('#4B5563').text(
    'This report summarizes architecture, implementation, testing, and key outcomes of the Traffic Fine Management System developed using React, Node.js, Express, and MongoDB.',
    { width: pageWidth, align: 'center', lineGap: 2 }
  );

  doc.addPage();
}

function heading(text) {
  doc.moveDown(0.3);
  doc.font('Times-Bold').fontSize(15).fillColor('#111827').text(text, { width: pageWidth });
  doc.moveDown(0.2);
}

function subheading(text) {
  doc.moveDown(0.2);
  doc.font('Times-Bold').fontSize(12).fillColor('#111827').text(text, { width: pageWidth });
  doc.moveDown(0.1);
}

function paragraph(text) {
  setBody();
  doc.text(text, { width: pageWidth, lineGap: 3, align: 'justify' });
  doc.moveDown(0.4);
}

function bullet(text) {
  setBody();
  doc.text(`• ${text}`, { width: pageWidth, lineGap: 2, indent: 14 });
}

function bullets(items) {
  items.forEach((item) => bullet(item));
  doc.moveDown(0.35);
}

function line() {
  doc.moveDown(0.2);
  doc.strokeColor('#D1D5DB').lineWidth(0.8).moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
  doc.moveDown(0.45);
}

function ensureSpace(min = 140) {
  if (doc.y > doc.page.height - min) doc.addPage();
}

coverPage();

heading('Abstract');
paragraph('The Traffic Fine Management System is a role-based web platform that digitizes traffic fine operations for admins, officers, and drivers. The project replaces manual fine processing with a secure and traceable workflow that includes fine issuance, payment tracking, notifications, disputes, analytics, and audit logging. The implementation follows a three-tier architecture with a React frontend, Node.js/Express backend, and MongoDB persistence. This report documents design decisions, implemented modules, feature evolution, and validation outcomes.');

heading('Table of Contents');
bullets([
  '1. Introduction',
  '2. Problem Statement and Objectives',
  '3. System Architecture and Technology Stack',
  '4. Database Design and Core Data Models',
  '5. Backend Implementation',
  '6. Frontend Implementation',
  '7. Major Feature Enhancements Completed',
  '8. Testing and Validation',
  '9. Limitations and Future Scope',
  '10. Conclusion',
]);
line();

heading('1. Introduction');
paragraph('Traffic fine operations require consistency, accountability, and timely communication among traffic authorities and citizens. Traditional paper-driven or fragmented digital processes often create delays and weak traceability. This project was developed to provide an end-to-end operational system where officers can issue fines, admins can monitor system health and revenue, and drivers can transparently view and settle liabilities.');

heading('2. Problem Statement and Objectives');
subheading('2.1 Problem Statement');
paragraph('The target scenario involves managing high-volume violation records with role-specific permissions, while ensuring secure access and reliable history tracking. A key practical challenge is handling non-standard or emerging violation rules during real-world enforcement.');
subheading('2.2 Objectives');
bullets([
  'Build a role-based full-stack platform for traffic fine lifecycle management.',
  'Implement secure authentication and authorization using JWT and RBAC.',
  'Provide transparent dashboards and records for each user role.',
  'Support custom violation creation by officers/admins during fine issuance.',
  'Introduce auditability, notifications, dispute handling, and exportable records.',
]);

ensureSpace();
heading('3. System Architecture and Technology Stack');
paragraph('The implementation follows a layered architecture: (i) Presentation Layer using React and Tailwind CSS, (ii) Application Layer using Express controllers and middleware, and (iii) Data Layer using MongoDB with Mongoose schemas and references. Axios is used for API communication. JWT tokens secure protected operations.');
bullets([
  'Frontend: React (Vite), React Router, Tailwind CSS, Axios.',
  'Backend: Node.js, Express, Mongoose, JWT authentication middleware.',
  'Database: MongoDB collections with indexed references for query efficiency.',
  'Security controls: protected routes, role checks, validated payload handling.',
]);

heading('4. Database Design and Core Data Models');
paragraph('Core collections include Users, Drivers, Vehicles, Violations, Fines, Payments, Notifications, and Audit Logs. Fines link to driver, vehicle, violation, and issuing user records. Payments map to fines and store transaction metadata. Notifications and audit logs capture event-level state changes for transparency.');
bullets([
  'Fine model expanded with dispute sub-document and indexed dispute status.',
  'Violation model supports code, description, defaultAmount, points, and active state.',
  'AuditLog model tracks actor, action, related fine/payment, and metadata.',
]);

ensureSpace();
heading('5. Backend Implementation');
subheading('5.1 API Expansion');
bullets([
  'Fine APIs expanded with search, edit, cancel, dispute submission, and dispute resolution.',
  'Payment API expanded with role-aware history retrieval and search/filter support.',
  'Admin APIs expanded with monthly analytics, violation breakdown, and audit-log retrieval.',
  'Violation API expanded with POST endpoint for creating custom violations (officer/admin).',
]);
subheading('5.2 Access Control');
bullets([
  'Admin and officer roles can create custom violations and manage fine lifecycle actions.',
  'Drivers can only access their own fines, submit disputes, and pay eligible fines.',
  'Action-level validation prevents invalid transitions (e.g., paid fine edits).',
]);
subheading('5.3 Reliability and Traceability');
bullets([
  'Notification events are generated for fine issuance and payment outcomes.',
  'Audit log entries persist high-value operational events for administrative review.',
]);

ensureSpace();
heading('6. Frontend Implementation');
subheading('6.1 New/Enhanced Pages');
bullets([
  'Fines list upgraded with global search, dispute controls, due countdown badges, and CSV export.',
  'Payments page upgraded with filters, totals, role-aware visibility, and CSV export.',
  'Notifications page added with tabbed views and read-state management.',
  'Edit Fine page added for officer/admin correction workflows.',
  'Audit Logs page added for admin-level traceability.',
]);
subheading('6.2 UX and Navigation Improvements');
bullets([
  'Unified top navigation with role-aware routes and improved visual hierarchy.',
  'Notification bell supports click-through to relevant records.',
  'Refined filter bars and cleaner table presentation across management screens.',
]);
subheading('6.3 Custom Violation UX (Requested Feature)');
paragraph('On the Issue Fine page, officers/admins can now create a custom violation inline by entering code, description, amount, and optional points. After successful creation, the new violation is added to the dropdown, auto-selected, and the fine amount is prefilled, enabling immediate use in the same charging flow.');

ensureSpace();
heading('7. Major Feature Enhancements Completed');
bullets([
  'Admin-on-admin protection for user management operations.',
  'Self-profile update flow for all roles with role-specific editable fields.',
  'Driver private vehicles management.',
  'Notifications expanded to all users with dedicated notifications page.',
  'Dispute lifecycle from submission to administrative resolution.',
  'Admin analytics (monthly fines/revenue and violation ranking).',
  'Audit logging and audit review UI.',
  'Custom violation creation during fine issuance.',
]);

heading('8. Testing and Validation');
paragraph('Validation was carried out incrementally after implementation batches. Backend files were syntax-checked using node --check, and frontend production builds were executed to verify route integration, module compilation, and UI rendering compatibility. Problem diagnostics showed no blocking compile errors in changed files at validation checkpoints.');
bullets([
  'Backend syntax validation completed on modified controllers/routes/models.',
  'Frontend production build completed successfully after feature merges.',
  'Feature wiring verified through endpoint integration and route access controls.',
]);

ensureSpace();
heading('9. Limitations and Future Scope');
bullets([
  'Some interactions still use prompt-based input and should be migrated to modal forms.',
  'Automated integration tests for dispute and notification flows can be expanded.',
  'Pagination and server-side optimization can be added for very large audit datasets.',
  'Advanced charting and downloadable academic report appendix sections can be added.',
]);

heading('10. Conclusion');
paragraph('The project now delivers a comprehensive and practically usable traffic fine platform with robust role-based workflows, better transparency, and improved operational control. The newly added custom violation capability directly addresses field-level flexibility for officers/admins while preserving validation and governance. The current system state is suitable for academic evaluation and can be evolved toward production-grade readiness with additional testing and deployment hardening.');

line();
setBody();
doc.font('Times-Italic').fontSize(10).fillColor('#4B5563').text('End of Academic Report', { align: 'center' });

doc.end();
console.log(`Academic PDF generated: ${outputPath}`);
