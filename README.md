# Patient Record Management System (PRMS) - React Client

## 🏥 Patient Record Management System

### 🌟 Overview
A comprehensive web application designed to streamline patient record management for healthcare professionals, providing an intuitive and efficient way to handle patient information, medical visits, prescriptions, and reports.

## 🚀 Key Features

### 1. Authentication System
- Secure user login mechanism
- JWT-based authentication
- Protected routes preventing unauthorized access
- Persistent login state using localStorage

### 2. Patient Management
#### Comprehensive Patient Tracking
- Add new patient records
- Edit existing patient information
- Delete patient profiles
- Detailed patient view with multiple information tabs
- Quick search and filter capabilities

#### Patient Details Include:
- Personal Information
- Contact Details
- Age
- Unique Patient ID

### 3. Visits Management
- Record and track patient visits
- Add new visit entries
- View visit history
- Detailed visit information tracking
- Doctor-specific visit logs

#### Visit Details:
- Visit Date
- Diagnosis
- Attending Doctor
- Comprehensive visit notes

### 4. Prescription Management
- Create new prescriptions
- View prescription history
- Detailed prescription tracking
- Associate prescriptions with specific visits

#### Prescription Information:
- Drug Name
- Dosage
- Duration
- Prescribing Doctor
- Prescription Date

### 5. Medical Reports
- Generate and store medical reports
- Multiple report type support
- Easy report creation interface
- Comprehensive report tracking

#### Report Types:
- Lab Test
- Radiology
- Blood Work
- Physical Examination
- Custom report types

### 6. User Interface
- Responsive design
- Bootstrap-powered modern UI
- Intuitive navigation
- Card-based information display
- Modal-based forms for data entry
- Error handling and validation

### 7. Dashboard
- Quick access to key sections
- Overview of patients, visits, prescriptions, and reports
- Navigation shortcuts

## 🛠 Technical Architecture

### Frontend Technologies
- React.js
- React Router
- React Bootstrap
- Fetch API for HTTP requests
- JWT Authentication

### State Management
- React Hooks (useState, useEffect)
- Context API for global state management
- Local storage for persistent authentication

### Security Features
- Token-based authentication
- Protected routes
- Secure API communication
- Client-side input validation

## 🔧 Installation and Setup

### Prerequisites
- Node.js (v14 or later)
- npm or yarn
- Backend API running

### Step-by-Step Installation

1. Clone the Repository
```bash
git clone https://github.com/MdNoman1538/PRMS_Client.git
cd PRMS_Client
npm start
