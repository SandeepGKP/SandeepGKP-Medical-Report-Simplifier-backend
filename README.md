# Medical Report Simplifier Backend

## Project Overview and Purpose

The Medical Report Simplifier Backend is a Node.js/Express application designed to process medical laboratory reports. It accepts uploaded report files (images or text) and transforms complex medical test results into patient-friendly summaries. The system uses OCR (Optical Character Recognition) to extract text from images, normalizes medical test names and values against standard reference ranges, and generates simplified explanations of abnormal findings.

Key features:
- Supports both image uploads (photos of lab reports) and direct text uploads
- OCR-powered text extraction from images using Tesseract.js
- Fuzzy matching for test name normalization
- Automatic interpretation of test results against standard reference ranges
- Patient-friendly summary and explanation generation
- RESTful API design with multipart file upload support

## Architecture

```
Medical Report Simplifier Backend
├── server.js                    # Express app entry point
├── routes/
│   └── reports.js              # API routes (/process endpoint)
├── controllers/
│   └── reportController.js     # Main processing logic
├── utils/
│   ├── ocr.js                 # Tesseract.js text extraction
│   ├── normalize.js           # Test normalization with fuzzy matching
│   └── summary.js             # Summary generation
└── data/
    └── referenceTests.json    # Standard test reference ranges
```

### Architecture Flow:
1. **File Upload**: Accepts multipart form data via `/process` endpoint
2. **OCR Processing**: If image file, extracts text using Tesseract.js
3. **Text Extraction**: Uses regex to identify test patterns (name, value, unit)
4. **Normalization**: Fuzzy matches test names against reference database, determines normal/abnormal status
5. **Summary Generation**: Creates patient-friendly explanations for abnormal results
6. **Response**: Returns final output with structured JSON having tests, summary, explanations and status

### Technologies Used:
- **Express.js**: Web framework for API endpoints
- **Tesseract.js**: OCR engine for text extraction from text file or image file
- **Fuse.js**: Fuzzy search library for test name matching
- **Multer**: Middleware for handling multipart/form-data file uploads

## Prerequisites

