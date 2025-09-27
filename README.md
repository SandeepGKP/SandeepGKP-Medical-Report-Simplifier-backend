# Medical Report Simplifier Backend

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technologies Used](#technologies-used)
4. [Prerequisites](#prerequisites)
5. [Installation](#installation)
6. [Environment Setup](#environment-setup)
7. [Sample Input Formats](#sample-input-formats)
8. [Data Input Formats](#data-input-formats)
9. [Running Instructions](#running-instructions)
10. [API Documentation](#api-documentation)
11. [File Upload Guidelines](#file-upload-guidelines)
12. [Postman Testing](#postman-testing)
13. [Backend Flow Diagram](#backend-flow-diagram)

---

## Project Overview

The **Medical Report Simplifier Backend** is a Node.js/Express application that processes medical test reports such as:

```
CBC: Hemoglobin 10.2 g/dL (Low), WBC 11,200 /uL (High)
```

**Features:**

* Accepts **image uploads** (JPG, PNG) and **direct text input**
* Performs **OCR** using Tesseract.js for text extraction from images
* Fuzzy matches **test names** for normalization
* Interprets results against **standard reference ranges**
* Generates **patient-friendly summaries** for abnormal results
* Provides a **RESTful API** with multipart file upload support

---

## Architecture

```
Medical Report Simplifier Backend
├── server.js                    # Express app entry point
├── routes/
│   └── reports.js               # API routes (/api/process-report)
├── controllers/
│   └── reportController.js      # Processing logic
├── utils/
│   ├── ocr.js                   # OCR extraction
│   ├── normalize.js             # Test normalization
│   └── summary.js               # Summary generation
└── data/
    └── referenceTests.json      # Standard test reference ranges
```

**Flow:**

1. File/Text upload → `/api/process-report`
2. OCR processing (if image)
3. Regex-based test extraction
4. Fuzzy normalization & status evaluation
5. Patient-friendly summary generation
6. JSON response with tests, summary, explanations, and status

---

## Technologies Used

* **Express.js** – Web framework for APIs
* **Tesseract.js** – OCR for image processing
* **Fuse.js** – Fuzzy search for test name matching
* **Multer** – File upload handling

---

## Prerequisites

* Node.js >= 14
* npm (Node Package Manager)

---

## Installation

```bash
git clone https://github.com/SandeepGKP/SandeepGKP-Medical-Report-Simplifier-backend.git
cd medical-report-simplifier-backend
npm install
```

---

## Environment Setup

* **PORT** – Configurable server port (default: 5000)

Dependencies installed via `npm install` include:
`express`, `multer`, `tesseract.js`, `fuse.js`

**Reference Data:**

* `data/referenceTests.json` contains supported medical tests, units, reference ranges, and explanations.

---

## Sample Input Formats

### 1. File Upload

Upload a text or image file containing tests. Example text file:

```
Hemoglobin 13.5 g/dL
Glucose 95 mg/dL
```

### 2. Raw JSON Input

```json
{
  "type": "text",
  "content": "CBC: Hemoglobin 10.2 g/dL (Low), WBC 11,200 /uL (High)"
}
```

---

## Data Input Formats

### Text File Input

* Format: `TestName Value Unit` (one test per line)
* Examples:

```
Hemoglobin 13.5 g/dL
Glucose 95 mg/dL
TSH 2.5 mIU/L
Lymphocytes 30 %
```

### Image File Input

* Supported formats: JPG, PNG, BMP
* Clear, straight, well-lit images recommended
* OCR confidence must be ≥ 70%

---

## Running Instructions (Local Development)

```bash
npm run dev    # Development mode
npm start      # Production mode
```

* Server runs on: `http://localhost:5000`
* Health check: visit `http://localhost:5000/api` → should return "Server is working"

---

## API Documentation

### Base URL

* Local: `http://localhost:5000`
* Deployed: `https://sandeepgkp-medical-report-simplifier.onrender.com`

### POST /api/process-report

* Method: POST
* Content-Type: multipart/form-data
* Body: Form-data with file upload (text/image)

**Sample Input raw JSON:**

```json
{
  "type": "text",
  "content": " Hemoglobin 10.2 g/dL (Low), WBC 11,200 /uL (High)"
}

```

**Success Response:**

```json
{
  "tests": [
    {
      "name": "Hemoglobin",
      "value": 13.5,
      "unit": "g/dL",
      "status": "normal",
      "ref_range": {"low": 12.0,"high": 15.0}
    },
    {
      "name": "Glucose",
      "value": 95,
      "unit": "mg/dL",
      "status": "normal",
      "ref_range": {"low": 70,"high": 100}
    }
  ],
  "summary": "All test values are normal.",
  "explanations": [],
  "status": "ok"
}
```

**Error Responses:**

* No file uploaded:

```json
{"status":"error","message":"No file uploaded"}
```

* Unprocessed / Hallucinated test:

```json
{"status":"unprocessed","reason":"hallucinated tests not present in input"}
```

* Low OCR confidence:

```json
{"status":"unprocessed","reason":"Please take a clear photo and ensure the text is legible"}
```

* Internal server error:

```json
{"status":"error","message":"Error description"}
```

---

## File Upload Guidelines

* Images: JPG/PNG, clear text, proper lighting
* Text files: UTF-8 encoded, format TestName Value Unit
* Minimum OCR confidence: 70%

---

## Postman Testing

Steps:

1. Open Postman → New Request → POST
2. URL: `http://localhost:5000/api/process-report`
3. Headers → Content-Type: multipart/form-data
4. Body → form-data → Key: file → select your file

**Example 1 – Normal Test Values**
Text file contents:

```
TSH 2.5 mIU/L
Lymphocytes 30 %
```

Response:

```json
{
  "tests":[
    {"name":"TSH","value":2.5,"unit":"mIU/L","status":"normal","ref_range":{"low":0.4,"high":4.0}},
    {"name":"Lymphocytes","value":30,"unit":"%","status":"normal","ref_range":{"low":20,"high":40}}
  ],
  "summary":"All test values are normal.",
  "explanations":[],
  "status":"ok"
}
```

**Example 2 – No File Uploaded**
Response:

```json
{"status":"error","message":"No file uploaded"}
```

---

## Backend Flow Diagram

```
                 ┌──────────────┐
                 │  User Input  │
                 │ Text / Image │
                 └─────┬────────┘
                       │
                       ▼
               ┌──────────────┐
               │  /api/process│
               │   -report    │
               └─────--|──────|
                       │
        ┌──────────────┴───────────────┐
        │                              │
        ▼                              ▼
┌──────────────┐                 ┌──────────────┐
│ OCR Module   │                 │ Text Parsing │
│ (Tesseract)  │                 │ Regex/Logic  │
└─────┬────────┘                 └─────┬────────┘
      │                                │
      └──────────────┬──────────────────┘
                     ▼
              ┌──────────────┐
              │ Normalization│
              │ Fuse.js      │
              └─────┬────────┘
                    │
                    ▼
              ┌──────────────┐
              │ Summary /    │
              │ Explanation  │
              └─────┬────────┘
                    │
                    ▼
              ┌──────────────┐
              │ JSON Output  │
              │ (tests,      │
              │ summary,     │
              │ explanations,|
              | status)      │
              |--------------|
```
