const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const possiblePaths = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
];

let executablePath = possiblePaths.find(p => fs.existsSync(p));
if (!executablePath) {
  console.error('No browser executable found!');
  process.exit(1);
}

const outDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function clickButtonWithText(page, text) {
  return page.evaluate((targetText) => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const target = buttons.find(b => b.innerText && b.innerText.toLowerCase().includes(targetText.toLowerCase()));
    if (target) {
      target.click();
      return true;
    }
    return false;
  }, text);
}

async function captureAll() {
  console.log('Launching browser with:', executablePath);
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();

  // 1. Login page
  console.log('1. Capturing login...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(outDir, 'login.png') });

  // 2. Register page / Auth info
  console.log('2. Capturing register...');
  await page.screenshot({ path: path.join(outDir, 'register.png') });

  // 2b. Perform Login
  console.log('2b. Logging in...');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 2000));

  // 3. Dashboard
  console.log('3. Capturing dashboard...');
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, 'dashboard.png') });

  // 4. Events
  console.log('4. Capturing events...');
  await page.goto('http://localhost:5173/events', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, 'events.png') });

  // 5. Event Create Modal
  console.log('5. Capturing event-create modal...');
  await clickButtonWithText(page, 'Create Event');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, 'event-create.png') });
  await clickButtonWithText(page, 'Cancel');
  await new Promise(r => setTimeout(r, 500));

  // 6. Event Details
  console.log('6. Capturing event-details...');
  await page.goto('http://localhost:5173/events/6aaeb167c22638838e1c4c18', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, 'event-details.png') });

  // 7. Tasks
  console.log('7. Capturing tasks...');
  await page.goto('http://localhost:5173/tasks', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, 'tasks.png') });

  // 8. Task Create Modal
  console.log('8. Capturing task-create modal...');
  await clickButtonWithText(page, 'Create Task') || await clickButtonWithText(page, 'Add Task') || await clickButtonWithText(page, 'Task');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, 'task-create.png') });
  await clickButtonWithText(page, 'Cancel');
  await new Promise(r => setTimeout(r, 500));

  // 9. Task Details
  console.log('9. Capturing task-details...');
  await page.goto('http://localhost:5173/tasks/6aaeb167c22638838e1c4c1a', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, 'task-details.png') });

  // 10. Volunteers
  console.log('10. Capturing volunteers...');
  await page.goto('http://localhost:5173/volunteers', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, 'volunteers.png') });

  // 11. Volunteer Create Modal
  console.log('11. Capturing volunteer-create modal...');
  await clickButtonWithText(page, 'Add Volunteer') || await clickButtonWithText(page, 'Volunteer');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, 'volunteer-create.png') });
  await clickButtonWithText(page, 'Cancel');
  await new Promise(r => setTimeout(r, 500));

  // 12. Volunteer Details
  console.log('12. Capturing volunteer-details...');
  await page.goto('http://localhost:5173/volunteers/6aaeb167c22638838e1c4c12', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, 'volunteer-details.png') });

  // 13. Meetings
  console.log('13. Capturing meetings...');
  await page.goto('http://localhost:5173/meetings', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, 'meetings.png') });

  // 14. Meeting Details
  console.log('14. Capturing meeting-details...');
  await page.goto('http://localhost:5173/meetings/6aaeb167c22638838e1c4c23', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, 'meeting-details.png') });

  // 15. Meeting Intelligence
  console.log('15. Capturing meeting-intelligence...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const tab = tabs.find(t => t.innerText && (t.innerText.includes('AI') || t.innerText.includes('Intelligence') || t.innerText.includes('Actions') || t.innerText.includes('Transcript')));
    if (tab) tab.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, 'meeting-intelligence.png') });

  // 16. Documents
  console.log('16. Capturing documents...');
  await page.goto('http://localhost:5173/documents', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, 'documents.png') });

  // 17. Document Details
  console.log('17. Capturing document-details...');
  await page.goto('http://localhost:5173/documents/6aaeb167c22638838e1c4c28', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, 'document-details.png') });

  // 18. Knowledge Search / RAG
  console.log('18. Capturing knowledge-rag...');
  await page.goto('http://localhost:5173/documents', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    const inp = document.querySelector('input');
    if (inp) {
      inp.value = 'Sponsorship tiers, venue requirements, and student passes';
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, 'knowledge-rag.png') });

  // 19. Risks
  console.log('19. Capturing risks...');
  await page.goto('http://localhost:5173/risks', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, 'risks.png') });

  // 20. Risk Details
  console.log('20. Capturing risk-details...');
  await page.goto('http://localhost:5173/risks/6aaeb167c22638838e1c4c34', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, 'risk-details.png') });

  // 21. Announcements
  console.log('21. Capturing announcements...');
  await page.goto('http://localhost:5173/announcements', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, 'announcements.png') });

  // 22. Announcement Composer
  console.log('22. Capturing announcement-composer modal...');
  await clickButtonWithText(page, 'Create Announcement') || await clickButtonWithText(page, 'New Announcement') || await clickButtonWithText(page, 'Compose');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, 'announcement-composer.png') });
  await clickButtonWithText(page, 'Cancel');
  await new Promise(r => setTimeout(r, 500));

  // 23. AI Command Center
  console.log('23. Capturing ai-command-center...');
  await page.goto('http://localhost:5173/ai', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, 'ai-command-center.png') });

  // 24. AI Action Confirmation
  console.log('24. Capturing ai-action-confirmation...');
  await page.evaluate(() => {
    const txt = document.querySelector('textarea') || document.querySelector('input[type="text"]');
    if (txt) {
      txt.value = 'Create a critical task for stage lighting and AV check assigned to Rahul Sharma';
      txt.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 500));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const send = btns.find(b => b.type === 'submit' || b.getAttribute('aria-label') === 'Send' || b.innerText.includes('Send') || b.querySelector('svg'));
    if (send) send.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(outDir, 'ai-action-confirmation.png') });

  await browser.close();
  console.log('🎉 Successfully captured all 24 screenshots in docs/screenshots/ !');
}

captureAll().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
