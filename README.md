# ACity Connect – Frontend

**Student:** Nana Kwame Kwabi Nyako  
**Student ID:** 10012400018  
**Course:** IT2239 – Web Technologies and Development  

---

## Project Overview

ACity Connect is a smart campus marketplace and skill exchange platform built for Academic City University students. It allows students to post items for sale, offer skills, message each other, and interact with listings. Only students with a valid ACity email can register.

---

## Deployment Links

- **Frontend (GitHub Pages):** https://codiphy-sys.github.io/acity-connect-frontend
- **Backend (Render):** https://acity-connect-backend-r2zh.onrender.com

---

## Login Details

| Role | Email | Password |
|------|-------|----------|
| Admin | nkknyako@acity | 12345678 |
| Test User | testuser@acitystudents.edu.gh | 12345678 |

---

## Feature Checklist

### User System and Profiles
- ✅ Secure registration and login with JWT
- ✅ Registration restricted to ACity student emails
- ✅ User profile page with personal info, skills offered and skills needed
- ✅ Users can update their profile information

### Marketplace and Listings
- ✅ Users can post items for sale
- ✅ Users can offer or request skills
- ✅ Each listing has title, description, category and status
- ✅ Searchable and filterable feed of listings

### Interaction and Communication
- ✅ Users can express interest in listings
- ✅ Messaging system between users
- ✅ Users can track the status of their listings

### Admin Features
- ✅ Admin can approve, edit or delete listings
- ✅ Admin can flag or remove inappropriate content
- ✅ Admin dashboard shows platform activity and stats

---

## Installation Instructions

To run the frontend locally:

1. Clone the repository
```
git clone https://github.com/codiphy-sys/acity-connect-frontend.git
```

2. Open the project folder in VS Code

3. Make sure the backend is running locally or update the BASE_URL in `js/api.js` to the Render backend URL

4. Right-click `index.html` and select **Open with Live Server**

5. The site will open at `http://127.0.0.1:5500`

---

## Tech Stack

- HTML, CSS, JavaScript
- Hosted on GitHub Pages
