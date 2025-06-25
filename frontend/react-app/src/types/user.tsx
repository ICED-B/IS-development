// src/types/user.ts
export interface User {
  login: string;
  email: string;
  tel: string;
  role: 'zakaznik' | 'pracovník' | 'vedoucí' | 'majitel' | 'admin';
  jmeno_prijmeni?: string; // jen pro zákazníky
  pracovni_pozice?: string; // jen pro pracovníky
}

//export interface User {
//    id: number;
//    username: string;
//    email: string;
//    created_at: string; // Datum jako string (ISO formát z API)
//}
