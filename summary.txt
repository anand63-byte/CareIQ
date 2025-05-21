MediInsight Project Summary:

MediInsight is a comprehensive web application designed to streamline medical data management and analysis for patients and doctors. The project is built using a modern tech stack, including React for the frontend and Node.js with Express for the backend. MongoDB is used as the database to store user, doctor, and report data.

Key Features:
1. **User Management**:
   - Patients and doctors can sign up and log in using secure authentication with JWT tokens.
   - Users can manage their medical reports and associated doctors.

2. **Report Management**:
   - Patients can upload medical reports in image or PDF format.
   - Reports are processed using Tesseract.js for text extraction and stored in MongoDB.
   - Doctors can view and analyze patient reports.

3. **AI-Powered Analysis**:
   - Google GenAI is integrated to provide detailed analysis of medical reports.
   - Features include summarizing key findings, identifying abnormalities, and recommending follow-up actions.

4. **Doctor-Patient Interaction**:
   - Doctors can manage their list of patients and view their reports.
   - Patients can add or remove doctors from their profile.

5. **Specialized Tools**:
   - Prescription decoding to extract and summarize medication details.
   - Medicine decoding to provide detailed information about medicines, including dosage, side effects, and storage instructions.

6. **Frontend**:
   - Built with React and styled using Tailwind CSS.
   - Includes components for uploading reports, viewing analysis, and managing user profiles.

7. **Backend**:
   - Built with Node.js and Express.
   - Includes APIs for user authentication, report management, and AI-powered analysis.
   - Uses Multer for file uploads and pdf-poppler for PDF-to-image conversion.

8. **Database**:
   - MongoDB is used to store user, doctor, and report data.
   - Relationships between users, doctors, and reports are managed using Mongoose.

9. **Deployment**:
   - The frontend is served as static files from the backend, enabling both to run on the same server.

This project provides a seamless experience for managing and analyzing medical data, making it a valuable tool for both patients and healthcare professionals.
