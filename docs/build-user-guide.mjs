/**
 * Builds docs/Lagos-OTRS-User-Guide.pdf from the content below plus the
 * screenshots in docs/screens/.
 *
 *   node docs/build-user-guide.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const shot = (file) =>
  `data:image/png;base64,${readFileSync(path.join(here, "screens", file)).toString("base64")}`;

const CONTENT = `
<section class="cover">
  <p class="eyebrow">Lagos State Transport Company</p>
  <h1>Online Ticket Reservation System</h1>
  <p class="subtitle">User Guide</p>
  <div class="cover-box">
    <p>This guide shows you, step by step, how to use the system.</p>
    <p>There are two kinds of user, and this guide covers both:</p>
    <ul>
      <li><strong>Passengers</strong> — search for a trip, reserve a seat, pay, and get a QR ticket. <em>Part A.</em></li>
      <li><strong>Boarding gate staff</strong> — check a passenger's ticket and admit them. <em>Part B.</em></li>
    </ul>
  </div>
  <p class="cover-foot">Version 1.0</p>
</section>

<section class="page">
  <h2>Before you start</h2>
  <ol class="plain">
    <li>You need a phone, tablet or computer with a web browser.</li>
    <li>You need an internet connection.</li>
    <li>Open the system's web address. On a computer running it locally this is
        <span class="code">http://localhost:3000</span></li>
  </ol>

  <h2>The whole journey in one picture</h2>
  <div class="flow">
    <span>1. Search</span><i>&rarr;</i>
    <span>2. Pick seat</span><i>&rarr;</i>
    <span>3. Pay</span><i>&rarr;</i>
    <span>4. Get QR ticket</span><i>&rarr;</i>
    <span>5. Scan at gate</span>
  </div>

  <div class="note">
    <strong>The one thing to remember:</strong> when you choose a seat it is held for
    you for <strong>10 minutes only</strong>. If you do not finish paying within
    10 minutes the seat is released for someone else.
  </div>
</section>

<h1 class="part">Part A — For passengers</h1>

<section class="step">
  <h3><span class="num">1</span> Create your account</h3>
  <ol>
    <li>Click <strong>Create account</strong> at the top right of the page.</li>
    <li>Fill in your full name, email address, phone number and a password.</li>
    <li>Your password must be at least 6 characters.</li>
    <li>Click <strong>Create account</strong>. You are signed in straight away.</li>
  </ol>
  <figure><img src="${shot("02-register.png")}" alt="The create account form"></figure>
</section>

<section class="step">
  <h3><span class="num">2</span> Sign in (if you already have an account)</h3>
  <ol>
    <li>Click <strong>Sign in</strong> at the top right.</li>
    <li>Enter the email address and password you registered with.</li>
    <li>Click <strong>Sign in</strong>.</li>
  </ol>
  <p class="tip">If you see <em>"Incorrect email or password"</em>, check your
     spelling. The system does not say which of the two is wrong, for security.</p>
  <figure><img src="${shot("03-login.png")}" alt="The sign in form"></figure>
</section>

<section class="step">
  <h3><span class="num">3</span> Search for a trip</h3>
  <ol>
    <li>On the home page, type where you are travelling <strong>From</strong> and <strong>To</strong>.</li>
    <li>Choose your <strong>travel date</strong>.</li>
    <li>Choose the <strong>mode</strong> — Bus, Ferry, Rail, or leave it as All modes.</li>
    <li>Click <strong>Search trips</strong>.</li>
  </ol>
  <p class="tip">You can leave From and To empty to see every trip on that date.</p>
  <figure><img src="${shot("01-home.png")}" alt="The home page with the search form"></figure>
</section>

<section class="step">
  <h3><span class="num">4</span> Choose a departure</h3>
  <p>Each row is one departure. It shows you:</p>
  <ul>
    <li>The operator and vehicle (for example BRT · Bus · BRT-014)</li>
    <li>Where it goes, the departure time and the arrival time</li>
    <li>The fare for one seat</li>
    <li>How many seats are still free</li>
  </ul>
  <p>Click <strong>Select seats</strong> on the trip you want. If it says
     <strong>Fully booked</strong>, that vehicle has no seats left — choose another time.</p>
  <figure><img src="${shot("04-search-results.png")}" alt="A list of matching trips"></figure>
</section>

<section class="step">
  <h3><span class="num">5</span> Pick your seat</h3>
  <ol>
    <li>Click any seat on the map to select it. Click it again to unselect it.</li>
    <li>You can book up to <strong>5 seats</strong> in one booking.</li>
    <li>Check that the passenger name and phone number are correct.</li>
    <li>Click <strong>Reserve and pay</strong>.</li>
  </ol>
  <table class="key">
    <tr><td><span class="sw sw-free"></span> White</td><td>Seat is free — you can pick it</td></tr>
    <tr><td><span class="sw sw-sel"></span> Green</td><td>You have selected this seat</td></tr>
    <tr><td><span class="sw sw-taken"></span> Grey, crossed out</td><td>Someone else has this seat</td></tr>
  </table>
  <figure><img src="${shot("05-seat-map.png")}" alt="The seat map with two seats selected"></figure>
</section>

<section class="step">
  <h3><span class="num">6</span> Pay for your seat</h3>
  <ol>
    <li>The system sends you to <strong>Paystack</strong> to pay.</li>
    <li>Choose how you want to pay: <strong>Card</strong>, <strong>Transfer</strong>,
        <strong>Bank</strong> or <strong>USSD</strong>.</li>
    <li>Follow the instructions on the Paystack screen and complete the payment.</li>
    <li>You are brought back automatically. Wait while it says
        <em>"Confirming your payment"</em> — do not close the page.</li>
  </ol>
  <div class="note">
    <strong>Testing the system?</strong> While the system is in test mode, Paystack
    shows a yellow <span class="code">TEST</span> label and gives you buttons instead
    of asking for a real card. Choose <strong>Success</strong> to test a normal
    payment, or <strong>Declined</strong> to see what a failed payment looks like.
    Then press the pay button. No real money moves.
  </div>
  <figure><img src="${shot("06-checkout-paystack.png")}" alt="The Paystack payment screen in test mode"></figure>
</section>

<section class="step">
  <h3><span class="num">7</span> Get your ticket</h3>
  <p>As soon as the payment is confirmed, your ticket appears. It shows your name,
     the route, the date, your seat numbers, a <strong>QR code</strong> and a
     <strong>booking reference</strong> such as <span class="code">LSTC-BUCT9F</span>.</p>
  <p>You do not need to print it. You can always open it again from
     <strong>My tickets</strong>.</p>
  <figure><img src="${shot("07-ticket.png")}" alt="A paid ticket showing the QR code"></figure>
</section>

<section class="step">
  <h3><span class="num">8</span> Find your tickets again later</h3>
  <ol>
    <li>Click <strong>My tickets</strong> at the top of the page.</li>
    <li>Every booking you have made is listed, newest first.</li>
    <li>A <strong>paid</strong> booking has a <strong>View ticket</strong> button.</li>
    <li>A <strong>pending</strong> booking has a <strong>Complete payment</strong>
        button — use it if your payment did not go through the first time.</li>
  </ol>
  <figure><img src="${shot("08-my-tickets.png")}" alt="The list of your bookings"></figure>
</section>

<section class="step">
  <h3><span class="num">9</span> Board the vehicle</h3>
  <ol>
    <li>At the terminal, open your ticket on your phone.</li>
    <li>Show the QR code to the officer at the boarding gate.</li>
    <li>They scan it and let you on. That is the end of the journey for you.</li>
  </ol>
  <p class="tip">If your phone is off or has no network, give the officer your
     booking reference instead — they can look it up by hand.</p>
</section>

<h1 class="part">Part B — For boarding gate staff</h1>

<section class="step">
  <h3><span class="num">10</span> Open ticket validation</h3>
  <ol>
    <li>On the home page, click <strong>Open ticket validation</strong>,
        or go straight to <span class="code">/verify</span>.</li>
    <li>Keep this page open at the gate for the whole boarding period.</li>
  </ol>
  <figure><img src="${shot("09-gate-lookup.png")}" alt="The ticket validation page"></figure>
</section>

<section class="step">
  <h3><span class="num">11</span> Check a passenger's ticket</h3>
  <p>There are two ways to bring up a ticket. Either works.</p>
  <table class="two">
    <tr>
      <th>Scanning (normal)</th>
      <th>By hand (backup)</th>
    </tr>
    <tr>
      <td>Point your phone camera at the passenger's QR code. The ticket page
          opens by itself. No special scanner app is needed.</td>
      <td>Type the passenger's booking reference, for example
          <span class="code">LSTC-BUCT9F</span>, then press
          <strong>Look up ticket</strong>.</td>
    </tr>
  </table>
</section>

<section class="step">
  <h3><span class="num">12</span> Admit the passenger</h3>
  <ol>
    <li>Check the details on screen against the passenger: name, route, date and seats.</li>
    <li>If everything matches, press <strong>Admit passenger</strong>.</li>
    <li>The screen turns green and says <strong>Passenger boarded</strong>. Let them on.</li>
  </ol>
  <figure><img src="${shot("10-gate-check.png")}" alt="A valid ticket ready to be admitted"></figure>
</section>

<section class="step">
  <h3><span class="num">13</span> What the screen is telling you</h3>
  <table class="outcomes">
    <tr><th>What you see</th><th>What it means</th><th>What to do</th></tr>
    <tr>
      <td class="ok">Passenger boarded</td>
      <td>The ticket was valid and has now been used.</td>
      <td>Let the passenger on.</td>
    </tr>
    <tr>
      <td class="bad">This ticket has already been used</td>
      <td>Somebody already boarded with this ticket.</td>
      <td>Do not admit. One ticket boards once only.</td>
    </tr>
    <tr>
      <td class="bad">Not valid for boarding (status: pending)</td>
      <td>The booking was never paid for.</td>
      <td>Send the passenger to complete payment.</td>
    </tr>
    <tr>
      <td class="bad">Unknown ticket</td>
      <td>No booking exists with that reference.</td>
      <td>Check the spelling, or ask them to open their ticket.</td>
    </tr>
    <tr>
      <td class="bad">This ticket could not be authenticated</td>
      <td>The QR code is not a genuine one from this system.</td>
      <td>Do not admit. Refer to a supervisor.</td>
    </tr>
  </table>
  <figure><img src="${shot("11-gate-boarded.png")}" alt="A ticket that has already been used"></figure>
</section>

<h1 class="part">Part C — Rules and problems</h1>

<section class="step">
  <h3>The rules, in short</h3>
  <table class="rules">
    <tr><td>Seats per booking</td><td>5 at most</td></tr>
    <tr><td>How long a seat is held</td><td>10 minutes, then it is released</td></tr>
    <tr><td>How many times a ticket can be used</td><td>Once</td></tr>
    <tr><td>Who confirms a payment</td><td>The payment gateway — never the browser</td></tr>
    <tr><td>Getting your ticket back</td><td>Any time, from My tickets</td></tr>
    <tr><td>Past trips</td><td>Hidden from search automatically</td></tr>
  </table>

  <h3>If something goes wrong</h3>
  <table class="outcomes">
    <tr><th>Message</th><th>Why</th><th>What to do</th></tr>
    <tr>
      <td>One or more of the selected seats have just been taken</td>
      <td>Another passenger paid for that seat a moment before you.</td>
      <td>The seat map refreshes — choose a different seat.</td>
    </tr>
    <tr>
      <td>Your seat hold expired</td>
      <td>More than 10 minutes passed before payment finished.</td>
      <td>Go back to the trip and select your seats again.</td>
    </tr>
    <tr>
      <td>Payment not confirmed</td>
      <td>The payment did not complete.</td>
      <td>Your seats are held a few minutes more. Open My tickets and press
          Complete payment.</td>
    </tr>
    <tr>
      <td>You need to sign in to continue</td>
      <td>You are signed out.</td>
      <td>Sign in, then select your seats again.</td>
    </tr>
    <tr>
      <td>No trips match that search</td>
      <td>Nothing is scheduled for that date and route.</td>
      <td>Try another date, or clear From and To to see everything.</td>
    </tr>
  </table>
</section>

<section class="step">
  <h3>Starting the system for a demonstration</h3>
  <ol class="plain">
    <li>Open a terminal in the project folder.</li>
    <li>Run <span class="code">npm run seed</span> once, to load the demo trips.</li>
    <li>Run <span class="code">npm run dev</span>.</li>
    <li>Open <span class="code">http://localhost:3000</span> in your browser.</li>
  </ol>
  <p>A ready-made passenger account is created by the seed:</p>
  <table class="rules">
    <tr><td>Email</td><td><span class="code">demo@example.com</span></td></tr>
    <tr><td>Password</td><td><span class="code">password123</span></td></tr>
  </table>
  <p class="tip">Running <span class="code">npm run seed</span> again clears all
     bookings and reloads fresh trips — useful right before a demonstration.</p>
</section>
`;

const CSS = `
  @page { size: A4; margin: 15mm 14mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Helvetica Neue", Arial, sans-serif;
    color: #14201b; font-size: 10.5pt; line-height: 1.55; margin: 0;
  }
  h1.part {
    font-size: 20pt; color: #065f46; margin: 0 0 14pt;
    padding-bottom: 6pt; border-bottom: 2.5pt solid #065f46;
    break-before: page;
  }
  h2 { font-size: 14pt; margin: 18pt 0 6pt; color: #065f46; }
  h3 { font-size: 12.5pt; margin: 0 0 7pt; display: flex; align-items: center; gap: 8pt; }
  .num {
    display: inline-grid; place-items: center; flex: none;
    width: 20pt; height: 20pt; border-radius: 50%;
    background: #065f46; color: #fff; font-size: 10pt;
  }
  section.step { break-inside: avoid; margin-bottom: 20pt; }
  ol, ul { margin: 0 0 8pt; padding-left: 16pt; }
  li { margin-bottom: 3pt; }
  ol.plain { padding-left: 16pt; }
  figure { margin: 9pt 0 0; }
  figure img {
    display: block; margin: 0 auto; max-width: 100%; max-height: 140mm;
    border: 0.6pt solid #d7e0dc; border-radius: 4pt;
  }
  .code {
    font-family: "SF Mono", Menlo, monospace; font-size: 9.5pt;
    background: #eef3f1; padding: 1pt 4pt; border-radius: 3pt;
  }
  .note {
    border-left: 3pt solid #065f46; background: #f0f7f4;
    padding: 8pt 11pt; margin: 10pt 0; break-inside: avoid;
  }
  .tip { color: #4b5b54; font-size: 9.8pt; margin: 6pt 0; }
  table { width: 100%; border-collapse: collapse; margin: 8pt 0; font-size: 9.8pt; }
  th, td { border: 0.6pt solid #d7e0dc; padding: 5pt 7pt; text-align: left; vertical-align: top; }
  th { background: #f0f7f4; font-weight: 700; }
  table.rules td:first-child { width: 42%; font-weight: 600; }
  table.key td:first-child { width: 34%; font-weight: 600; }
  table.two th { width: 50%; }
  table.outcomes td:first-child { width: 30%; font-weight: 600; }
  td.ok { color: #065f46; }
  td.bad { color: #a5231b; }
  .sw {
    display: inline-block; width: 10pt; height: 10pt; border-radius: 2pt;
    border: 0.8pt solid #c9d5d0; vertical-align: -1pt; margin-right: 4pt;
  }
  .sw-free { background: #fff; }
  .sw-sel { background: #047857; border-color: #047857; }
  .sw-taken { background: #eef3f1; }
  .flow {
    display: flex; align-items: center; justify-content: space-between;
    gap: 4pt; margin: 10pt 0 4pt;
  }
  .flow span {
    flex: 1; text-align: center; background: #f0f7f4; border: 0.6pt solid #cfe3da;
    border-radius: 4pt; padding: 7pt 3pt; font-weight: 600; font-size: 9.5pt;
  }
  .flow i { color: #065f46; font-style: normal; }
  .cover { padding-top: 52mm; break-after: page; }
  .cover .eyebrow { letter-spacing: 1.5pt; text-transform: uppercase; font-size: 10pt; color: #4b5b54; margin: 0; }
  .cover h1 { font-size: 30pt; line-height: 1.15; margin: 6pt 0 0; color: #052e26; }
  .cover .subtitle { font-size: 17pt; color: #065f46; margin: 4pt 0 26pt; font-weight: 600; }
  .cover-box { border: 0.8pt solid #cfe3da; background: #f7fbf9; border-radius: 6pt; padding: 14pt 16pt; }
  .cover-box p { margin: 0 0 7pt; }
  .cover-box ul { margin-bottom: 0; }
  .cover-foot { margin-top: 26pt; color: #6b7a73; font-size: 9.5pt; }
  section.page { break-after: page; }
  section.step + section.step { margin-top: 16pt; }
`;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Lagos OTRS — User Guide</title><style>${CSS}</style></head>
<body>${CONTENT}</body></html>`;

const htmlPath = path.join(here, "user-guide.html");
const pdfPath = path.join(here, "Lagos-OTRS-User-Guide.pdf");
writeFileSync(htmlPath, html);

const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const result = spawnSync(chrome, [
  "--headless", "--disable-gpu", "--no-pdf-header-footer",
  `--print-to-pdf=${pdfPath}`, "--virtual-time-budget=20000",
  `file://${htmlPath}`,
], { encoding: "utf8" });

if (result.error) throw result.error;
console.log(`Wrote ${pdfPath}`);
