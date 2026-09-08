# ShopEase — Complete Project Execution & Setup Guide

Use these steps whenever setting up or running this project on a new laptop or after reinstalling.

---

## 1. Prerequisites to Install
* Git
* Node.js (v18 or higher)

---

## 2. Clone the Repository
Open PowerShell or Command Prompt and run:

`ash
git clone [https://github.com/narasimhanarasimha3179-sketch/ecommerce-platform.git](https://github.com/narasimhanarasimha3179-sketch/ecommerce-platform.git)
cd ecommerce-platform
``n
---

## 3. Restore Backend Secrets (.env)

`ash
cd server
notepad .env
``n
Paste your saved keys from your OneDrive backup (OneDrive\Documents\ShopEase_Secrets\.env), save with Ctrl + S, and close Notepad.

---

## 4. Install & Start Backend Server

`ash
npm install
npm run dev
``n
* Backend runs at http://localhost:5000.
* Leave this terminal window running.

---

## 5. Install & Start Frontend Client
Open a second terminal window and run:

`ash
cd ecommerce-platform/client
npm install
npm run dev
``n
* Frontend runs at http://localhost:5173.

---

## 6. Access the Application
Open your browser and navigate to:
http://localhost:5173
