import { load } from 'cheerio';
import { readFile, writeFile } from 'node:fs/promises';

const source = 'https://aps.ntut.edu.tw/course/tw/Croom.jsp?format=-2&year=115&sem=1';
const departmentSource = 'https://aps.ntut.edu.tw/course/tw/Subj.jsp?format=-2&year=115&sem=1';
const output = new URL('../app/data/schedule.json', import.meta.url);
const rawOutput = new URL('../app/data/raw-schedule.json', import.meta.url);
const periodOrder = ['1', '2', '3', '4', 'N', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D'];

async function fetchText(url) {
  const response = await fetch(url, { headers: { 'User-Agent': 'NTUT-RoomGo/1.0 (educational schedule cache)' } });
  if (!response.ok) throw new Error(`NTUT request failed: ${response.status}`);
  return response.text();
}

function parseRoomPage(html, room) {
  const $ = load(html);
  const records = [];
  $('tr').each((_, row) => {
    const cells = $(row).find('th,td');
    const periodMatch = cells.eq(0).text().match(/第\s*([1-9NABCD])\s*節/i);
    if (!periodMatch || cells.length < 6) return;
    const period = periodMatch[1].toUpperCase();
    cells.slice(1, 8).each((cellIndex, cell) => {
      const raw = $(cell).text().replace(/\r/g, '').replace(/\u3000/g, ' ').trim();
      const pattern = /\((\d{6})\)\s*\[(\d+)人\]\s*([\s\S]*?)(?=\(\d{6}\)\s*\[|$)/g;
      for (const match of raw.matchAll(pattern)) {
        const lines = match[3].split('\n').map((line) => line.replace(/\s+/g, ' ').trim()).filter(Boolean);
        if (lines.length < 2) continue;
        for (const className of [...new Set(lines.slice(1))]) {
          records.push({ code: match[1], students: Number(match[2]), name: lines[0], className, room, day: cellIndex, period, periodIndex: periodOrder.indexOf(period) });
        }
      }
    });
  });
  return records;
}

async function main() {
  const $ = load(await fetchText(source));
  const departmentPage = load(await fetchText(departmentSource));
  const departments = {};
  departmentPage('a[href*="code="]').each((_, element) => {
    const href = departmentPage(element).attr('href') ?? '';
    const code = new URL(href, departmentSource).searchParams.get('code');
    const name = departmentPage(element).text().replace(/\s+/g, ' ').trim();
    if (code && name) departments[code] = name;
  });
  const rooms = [];
  $('a[href*="format=-3"]').each((_, element) => {
    const href = $(element).attr('href');
    const room = $(element).text().replace(/\s+/g, ' ').trim();
    if (href && room && !rooms.some((item) => item.href === href)) rooms.push({ room, href: new URL(href, source).toString() });
  });
  const cached = JSON.parse(await readFile(output, 'utf8'));
  const discovered = [];
  for (const item of rooms) {
    discovered.push(...parseRoomPage(await fetchText(item.href), item.room));
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  const palette = ['sky', 'coral', 'pink', 'butter', 'sand', 'rose', 'violet', 'mint', 'lime', 'aqua'];
  const grouped = new Map();
  for (const record of discovered.filter((item) => item.day >= 1 && item.day <= 5 && /^[1-9]$/.test(item.period))) {
    const key = `${record.code}:${record.className}:${record.room}:${record.day}`;
    const section = Number(record.period);
    const prior = grouped.get(key);
    if (prior) { prior.start = Math.min(prior.start, section); prior.end = Math.max(prior.end, section); }
    else grouped.set(key, { id: key, name: record.name, room: record.room, roomName: record.room, teacher: '校方課程資料', className: record.className, day: record.day, start: section, end: section, color: palette[Number(record.code) % palette.length] });
  }
  const courses = [...grouped.values()];
  const classes = [...new Set(courses.map((record) => record.className))].filter(Boolean).sort((a, b) => a.localeCompare(b, 'zh-Hant'));
  delete cached.discovered;
  const updatedAt = new Date().toISOString();
  await writeFile(output, JSON.stringify({ ...cached, updatedAt, source, departments, classes, courses, recordCount: discovered.length, roomCount: rooms.length }, null, 2) + '\n');
  await writeFile(rawOutput, JSON.stringify({ updatedAt, source, records: discovered }, null, 2) + '\n');
  console.log(`Cached ${discovered.length} class/course/room/period records from ${rooms.length} rooms.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
