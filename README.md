# 北科課室通 NTUT RoomGo

> 嗨，今天也準時抵達。

北科課室通是為國立臺北科技大學學生設計的響應式班級課表與教室查詢 Web App。選擇班級後，即可快速查看當下課程、下一節課、完整週課表與課程教室資訊。

![北科課室通 NTUT RoomGo 預覽](public/og.png)

## 主要功能

- 班級即時搜尋與快速切換
- 自動記住已選班級，下次開啟直接載入
- 根據目前日期與節次顯示當下課程及剩餘時間
- 自動尋找今天或下一個上課日的下一節課
- 週一至週五完整課表矩陣
- 點擊課程卡片查看課號、時間、教室與開課班級
- 深色、淺色與跟隨系統三種主題模式
- 手機與桌機響應式版面
- 手機版 Liquid Glass 風格底部導覽
- 無須帳號、學號或密碼

## 課表資料

目前內建資料為北科大 **115 學年度第 1 學期**公開教室課表：

| 項目 | 數量 |
| --- | ---: |
| 班級 | 211 |
| 班級課程紀錄 | 1,865 |
| 原始課程紀錄 | 4,527 |
| 教室 | 234 |

資料來源：[北科大教室課表查詢系統](https://aps.ntut.edu.tw/course/tw/Croom.jsp?format=-2&year=115&sem=1)

為避免頻繁請求校方系統，網站使用專案內建的 JSON 資料庫。需要更新時由維護者手動執行爬蟲，再提交更新後的資料。

## 快速開始

### 環境需求

- Node.js 22.13.0 或更新版本
- npm

### 安裝與啟動

```bash
git clone https://github.com/ericlin241/NTUT-RoomGo.git
cd NTUT-RoomGo
npm install
npm run dev
```

接著開啟終端機顯示的本機網址。也可以先開啟根目錄的 `啟動說明.html` 查看操作說明。

## 常用指令

| 指令 | 用途 |
| --- | --- |
| `npm run dev` | 啟動本機開發環境 |
| `npm run lint` | 檢查程式碼品質 |
| `npm run build` | 建立正式版本 |
| `npm run start` | 啟動正式版本 |
| `npm run scrape` | 重新爬取公開課表並更新 JSON 資料 |
| `npm run build:standalone` | 更新根目錄的啟動說明頁 |

## 更新課表資料

```bash
npm install
npm run scrape
```

爬蟲會讀取北科大公開教室課表並更新：

- `app/data/raw-schedule.json`：保留教室頁面的原始解析紀錄
- `app/data/schedule.json`：供前端使用的班級課表資料

更新後請執行：

```bash
npm run lint
npm run build
```

## 專案結構

```text
NTUT-RoomGo/
├── app/
│   ├── data/                 # 課表 JSON 資料庫
│   ├── globals.css           # 全站與響應式樣式
│   ├── layout.tsx            # 網站 metadata 與字體
│   └── page.tsx              # 課表介面與互動邏輯
├── public/
│   ├── favicon.svg
│   └── og.png                # GitHub／社群分享預覽圖
├── scripts/
│   ├── scrape-ntut.mjs       # 北科公開課表爬蟲
│   └── build-standalone.mjs  # 啟動說明頁產生器
├── standalone.template.html
├── 啟動說明.html
└── package.json
```

## 技術組成

- React 19
- Next.js 16
- Vinext + Vite
- TypeScript
- Tailwind CSS
- Lucide React
- Cheerio

## 儲存與隱私

- 網站不要求帳號、學號或密碼。
- 已選班級與主題偏好只保存在使用者瀏覽器的 `localStorage`。
- 網站不會查詢或儲存個人選課資料。
- 課表頁面載入時不會即時請求北科大系統。

## 已知限制

- 顯示的是班級公開課表，不是個人選課結果。
- 不包含個人跨系選修、通識、重補修及加退選差異。
- 課程公告與修課名單通常需要校務入口授權，因此目前不提供。
- 課表異動後需要維護者重新執行爬蟲並發布更新。

## 免責聲明

本專案為非官方學生工具，與國立臺北科技大學無隸屬或合作關係。課程與教室資訊請以校方系統公告為準。
