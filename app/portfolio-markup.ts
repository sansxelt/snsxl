// Portfolio content restored from the existing authenticated production site.
export const portfolioMarkup = `
<a class="skip" href="#now">Skip to content</a>
<header class="topbar"><a class="topbar-name" href="#top">Nishanth Dasari</a><nav class="topbar-nav" aria-label="Chapters"><span class="topbar-pill" aria-hidden="true"></span><a href="#now"><span class="n">01</span>Now</a><a href="#proof"><span class="n">02</span>Proof</a><a href="#path"><span class="n">03</span>Path</a><a href="#me"><span class="n">04</span>Me</a></nav><a class="topbar-cta" href="mailto:nishanth@foremake.com">Contact</a><a class="topbar-mail" href="mailto:nishanth@foremake.com" aria-label="Email Nishanth"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5h16v11H4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"></path><path d="M4.5 7l7.5 6 7.5-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg></a><span class="topbar-progress" aria-hidden="true"><i></i></span></header>
<main>

<section class="slide hero" id="top" data-chapter="Intro" aria-label="Introduction">
  <h2 class="statement hero-statement r">{{AGE_LINE}} I’ve been building <span class="glow">since I was 11.</span></h2>
  <div class="hero-facts r">
    <div class="card"><strong><span class="count" data-to="11">11</span>B+ visits</strong><span>Lifetime visits on the Roblox games I’ve built and worked on.</span></div>
    <div class="card"><strong>Foremake, Inc.</strong><span>My company, parent of Vraelis and Overlym. Through Vraelis, official partnerships with Reddit and ByteDance, the company behind TikTok.</span></div>
    <div class="card"><strong>Stanford Pre-Collegiate</strong><span>Pre-Collegiate Product Design at 14, on full tuition aid, while in middle school.</span></div>
  </div>
</section>

<section class="chapter" id="now" data-chapter="Building now" aria-labelledby="now-title">
  <div class="slide">
    <p class="kicker r">Building now</p>
    <h2 class="display r" id="now-title">From games to<br><span class="dim">companies.</span></h2>
    <p class="body r">I started with Roblox games, moved into security and child safety, and now run Foremake. Vraelis and Overlym are the companies I’m building under it.</p>
  </div>

  <div class="slide">
    <p class="kicker r">Foremake, Inc.</p>
    <h3 class="statement r">Building Foremake, <span class="dim">the company behind Vraelis and Overlym.</span></h3>
    <div class="cards three r">
      <div class="card"><b>Founder and CEO</b><span>Foremake, Inc., since September 2026</span></div>
      <div class="card"><b>No outside capital</b><span>Built using earnings from my earlier work.</span></div>
      <div class="card"><b>Parent company</b><span>Home to Vraelis and Overlym.</span></div>
    </div>
    <div class="cards two r">
      <div class="card partner"><small>Attended, 2026</small><b>Supabase Select</b></div>
      <div class="card partner"><small>Invited, 2026</small><b>Cloudflare Connect</b></div>
    </div>
    <p class="fine r"><a href="https://foremake.com/events" target="_blank" rel="noopener noreferrer">Invitations and company milestones ↗</a></p>
    <a class="go r" href="https://foremake.com/" target="_blank" rel="noopener noreferrer">foremake.com ↗</a>
  </div>

  <div class="slide">
    <p class="kicker r">Vraelis, founded July 2026, built solo</p>
    <h3 class="statement r">Know your systems <span class="glow">work.</span></h3>
    <p class="body r">I built Vraelis to check whether software behaves as intended, with a growing focus on defense technology. Today, it runs real browser checks against live apps and control panels, including simulated mission consoles. Each check records what happened and shows whether the software behaved as intended.</p>
    <div class="cards two r">
      <div class="card partner"><small>Official partner</small><b>Reddit</b></div>
      <div class="card partner"><small>Official partner</small><b>ByteDance</b><span>the company behind TikTok</span></div>
    </div>
    <dl class="project-notes r"><div><dt>Built</dt><dd>The web console, public API and CLI for running browser checks against deployed software and using the results in a CI pipeline.</dd></div><div><dt>Hard part</dt><dd>Separating a failed check from a blocked one. If a login, connection or other obstacle prevents a check, the result must say so.</dd></div><div><dt>Learned</dt><dd>An August 2026 security review found 61 issues, 8 of them high. I fixed them and added 545 test assertions. The record has to be as strong as the claim.</dd></div></dl>
    <p class="fine r"><a href="https://vraelis.com/" target="_blank" rel="noopener noreferrer">vraelis.com ↗</a></p>
  </div>

  <div class="slide">
    <p class="kicker r">Overlym, founded August 2026, a Foremake company</p>
    <h3 class="statement r">You make the decision. <span class="glow">I’m building what comes next.</span></h3>
    <p class="body r">An early Foremake company being built around money, work and business. Its current site reserves access for institutions, private organizations, governments and agencies. Overlym is not open to the public yet.</p>
    <a class="go r" href="https://overlym.com/" target="_blank" rel="noopener noreferrer">overlym.com ↗</a>
  </div>
</section>

<section class="chapter" id="proof" data-chapter="Proof at scale" aria-labelledby="proof-title">
  <div class="slide">
    <p class="kicker r">Proof at scale</p>
    <h2 class="display r" id="proof-title">Shipped to<br><span class="dim">millions.</span></h2>
    <p class="body r">Before Foremake, I built and contributed to games, then helped build security and child safety systems used across thousands of Roblox games.</p>
  </div>

  <div class="slide center">
    <p class="visit-date r" aria-hidden="true">Recorded total</p>
    <p class="big-num visits r" data-to="11700000000" aria-label="11.7 billion">11B+</p>
    <p class="big-caption r">lifetime visits across games I’ve built and contributed to.</p>
    <p class="fine r">Total visits, including repeat visits from returning players.</p>
    <div class="proof-links r"><a class="go verified" href="https://create.roblox.com/talent/creators/5715923454" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.8l2.6 1.9 3.2-.1 1 3 2.6 1.9-1 3.1 1 3.1-2.6 1.9-1 3-3.2-.1L12 22.2l-2.6-1.9-3.2.1-1-3-2.6-1.9 1-3.1-1-3.1 2.6-1.9 1-3 3.2.1z"></path><path d="M8.2 12.3l2.5 2.5 5.1-5.3" fill="none" stroke="#0b0d12" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path></svg>Roblox portfolio ↗</a></div>
  </div>

  <div class="slide">
    <p class="kicker r">Anti-cheat and exploit detection, co-built with a team, October 2025 to March 2026</p>
    <div class="stats r">
      <div class="card stat"><b><span class="count" data-to="1.7" data-dec="1">1.7</span>M+</b><span>downloads</span></div>
      <div class="card stat"><b><span class="count" data-to="14000">14,000</span>+</b><span>games adopted it</span></div>
      <div class="card stat"><b><span class="count" data-to="560">560</span>K</b><span>authorized users</span></div>
      <div class="card stat"><b><span class="count" data-to="10000">10,000</span>+</b><span>exploits and executors detected, kernel and user mode</span></div>
    </div>
    <p class="fine r">A team project that generated six-figure revenue and taught me how to maintain security tooling at scale.</p>
    <dl class="project-notes r"><div><dt>Built</dt><dd>My part of a team build: detection logic, mapping new executors and exploit variants, and watching for false positives.</dd></div><div><dt>Hard part</dt><dd>Exploits change constantly. Detection has to stay specific enough to act on without flagging real players.</dd></div><div><dt>Learned</dt><dd>Security is maintenance, not a launch. One system, kept current, protected thousands of games at once.</dd></div></dl>
    <div class="proof-links left r"><a class="go verified" href="https://create.roblox.com/talent/creators/5715923454" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.8l2.6 1.9 3.2-.1 1 3 2.6 1.9-1 3.1 1 3.1-2.6 1.9-1 3-3.2-.1L12 22.2l-2.6-1.9-3.2.1-1-3-2.6-1.9 1-3.1-1-3.1 2.6-1.9 1-3 3.2.1z"></path><path d="M8.2 12.3l2.5 2.5 5.1-5.3" fill="none" stroke="#0b0d12" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path></svg>Roblox portfolio ↗</a><span class="proof-note">Selected work and contributions on Roblox Talent Hub.</span></div>
  </div>

  <div class="slide">
    <p class="kicker r">Child safety, January to April 2025</p>
    <h3 class="statement r">Thousands of enforcement actions <span class="glow">to keep kids safe.</span></h3>
    <p class="body r">I helped build the system that connects Roblox games to <a href="https://x.com/ModForDummies/status/1968072010778759389" target="_blank" rel="noopener noreferrer">EASI</a>’s shared moderation database. It screens joining players, bans accounts tied to predatory communities, and escalates evidence to Roblox’s official reporting channels.</p>
    <dl class="project-notes r"><div><dt>Built</dt><dd>The connection between games and EASI’s database, and the pipeline that forwards evidence to Roblox’s reporting channels.</dd></div><div><dt>Hard part</dt><dd>Getting evidence strong enough to move a case beyond a single game’s ban.</dd></div><div><dt>Learned</dt><dd>Protecting people takes evidence, not just a ban button.</dd></div></dl>
    <div class="proof-links left r"><a class="go" href="https://x.com/ModForDummies/status/1968072010778759389" target="_blank" rel="noopener noreferrer">What EASI is ↗</a></div>
  </div>

  <div class="slide">
    <p class="kicker r">Games and communities</p>
    <div class="stats three r">
      <div class="card stat"><b><span class="count" data-to="75">75</span></b><span>games and templates sold</span></div>
      <div class="card stat"><b><span class="count" data-to="9.9" data-dec="1">9.9</span>M+</b><span>memberships across the dev communities I contribute to</span></div>
      <div class="card stat"><b><span class="count" data-to="5">5</span></b><span>development groups credited across four years</span></div>
    </div>
    <p class="fine r">Contributor in <a href="https://www.roblox.com/communities/5693735/Hexagon-Development-Community" target="_blank" rel="noopener noreferrer">Hexagon Development Community</a> and <a href="https://www.roblox.com/communities/35541084/linh" target="_blank" rel="noopener noreferrer">/linh</a>. Co-owner of <a href="https://www.roblox.com/communities/35210397/Tiny-Lab-Studios" target="_blank" rel="noopener noreferrer">Tiny Lab Studios</a>. Founder of <a href="https://www.roblox.com/communities/35744692/Sansxel-Games" target="_blank" rel="noopener noreferrer">Sansxel Games</a>. Some games and templates ship under the buyer’s name.</p>
    <div class="proof-links left r"><a class="go" href="https://www.roblox.com/communities/35744692/Sansxel-Games" target="_blank" rel="noopener noreferrer">Sansxel Games ↗</a><a class="go" href="https://www.roblox.com/communities/35210397/Tiny-Lab-Studios" target="_blank" rel="noopener noreferrer">Tiny Lab Studios ↗</a></div>
  </div>
</section>

<section class="chapter" id="path" data-chapter="The path" aria-labelledby="path-title">
  <div class="slide">
    <p class="kicker r">The path</p>
    <h2 class="display r" id="path-title">Self-taught.<br><span class="dim">From zero, twice.</span></h2>
  </div>

  <div class="slide">
    <p class="kicker r">Part one: games</p>
    <div class="steps rail r">
      <div class="card step"><em>2019</em><b>Player first</b><span>Joined Roblox as a player and stayed one for three years.</span></div>
      <div class="card step"><em>May 2022</em><b>Learned Lua at 11</b><span>Lead scripter and modeler on Blood Nation: first-person combat, recoil, hit detection.</span></div>
      <div class="card step"><em>Oct 2023</em><b>First billion</b><span>Games I’d contributed to passed one billion visits.</span></div>
      <div class="card step"><em>2024</em><b>Lost everything</b><span>My main account was deleted, taking my portfolio with it. That same week, I started planning Scraplings.</span></div>
    </div>
  </div>

  <div class="slide center">
    <p class="kicker r">July 18, 2025, age 14</p>
    <h3 class="statement r">Stanford gave me <span class="glow">full tuition aid</span> while I was still in middle school.</h3>
    <p class="body r">I completed Product Design through Stanford Pre-Collegiate Summer Institutes on July 18, 2025, before starting high school.</p>
    <a class="evidence evidence-certificate r" href="/evidence/stanford.webp" target="_blank" rel="noopener" aria-label="Open Stanford completion certificate"><img src="/evidence/stanford.webp" alt="Nishanth Dasari’s Stanford Pre-Collegiate Product Design completion certificate, dated July 18, 2025" width="1209" height="925" loading="lazy" decoding="async"></a>
    <div class="proof-links r"><a class="go" href="https://summerinstitutes.spcs.stanford.edu/" target="_blank" rel="noopener noreferrer">Stanford Pre-Collegiate Summer Institutes ↗</a></div>
  </div>

  <div class="slide">
    <p class="kicker r">Part two: security, then companies</p>
    <div class="steps rail three r">
      <div class="card step"><em>2025</em><b>From games to safety</b><span>Started protecting players, not just building games: child safety from January, then the anti-cheat from October.</span></div>
      <div class="card step"><em>Jul 2026</em><b>Started building companies</b><span>Vraelis in July, Overlym in August, and Foremake to hold them in September.</span></div>
      <div class="card step"><em>Aug 28, 2026</em><b>YC declined an interview</b><span>My Fall 2026 application with Vraelis was not selected for an interview. I kept building, with a clearer reason for the work.</span></div>
    </div>
    <a class="evidence evidence-email r" href="/evidence/yc-email.webp" target="_blank" rel="noopener" aria-label="Open the original YC application email"><img src="/evidence/yc-email.webp" alt="Y Combinator email saying Nishanth’s startup was not selected for an interview, August 28, 2026" width="1707" height="467" loading="lazy" decoding="async"></a>
  </div>
</section>

<section class="chapter" id="me" data-chapter="Who I am" aria-labelledby="me-title">
  <div class="slide">
    <p class="kicker r">Who I am</p>
    <h2 class="display r" id="me-title">Born 30 minutes<br><span class="dim">from Roblox HQ.</span></h2>
    <p class="body r">I was born in Mountain View in October 2010. My mom came to the US in 2003 for a master’s in computer science, and my dad followed for work. I grew up in Northern California and live in Folsom now.</p>
    <p class="body r">I’m a sophomore at Vista del Lago High School, class of 2029, taking pre-calculus and honors chemistry while running Foremake.</p>
    <p class="body r">I came to Roblox as a player and I still play more than I build. Away from the keyboard, it’s time with friends.</p>
  </div>

  <div class="slide">
    <p class="kicker r">Still building</p>
    <h3 class="statement r">Accounts can disappear. <span class="glow">I keep building.</span></h3>
    <p class="body r">In 2024, my Roblox account was deleted along with my portfolio. I rebuilt it, and that same week I was already planning Scraplings.</p>
    <p class="body r">More recently, my LinkedIn account was suspended at 15. I’m appealing. On August 28, 2026, YC told me my startup had not been selected for an interview.</p>
    <p class="body strong r">I keep building through each setback. My age doesn’t change that.</p>
    <figure class="evidence-history r"><a class="evidence evidence-profile" href="/evidence/linkedin-summer-2026.webp" target="_blank" rel="noopener" aria-label="Open historical LinkedIn profile screenshot"><img src="/evidence/linkedin-summer-2026.webp" alt="Nishanth’s last known LinkedIn profile screenshot from summer 2026, before the suspension" width="1290" height="2796" loading="lazy" decoding="async"></a><figcaption>Summer 2026, before the suspension.</figcaption></figure>
  </div>

  <div class="slide center">
    <p class="kicker r">Applying to HAA, 2027</p>
    <h3 class="statement r">I’ve already started building. <span class="glow">Now I want to go further.</span></h3>
    <p class="body r">At the Horowitz Andreessen Academy, I want to keep building Foremake while learning how to turn what I build into a company that lasts. I want to work in person with people who take building as seriously as I do, and learn from founders who have done it before.</p>
    <p class="body strong r">I’m not waiting for a diploma or a degree to start. Now I want to be around people who will push me further than I can push myself.</p>
  </div>

  <div class="slide center last">
    <h3 class="quote r">Get in touch.</h3>
    <a class="contact-mail r" href="mailto:nishanth@foremake.com">nishanth@foremake.com</a>
    <div class="links r"><a href="https://github.com/sansxelt" target="_blank" rel="noopener noreferrer">GitHub ↗</a><a href="https://x.com/fwnishy" target="_blank" rel="noopener noreferrer">X ↗</a><a href="https://create.roblox.com/talent/creators/5715923454" target="_blank" rel="noopener noreferrer">Roblox ↗</a><a href="https://foremake.com/" target="_blank" rel="noopener noreferrer">Foremake ↗</a></div>
  </div>
</section>
</main>
<div class="hud" aria-hidden="true"><span class="hud-chapter">Intro</span><span class="hud-count"><b>01</b> / 18</span><span class="hud-bar"><i></i></span></div>`;