- Node.js (version 14 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/SandeepGKP/SandeepGKP-Medical-Report-Simplifier-backend.git
cd medical-report-simplifier-backend
```

2. Install dependencies:
```bash
npm install
```

## Environment Setup

The application uses the following dependencies (automatically installed via npm):
- `express`: Web framework
- `multer`: File upload handling
- `tesseract.js`: OCR functionality
- `fuse.js`: Fuzzy search for test name normalization

### Environment Variables (Optional)
The application currently runs on a configurable port with no external service dependencies:

- `PORT`: Server port (defaults to 5000 if not set)

### Test Data Reference
The `data/referenceTests.json` file contains the database of supported medical tests that users can process. It includes 15+ standard laboratory tests with their units, normal reference ranges, and clinical significance. Users can upload report files containing any combination of these tests, and the system will:

- Extract and normalize test results using fuzzy matching for name variations
- Compare values against standard reference ranges to determine normal/abnormal status
- Generate patient-friendly summaries and explanations for abnormal findings

The supported test categories include:
- **Complete Blood Count**: Hemoglobin, WBC, RBC, Platelets, etc.
- **Chemistry Panel**: Glucose, Sodium, Potassium, Liver enzymes (ALT/AST)
- **Thyroid Panel**: TSH, T3, T4
- **Lipid Panel**: Cholesterol, HDL, LDL, Triglycerides
- **Other Markers**: Bilirubin, Creatinine, BUN, Minerals

Users can upload reports with both standard abbreviations (e.g., "WBC", "TSH") and full names (e.g., "White Blood Cell Count", "Thyroid Stimulating Hormone") due to intelligent fuzzy matching.

**Note:** Currently uses local JSON file for test references; integration with third-party APIs for dynamic reference ranges can be implemented in future updates.

## Data Input Formats

### Text File Input
Text files must contain test results in the specific format: `TestName Value Unit` with each test on a separate line. Examples:

**Correct Format:**
```
Hemoglobin 13.5 g/dL
Glucose 95 mg/dL
TSH 2.5 mIU/L
Lymphocytes 30 %
```

**Requirements:**
- Test name followed by numeric value and unit
- One test result per line
- Spaces separate components
- Values can include decimals
- Extra text around tests will be ignored as long as test patterns are present

### Image File Input
- Supported formats: JPG, PNG, BMP, and other image types
- Images should contain clearly readable medical report text
- Good lighting and straight alignment recommended for optimal OCR accuracy
- System applies OCR to extract text in the same format as text files above
- Minimum OCR confidence threshold of 70% required

## Running Instructions (Local Development)

1. Start the development server:
```bash
npm run dev
```
or
```bash
npm start
```

2. The server will start on `http://localhost:5000` (or your configured PORT)

3. Test the health endpoint:
```bash
curl http://localhost:5000/
```
Should return: "Server is working"

## API Documentation

### Base URL
```
http://localhost:5000
```

**Note:** For users who want to test the API without setting up locally, a deployed version is available at:

```
https://sandeepgkp-medical-report-simplifier.onrender.com
```

Replace `http://localhost:5000` with this URL in the examples below. For local development, continue using `http://localhost:5000`.

### Endpoints

#### POST /process
Process a medical report file (image or text) and return simplified results.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: Form data with file upload

**Parameters:**
- `file`: Medical report file (image formats like JPG, PNG, or text file)

**Example Request:**
```bash
curl -X POST \
  http://localhost:5000/process \
  -F "file=@/path/to/medical_report.jpg"
```

**Success Response (200):**
```json
{
  "tests": [
    {
      "name": "Hemoglobin",
      "value": 13.5,
      "unit": "g/dL",
      "status": "normal",
      "ref_range": {
        "low": 12.0,
        "high": 15.0
      }
    },
    {
      "name": "Glucose",
      "value": 95,
      "unit": "mg/dL",
      "status": "normal",
      "ref_range": {
        "low": 70,
        "high": 100
      }
    }
  ],
  "summary": "All test values are normal.",
  "explanations": [],
  "status": "ok"
}
```

**Error Responses:**
- `400 Bad Request`: No file uploaded
```json
{
  "status": "error",
  "message": "No file uploaded"
}
```

- `200 OK` (Unprocessed - No Tests Extracted):
```json
{
  "status": "unprocessed",
  "reason": "hallucinated tests not present in input"
}
```

- `200 OK` (Unprocessed - Low OCR Confidence):
```json
{
  "status": "unprocessed",
  "reason": "Please take a clear photo and ensure the text is legible"
}
```

- `500 Internal Server Error`: Processing error
```json
{
  "status": "error",
  "message": "Error description"
}
```

### File Upload Guidelines
- **Image files**: JPG, PNG recommended. Ensure good lighting and clear text for best OCR results
- **Text files**: UTF-8 encoded text files with test results in format: `Test Name Value Unit`
- **Minimum OCR confidence**: 70% - below this threshold, processing is rejected with retry instruction

## Sample API Usage

### Using curl (Image Upload):
```bash
curl -X POST \
  -H "Content-Type: multipart/form-data" \
  -F "file=@sample_report.jpg" \
  http://localhost:5000/process
```

### Using curl (Text Upload):
```bash
echo -e "TSH 2.5 mIU/L\nLymphocytes 30 %" > report.txt
curl -X POST \
  -H "Content-Type: multipart/form-data" \
  -F "file=@report.txt" \
  http://localhost:5000/process
```

### Expected Output Format:
- `tests`: Array of normalized test objects with current values, units, and normal/abnormal status
- `summary`: Short text summary of overall report status
- `explanations`: Array of detailed explanations for abnormal findings
- `status`: Processing status ("ok", "unprocessed", or "error")

## Postman Testing

### Setting up the Request
1. Open Postman and create a new request
2. Set method to `POST`
3. Enter URL: `http://localhost:5000/process` // for local machine
4. In the Headers tab:
   - Key: `Content-Type`
   - Value: `multipart/form-data` (this will be auto-set when you add the file)
5. In the Body tab:
   - Select `form-data`
   - Key: `file`, Type: `File`, Select "Choose Files" and pick your report file (JPG, PNG, or text file)

### Sample Requests

#### Request 1: Process normal TSH and Lymphocytes results
- **Method:** POST
- **URL:** http://localhost:5000/process
- **Body (form-data):**
  - Key: `file`, Type: `File`
  - Value: Text file with content:
    ```
    TSH 2.5 mIU/L
    Lymphocytes 30 %
    ```

- **Expected Response:**
```json
{
  "tests": [
    {
      "name": "TSH",
      "value": 2.5,
      "unit": "mIU/L",
      "status": "normal",
      "ref_range": {
        "low": 0.4,
        "high": 4.0
      }
    },
    {
      "name": "Lymphocytes",
      "value": 30,
      "unit": "%",
      "status": "normal",
      "ref_range": {
        "low": 20,
        "high": 40
      }
    }
  ],
  "summary": "All test values are normal.",
  "explanations": [],
  "status": "ok"
}
```

#### Request 2: Process with abnormal results (for testing error handling)
- **Method:** POST
- **URL:** http://localhost:5000/process
- **Body (form-data):** Don't attach any file

- **Expected Response:**
```json
{
  "status": "error",
  "message": "No file uploaded"
}
```
