# connect-backend

to run - npm install && npm run dev

PROJECT ASHWINI
Hospital Management Software
Product Requirements Document — Doctor Dashboard
Version	1.1
Target Release	May 15, 2025
Module	Doctor Dashboard
Part of	Ashwini HMS (multi-role platform)
Status	Draft — For Review

1. Product Context
Ashwini is a multi-role hospital management platform. Each role — Doctor, Receptionist, Pharmacist, X-Ray Technician, Pathology, Scanning — gets its own purpose-built dashboard. All dashboards share a single patient record and communicate through a common backend.

This document scopes the Doctor Dashboard only. Adjacent dashboards (Receptionist, Pharmacy, X-Ray, Pathology, Scanning) are covered in their own PRDs.

Role / Dashboard	Primary Job	Interacts with Doctor Dashboard via
Receptionist	Check-in, queue management, billing	Pushes patient into queue; receives follow-up date
Pharmacist	Dispense medication, manage stock	Receives prescription order; sends stock availability
X-Ray Technician	Image capture and upload	Doctor requests scan; technician uploads; doctor views
Pathology / Lab	Run tests, upload results	Doctor orders labs; results appear in patient record
Scanning / USG	Ultrasound and imaging reports	Same request-and-view flow as X-Ray


# Doctor Dashboard

The Doctor Dashboard is the doctor-facing clinical workspace inside Ashwini HMS. It is designed to help a doctor move from patient queue to consultation, prescription, investigations, and visit completion without switching systems.

## Core Dashboard Flow

The doctor home screen contains two primary sections:

### 1. Global Patient Search
A global search bar allows the doctor to search across all patients using:
- patient name
- phone number
- unique patient number / UHID

This search will be powered by `pgvector` to support fast retrieval and flexible search matching across patient records.

### 2. Patient Queue
The patient queue is populated from the Receptionist APIs.  
This is the live working list for the doctor during OPD / consultation hours.

Each patient card in the queue can show:
- token number
- patient name
- consultation state
- status badge such as Waiting, In Consultation, Completed, X-Ray Pending

## Patient Context Isolation

When the doctor clicks a patient from the queue or search results, the system opens a dedicated patient consultation screen.

From that point onward, the doctor is working inside an isolated patient context. This means:
- all actions are scoped to the selected patient
- all reads and writes happen only for that patient record
- all clicks, edits, uploads, summaries, prescriptions, and orders belong to that patient encounter

This isolation is important to reduce mistakes and ensure patient-safe workflows.

---

# Consultation Lifecycle

Each patient consultation follows a controlled workflow:

### Start Consultation
A consultation must be explicitly started before any patient data can be edited.

Until `Start Consultation` is clicked:
- patient data is visible in read-only mode
- no clinical edits are allowed
- no prescription, notes, or orders can be changed

### During Consultation
Once consultation starts:
- the record becomes editable
- the doctor can write notes, prescriptions, mark procedures, upload/view reports, and review history

### End Consultation
When the doctor clicks `End Consultation`:
- all updated data is saved
- the encounter is finalized
- the consultation returns to read-only state
- audit logs are written for all operations

---

# Tabs in Patient Consultation Screen

The patient consultation screen is organized into the following tabs:

## 1. Overview

The Overview tab provides the doctor with a quick clinical snapshot.

It includes:
- Chief Complaint
- Vitals
- Patient Summary
- Total Visits
- Last Visit Summary

This tab is meant to answer:  
**Who is this patient, why are they here, and what do I need to know immediately?**

---

## 2. Prescription

The Prescription tab is designed to reduce repetitive typing and speed up doctor workflows.

### Template-Driven Prescription Model
Prescription generation will be based on:
- doctor
- specialty
- procedure type

Each doctor usually handles a limited set of recurring procedure / treatment types, roughly 8 to 10 common patterns.  
The system will allow creation of prescription templates for these recurring cases so doctors do not have to write the same prescription repeatedly.

The initial scope will target two specialties:
- Orthopedics
- Dental

### Dynamic Prescription Filling
Templates should not be static only.  
They should support dynamic filling so parts of the prescription can change based on:
- patient condition
- selected procedure
- visit details
- doctor edits during consultation

### Clinical Annotation Canvas
At the top of the Prescription tab, there will be an interactive annotation canvas.

This canvas allows the doctor to:
- click
- mark
- draw
- highlight
- write notes
- edit visual references
- upload an image and annotate it

Examples:
- **Dental:** doctor can use a teeth diagram, click specific teeth, mark areas, and write notes
- **Orthopedics:** doctor can annotate body/joint reference images similarly

The expected UX should feel simple and intuitive, similar to image markup tools used in messaging apps.

### Medicines / Tablets
Tablet and medication workflows will be supported here, but this can be scoped in later phases.

---

## 3. Labs

The Labs tab contains all lab-related information for the patient.

This includes:
- ordered tests
- available lab reports
- lab work data
- result history relevant to the consultation

---

## 4. Radiology

The Radiology tab handles imaging records.

It includes:
- upload X-Ray / radiology documents
- view uploaded X-Ray / radiology documents

This should support smooth doctor review during consultation.

---

## 5. History

The History tab contains a visit-wise historical record for the patient.

Each visit history may include:
- prescription
- tablets / medication
- procedure
- treatment details

This tab gives the doctor full continuity of care across encounters.

---

## 6. Analytics

The Analytics tab provides decision-support and follow-up insights.

Initial analytics scope includes:
- X-Ray Adherence
- Pharmacy Refills
- Risk Assessment

This tab is intended to surface patterns, patient compliance, and possible clinical risks.

---

# API Requirements

The Doctor Dashboard will require clear API design across all modules.

At minimum, we need to plan:
- `GET` APIs for fetching queue, patient data, visit history, labs, radiology, analytics, templates
- `POST` APIs for creating consultations, prescriptions, annotations, uploads, orders
- `PUT` APIs for updating consultation state, patient notes, prescriptions, template edits, and encounter completion

Suggested API groups:
- queue APIs
- patient search APIs
- consultation lifecycle APIs
- overview APIs
- prescription APIs
- template APIs
- lab APIs
- radiology APIs
- history APIs
- analytics APIs
- audit log APIs

---

# Security and Compliance Requirements

## Encryption
All patient-related data must be:
- encrypted at rest
- encrypted in transit

This applies to:
- records
- prescriptions
- images
- uploads
- notes
- reports
- analytics outputs
- audit metadata where applicable

## Audit Logging
Every operation performed in the Doctor Dashboard must be logged.

This includes:
- record views
- consultation start / end
- edits
- prescription creation / modification
- annotation activity
- report uploads
- report views
- API-triggered updates
- status transitions

Audit logs must be retained for **at least 1 year**.

---

# Functional Summary

In short, the Doctor Dashboard should support:

- global patient search across all records
- live patient queue from receptionist systems
- isolated patient consultation workspace
- explicit consultation start/end workflow
- overview snapshot for quick decision-making
- specialty-aware prescription templates
- visual annotation canvas for dental and ortho use cases
- lab and radiology review
- complete visit history
- analytics for follow-up and risk monitoring
- secure APIs for all read/write flows
- encrypted storage and encrypted transport
- one-year minimum audit logging


# Screens

![header](image-5.png)
![overview](image-1.png)
![prescription](image-2.png)
![history](image-3.png)
![analytics](image-4.png)