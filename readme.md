# Ashwini HMS — Frontend

The modern, React-based clinical dashboard for Ashwini Hospital Management System. Built with Next.js 15 and React 19, this dashboard provides a high-performance, isolated workspace for doctors, pharmacists, and technicians.

---

## 🚀 Vision

To provide healthcare professionals with a unified, intuitive, and high-speed interface that reduces cognitive load and allows them to focus on patient care. The Ashwini Frontend is designed for precision, security, and HIPAA compliance.

---

## ✨ Core Modules (Phase 1)

### 👨‍⚕️ Doctor Dashboard
- **Live Queue Management:** Real-time visibility into the OP queue.
- **Isolated Consultation Workspace:** Secure, patient-specific environment for clinical notes and prescriptions.
- **Annotation Canvas:** Interactive Konva-based markup tool for Orthopedics and Dental specialties.
- **Visit History & Analytics:** Comprehensive longitudinal record review.

### 💊 Pharmacy Portal
- **Order Fulfillment:** Direct link to doctor prescriptions for accurate dispensing.
- **Inventory Management:** Real-time SKU tracking and low-stock alerts.

### 🧪 Diagnostics (Labs & Radiology)
- **Imaging Portal:** High-resolution image viewer for Radiology (X-Ray, CT, etc.).
- **Lab Workspace:** Dynamic data entry for pathology results with reference range validation.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Canvas/Drawing:** [Konva](https://konvajs.org/) via `react-konva`
- **Icons:** [Lucide React](https://lucide.dev/)
- **State Management:** React Context & Custom Hooks
- **Type Safety:** TypeScript

---

## 💻 Local Development

### 1. Prerequisites
- **Node.js 18+**
- **npm** or **pnpm**

### 2. Setup
```bash
# Navigate to the directory
cd ashwini-frontend

# Install dependencies
npm install
```

### 3. Running the Application
```bash
npm run dev
```
The dashboard will be available at: `http://localhost:3000`

---

## 🔒 Security & HIPAA Compliance
- **PII Masking:** Automatic masking of patient data in UI components and browser history.
- **Session Security:** Automatic timeout and secure JWT handling.
- **Encryption:** All data in transit is encrypted via HTTPS.
- **Role-Based Views:** UI components conditionally render based on authenticated user roles.

---

## 🤝 Contributing
Internal development for **sureksha4u**. Follow the specialized AI Agent pipeline for all code and architectural changes.

---

## 📄 License
Private Property of sureksha4u. All rights reserved.
