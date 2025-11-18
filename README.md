# Naratama Library

## URI Deployment

| Frontend                                                   | Backend                                                            |
| ---------------------------------------------------------- | ------------------------------------------------------------------ |
| [https://naratama.runsha.dev](https://naratama.runsha.dev) | [https://api.naratama.runsha.dev](https://api.naratama.runsha.dev) |

## Anggota Kelompok

1. Harun (23/514148/TK/56466)
2. Raditya Ryan Narotama (23/518350/TK/57045)
3. Dhafarel Hariyanto (23/522772/TK/57743)
4. Lalu Kevin Proudy Handal (23/515833/TK/56745)
5. Rafeyfa Asyla (23/512856/TK/56361)

## Tentang Aplikasi

Perpustakaan Naratama masih mengelola peminjaman buku dan ruangan secara manual sehingga pengecekan ketersediaan dan proses peminjaman dirasa tidak efisien.

Oleh karena itu, untuk mengatasinya, aplikasi Manajemen Perpustakaan Naratama menyediakan:

- Pengecekan ketersediaan buku dan ruangan secara real-time
- Peminjaman secara online
- Pengumuman buku baru
- Pilihan commitment fee atau membership

Dengan fitur-fitur tersebut, layanan perpustakaan menjadi lebih cepat, praktis, dan terorganisir.

## Pembagian Kerja

| PIC                      | Role                        | Jobdesc                                                                                                                             |
| ------------------------ | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Harun                    | Project Manager dan Backend | Merancang architecture design, mendelegasikan role dan jobdesc, menentukan techstack back-end, mengembangkan back-end, ngeprompt ai |
| Dhafarel Hariyanto       | Front End                   | Mengerjakan backend dibagian routes users dan peminjaman buku. Seeding database. Membuat tampilan page announcement dan rooms.      |
| Lalu Kevin Proudy Handal | Front End                   | Mengimplementasikan CRUD Books & Rooms di backend, sekaligus mengembangkan tampilan Homepage front-end dengan shadcn/ui             |
| Rafeyfa Asyla            | Front End                   | Mengembangkan backend announcements serta mengimplementasikan frontend Books Management dan User Profile.                           |
| Raditya Ryan Narotama    | Backend                     | Mengembangkan sistem auth dan payment gateway baik dari bagian backend maupun frontend.                                             |

## Teknologi

### Frontend

- **Framework Utama**: Next.js
- **Styling & UI Kit**: Tailwind CSS, shadcn/ui
- **State Management & Utilities**: React Context API

### Backend

- **Framework Backend**: Express.js (Node.js)
- **Basis Data**: PostgreSQL
- **Autentikasi**: OAuth (Google Login)
- **Integrasi Pihak Ketiga**: Payment Gateway (Midtrans)

## Fitur Utama

### User Features

- Homepage dengan katalog buku
- Login & Register (termasuk Login via Google OAuth)
- Book Catalog & Book Detail
- Book Loans (Peminjaman Buku)
- Room Booking
- Announcements (Pengumuman)
- Membership
- Dashboard & Profile

### Admin Features

- Admin Dashboard
- Books Management
- Book Loans Management
- Room Bookings Management
- Announcements Management
- Users Management

## User Experience Highlights

1. **Efisien dalam Sistem Peminjaman Buku dan Booking Room**

   - Pengguna dapat meminjam buku atau booking ruangan hanya dalam 4 kali klik/tahap

2. **Akses Informasi Aktual**

   - Informasi real-time tentang ketersediaan buku dan ruangan

3. **Menghindari Gulf of Evaluation**
   - Toast notifications menggunakan Sonner untuk feedback yang jelas

## Penilaian Tambahan

- ✅ Mengimplementasikan Payment Gateway (Midtrans)
- ✅ Mengimplementasikan Login via Google (OAuth)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
