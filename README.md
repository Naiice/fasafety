# Final Assembly - Safety Survey 🛡️

เว็บแอพสำหรับสำรวจและประเมินความปลอดภัยของพนักงานในสายการผลิต **Final Assembly** เชื่อมต่อฐานข้อมูลแบบสองทางกับ **Google Sheets** พร้อมแดชบอร์ดกราฟสรุปผลแบบเรียลไทม์ รองรับการใช้งาน 3 ภาษา (**ไทย 🇹🇭 / จีน 🇨🇳 / พม่า 🇲🇲**) และรองรับทั้งหน้าจอ **โทรศัพท์มือถือ (Mobile)** และ **คอมพิวเตอร์โน้ตบุ๊ก (Notebook)**

---

## ✨ ฟีเจอร์หลัก (Key Features)

1. **Dashboard สรุปผลแบบกราฟ (Interactive Charts)**
   - **กราฟจำนวนพนักงานที่ถูก Survey ในแต่ละวัน (Daily Survey Count & Avg Score)**: แสดงจำนวนคนที่สุ่มตรวจในแต่ละวันพร้อมเส้นแนวโน้มคะแนนเฉลี่ย
   - **กราฟแสดง Score ของแต่ละไลน์ผลิต (Score by Production Line)**: เปรียบเทียบคะแนนเฉลี่ย (%) และจำนวนคนที่ตรวจแยกตามไลน์ผลิต (`FA-Line 1`, `FA-Line 2`, `FA-Line 3`, `FA-Line 4`, `Sub-Assy Line`, `Packing & QA`)
   - **กราฟและตารางแสดง Score ของแต่ละคน แต่ละไลน์ (Individual Employee Score & Line Breakdown)**: ดูคะแนนของพนักงานรายบุคคล พร้อมปุ่มกรองแยกตามไลน์ผลิตและดูคะแนนรายข้อ
2. **จัดการคำถามในชีต `"Question"` จากหน้าเว็บได้ทันที**
   - พิมพ์เพิ่มคำถามใหม่ / แก้ไข / ลบคำถาม / กำหนดคะแนนเต็มของแต่ละข้อจากหน้าเว็บแอพ
   - รองรับคำถาม 3 ภาษา (ไทย, จีน, พม่า) พร้อมปุ่มช่วยแปลศัพท์ความปลอดภัยโรงงานอัตโนมัติ
3. **ทำแบบสำรวจและให้คะแนนลงชีต `"Survey list"`**
   - ออกแบบปุ่มกดให้คะแนนขนาดใหญ่ กดง่ายบนหน้าจอมือถือขณะเดินตรวจหน้างาน (Shopfloor Walk)
   - คำนวณคะแนนรวมและเปอร์เซ็นต์แบบเรียลไทม์ พร้อมบันทึกลงชีต `"Survey list"`
4. **รองรับ 3 ภาษา (Multi-language: ไทย / 中文 / မြန်မာ)**
   - สลับภาษาได้ทันทีจากแถบด้านบน เปลี่ยนทั้งเมนูหน้าเว็บและภาษาของคำถามความปลอดภัย

---

## 📊 ขั้นตอนการติดตั้ง Apps Script ใน Google Sheets

1. เปิดไฟล์ Google Sheets ของโปรเจกต์นี้:
   👉 [https://docs.google.com/spreadsheets/d/1bM68aArN9WAbwrvFrKC1hpAy335SSgzZPZBtDp-Znpc/edit](https://docs.google.com/spreadsheets/d/1bM68aArN9WAbwrvFrKC1hpAy335SSgzZPZBtDp-Znpc/edit?gid=0#gid=0)
2. ไปที่เมนูด้านบน **Extensions (ส่วนขยาย)** > **Apps Script**
3. ลบโค้ดเดิมในไฟล์ `Code.gs` ออกทั้งหมด แล้วคัดลอกโค้ดจากไฟล์ [`google-apps-script/Code.gs`](google-apps-script/Code.gs) ไปวางแทนที่
4. กดปุ่ม **Save (รูปแผ่นดิสก์)** จากนั้นเลือกฟังก์ชัน `setupSheets` ด้านบนแล้วกดปุ่ม **Run (เรียกใช้)** 1 ครั้ง (ระบบจะสร้างชีต `"Question"` และ `"Survey list"` พร้อมหัวตารางและคำถามเริ่มต้นให้อัตโนมัติ)
5. กดปุ่มสีน้ำเงินมุมขวาบน **Deploy (ทำให้ใช้งานได้)** > **New deployment (การทำให้ใช้งานได้รายการใหม่)**
6. คลิกไอคอนรูปเฟือง เลือกประเภทเป็น **Web app (เว็บแอป)** และตั้งค่าดังนี้:
   - **Description**: `FA Safety Survey API`
   - **Execute as (ดำเนินการในฐานะ)**: `Me (ฉัน)`
   - **Who has access (ผู้ที่มีสิทธิ์เข้าถึง)**: `Anyone (ทุกคน)`
7. กด **Deploy** แล้วคัดลอก **Web App URL** (`https://script.google.com/macros/s/.../exec`)
8. นำ **Web App URL** ที่ได้ไปวางในหน้าเว็บแอพที่เมนู **"เชื่อมต่อ Google Sheets"** (หรือวางในตัวแปร `DEFAULT_GAS_WEBAPP_URL` ในไฟล์ `js/app.js` บรรทัดที่ 15)

---

## 🚀 ขั้นตอนการนำโค้ดขึ้น GitHub (`Naiice/fasafety`) และเปิดใช้งาน GitHub Pages

รันคำสั่งต่อไปนี้ในโฟลเดอร์โปรเจกต์เพื่ออัปโหลดโค้ดขึ้น Repository [https://github.com/Naiice/fasafety](https://github.com/Naiice/fasafety):

```bash
cd /Users/naiice/.gemini/antigravity/scratch/fasafety
git init
git branch -M main
git add .
git commit -m "Initial commit: Final Assembly Safety Survey Web App + Google Apps Script"
git remote add origin https://github.com/Naiice/fasafety.git
git push -u origin main
```

### การเปิด GitHub Pages เพื่อให้เข้าใช้งานผ่านมือถือและโน้ตบุ๊ก
1. ไปที่หน้า GitHub Repo: `https://github.com/Naiice/fasafety/settings/pages`
2. ในหัวข้อ **Build and deployment** > **Branch** เลือกเป็น `main` และโฟลเดอร์ `/ (root)` แล้วกด **Save**
3. รอประมาณ 1 นาที เว็บแอพจะพร้อมใช้งานที่ลิงก์:
   `https://naiice.github.io/fasafety/`
