
# 🛡️ Cybercrime Report & Awareness Portal  

A full-stack web application that allows users to **report cybercrimes**, raise awareness, and explore preventive tips. Built with **React (Vite + JSX + TailwindCSS)** for the frontend and **Supabase (Auth, Database, Storage)** for the backend.  

---

## 🚀 Features  

### 🔑 Authentication  
- Login/Register with **Email** or **Google**  
- Optional **Anonymous Reporting** (uses Firebase Anonymous Auth)  

### 📝 Report Cybercrime  
- Categories: **Fraud, Phishing, Harassment, Deepfake**  
- Fields: Title, Description, Category, Location, Date  
- Upload supporting files (images, PDFs, videos) stored in Firebase Storage  
- Each submission generates a **unique Reference ID**  

### 🎭 Deepfake Reporting  
- Special category for **deepfake content**  
- Video/Image upload support  
- Metadata (filename, upload date, hash) stored for traceability  

### 🌍 Community Scam Wall  
- Public dashboard displaying latest reports in **real-time**  
- Shows Title, Category, Date, Location  

### 🔍 Fraud Lookup Tool  
- Search bar to check if a **phone, email, or website** has been previously reported  

### 📚 Awareness Section  
- Blogs & tips on cybersecurity awareness  
- Admin-only access to **create, edit, delete** articles  

---

## 🗄️ Database Schema (PostgreSQL Tables)  

- **users** → `{ id, email, name, is_anonymous, created_at }`  
- **reports** → `{ id, user_id, category, title, description, location, file_url, reference_id, created_at }`  
- **deepfakes** → `{ id, report_id, file_url, metadata, created_at }`  
- **blogs** → `{ id, title, content, author, created_at }`  

---

## 🛠️ Tech Stack  

**Frontend:**  
- React (Vite)  
- Tailwind CSS  

**Backend & Database:**  
- Supabase Auth (Email, Google, Anonymous)  
- PostgreSQL Database (Realtime Updates)  
- Supabase Storage (File Uploads)  

---

