const path = require('path');
const puppeteer = require('puppeteer-core');

async function captureScreenshots() {
  console.log('Launching Chrome for screenshot capture...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,960']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 1 });

  const screenshotsDir = path.join(__dirname, 'screenshots');

  try {
    // 1. Dashboard
    console.log('1. Capturing Dashboard...');
    await page.goto('http://localhost:5000/#dashboard', { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => document.getElementById('stat-total-jobs').textContent !== '-');
    await new Promise(r => setTimeout(r, 600)); // wait for Chart.js rendering
    await page.screenshot({ path: path.join(screenshotsDir, '01_dashboard.png'), fullPage: false });

    // 2. Jobs Listing
    console.log('2. Capturing Jobs Listing...');
    await page.evaluate(() => navigateTo('jobs'));
    await page.waitForFunction(() => document.querySelectorAll('#jobs-table-tbody tr').length > 0);
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(screenshotsDir, '02_jobs_listing.png'), fullPage: false });

    // 3. Add Job Form Modal
    console.log('3. Capturing Add Job Form...');
    await page.evaluate(() => openJobFormModal());
    await page.waitForSelector('#modal-job-form.open');
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(screenshotsDir, '03_add_job_form.png'), fullPage: false });

    // Close Add Job Modal
    await page.evaluate(() => UI.closeAllModals());
    await new Promise(r => setTimeout(r, 300));

    // 4. Edit Job Form Modal
    console.log('4. Capturing Edit Job Form...');
    await page.evaluate(() => openJobFormModal(1));
    await page.waitForSelector('#modal-job-form.open');
    await page.waitForFunction(() => document.getElementById('job-input-title').value.length > 0);
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(screenshotsDir, '04_edit_job_form.png'), fullPage: false });

    // Close Edit Job Modal
    await page.evaluate(() => UI.closeAllModals());
    await new Promise(r => setTimeout(r, 300));

    // 5. Applications Listing
    console.log('5. Capturing Applications Listing...');
    await page.evaluate(() => navigateTo('applications'));
    await page.waitForFunction(() => document.querySelectorAll('#apps-table-tbody tr').length > 0);
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(screenshotsDir, '05_applications_listing.png'), fullPage: false });

    // 6. Application Details
    console.log('6. Capturing Application Details...');
    await page.evaluate(() => viewApplicationDetails(1));
    await page.waitForSelector('#modal-app-view.open');
    await page.waitForFunction(() => document.getElementById('view-app-name').textContent !== 'Candidate Details');
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(screenshotsDir, '06_application_details.png'), fullPage: false });

    // 7. Application Status Management
    console.log('7. Capturing Application Status Management...');
    // Trigger status update to show feedback and state
    await page.evaluate(() => {
      document.getElementById('view-app-status-select').value = 'Hired';
      UI.showToast('Application status updated to "Hired"', 'success', 'Status Updated');
    });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(screenshotsDir, '07_application_status_management.png'), fullPage: false });

    // Close Application View Modal
    await page.evaluate(() => UI.closeAllModals());
    await new Promise(r => setTimeout(r, 300));

    // 8. Database Connection Status
    console.log('8. Capturing Database Connection Status...');
    await page.evaluate(() => navigateTo('settings'));
    await page.waitForFunction(() => document.getElementById('settings-db-total-jobs').textContent !== '-');
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(screenshotsDir, '08_database_connection_status.png'), fullPage: false });

    console.log('\n✓ All 8 screenshots captured successfully in /screenshots folder!');
  } catch (err) {
    console.error('Screenshot capture failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

captureScreenshots();
