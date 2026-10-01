/* =========================================================
   CODESHIELD — VULNERABILITY GUIDE
========================================================= */


/* =========================================================
   VULNERABILITY DATA
========================================================= */

const vulnerabilities = [

    {
        id: "sql-injection",

        title: "SQL Injection",

        severity: "high",

        owasp: "OWASP A03 — Injection",

        shortDescription:
            "Occurs when untrusted input is directly incorporated into SQL queries.",

        description:
            "SQL Injection happens when an application builds SQL queries using untrusted user input. Instead of being treated only as data, the input can become part of the SQL command executed by the database.",

        how:
            "The vulnerability commonly appears when developers concatenate strings or interpolate user-controlled values directly into SQL statements.",

        dangerous:
            "An attacker may manipulate database queries and potentially access, modify, or delete data that the application was not intended to expose.",

        vulnerableCode:
`username = input("Username: ")

query = "SELECT * FROM users WHERE username = '" + username + "'"

cursor.execute(query)`,

        secureCode:
`username = input("Username: ")

query = "SELECT * FROM users WHERE username = ?"

cursor.execute(query, (username,))`,

        prevention: [
            "Use parameterized queries or prepared statements.",
            "Avoid building SQL queries through string concatenation.",
            "Validate and constrain user input where appropriate.",
            "Use database accounts with only the permissions they need."
        ]
    },


    {
        id: "xss",

        title: "Cross-Site Scripting (XSS)",

        severity: "high",

        owasp: "OWASP A05 — Injection",

        shortDescription:
            "Occurs when untrusted content is rendered as executable code in a user's browser.",

        description:
            "Cross-Site Scripting occurs when an application places untrusted data into a web page without properly encoding or sanitizing it.",

        how:
            "A common example is inserting user-controlled content directly into HTML using APIs such as innerHTML.",

        dangerous:
            "Malicious scripts can execute in another user's browser and may access sensitive page data or perform actions as that user.",

        vulnerableCode:
`const message = userInput;

document.getElementById("output")
    .innerHTML = message;`,

        secureCode:
`const message = userInput;

document.getElementById("output")
    .textContent = message;`,

        prevention: [
            "Encode untrusted output before rendering it.",
            "Prefer textContent over innerHTML when HTML is not required.",
            "Sanitize HTML when rendering trusted markup is necessary.",
            "Use appropriate Content Security Policy protections."
        ]
    },


    {
        id: "command-injection",

        title: "Command Injection",

        severity: "high",

        owasp: "OWASP A03 — Injection",

        shortDescription:
            "Occurs when user-controlled input is passed into an operating system command.",

        description:
            "Command Injection occurs when an application constructs an operating system command using untrusted input and executes it.",

        how:
            "The vulnerability often appears when functions such as shell execution APIs receive user-controlled strings.",

        dangerous:
            "An attacker may cause the application to execute unintended operating system commands with the application's permissions.",

        vulnerableCode:
`import os

filename = input("Filename: ")

os.system("cat " + filename)`,

        secureCode:
`from pathlib import Path

filename = input("Filename: ")

path = Path("/safe/files") / filename

print(path.read_text())`,

        prevention: [
            "Avoid shell execution when a safer API exists.",
            "Do not concatenate user input into shell commands.",
            "Validate input against an allowlist.",
            "Run processes with minimal operating-system permissions."
        ]
    },


    {
        id: "hardcoded-secrets",

        title: "Hardcoded Secrets",

        severity: "high",

        owasp: "OWASP A02 — Cryptographic Failures",

        shortDescription:
            "Occurs when passwords, API keys, tokens, or other secrets are stored directly in source code.",

        description:
            "Hardcoded secrets are sensitive credentials embedded directly inside application source code.",

        how:
            "Developers may place API keys, passwords, database credentials, or tokens directly inside configuration or application files.",

        dangerous:
            "Anyone who gains access to the source code may obtain the exposed credential. Secrets can also accidentally reach public repositories or logs.",

        vulnerableCode:
`API_KEY = "sk_live_123456789"

DATABASE_PASSWORD = "admin123"`,

        secureCode:
`import os

API_KEY = os.getenv("API_KEY")

DATABASE_PASSWORD = os.getenv(
    "DATABASE_PASSWORD"
)`,

        prevention: [
            "Store secrets in environment variables or a dedicated secret manager.",
            "Never commit credentials to source control.",
            "Rotate credentials if they are accidentally exposed.",
            "Use separate credentials for development and production."
        ]
    },


    {
        id: "path-traversal",

        title: "Path Traversal",

        severity: "high",

        owasp: "OWASP A01 — Broken Access Control",

        shortDescription:
            "Occurs when user input can manipulate file paths to access unintended files.",

        description:
            "Path Traversal occurs when an application uses untrusted input to construct a filesystem path without adequately restricting where the resulting path can point.",

        how:
            "An application may accept a filename from a request and append it directly to a trusted directory.",

        dangerous:
            "An attacker may attempt to access files outside the intended directory, potentially exposing configuration files or other sensitive information.",

        vulnerableCode:
`filename = request.args["file"]

path = "/uploads/" + filename

with open(path) as file:
    data = file.read()`,

        secureCode:
`from pathlib import Path

base = Path("/uploads").resolve()

requested = (base / filename).resolve()

if base not in requested.parents:
    raise ValueError("Invalid path")`,

        prevention: [
            "Resolve and validate filesystem paths before accessing files.",
            "Restrict file access to an intended directory.",
            "Prefer server-generated file identifiers.",
            "Do not trust user-supplied paths."
        ]
    },


    {
        id: "broken-access-control",

        title: "Broken Access Control",

        severity: "high",

        owasp: "OWASP A01 — Broken Access Control",

        shortDescription:
            "Occurs when users can access resources or perform actions beyond their authorization.",

        description:
            "Broken Access Control occurs when an application does not correctly enforce what authenticated users are allowed to access or modify.",

        how:
            "For example, an application may use an object ID supplied by the client without checking whether the current user is authorized to access that object.",

        dangerous:
            "Attackers may access other users' information, modify restricted resources, or perform administrative actions.",

        vulnerableCode:
`user_id = request.args["user_id"]

user = database.get_user(user_id)

return user`,

        secureCode:
`user_id = request.args["user_id"]

if not current_user.can_access(user_id):
    raise PermissionError("Forbidden")

user = database.get_user(user_id)

return user`,

        prevention: [
            "Enforce authorization on the server.",
            "Check permissions for every protected resource.",
            "Do not rely on client-side authorization checks.",
            "Use least-privilege access controls."
        ]
    },


    {
        id: "weak-authentication",

        title: "Insecure Authentication",

        severity: "high",

        owasp: "OWASP A07 — Identification and Authentication Failures",

        shortDescription:
            "Occurs when authentication mechanisms are implemented in an insecure way.",

        description:
            "Authentication vulnerabilities occur when applications do not properly protect login credentials, sessions, or identity verification.",

        how:
            "Examples include weak password handling, insecure session management, or authentication logic that can be bypassed.",

        dangerous:
            "Attackers may gain unauthorized access to user accounts or impersonate legitimate users.",

        vulnerableCode:
`password = request.form["password"]

if password == "admin123":
    login_user()`,

        secureCode:
`password = request.form["password"]

if verify_password(
    password,
    stored_password_hash
):
    login_user()`,

        prevention: [
            "Hash passwords using an appropriate password hashing algorithm.",
            "Use secure session management.",
            "Implement rate limiting for authentication attempts.",
            "Use multi-factor authentication where appropriate."
        ]
    },


    {
        id: "weak-cryptography",

        title: "Weak Cryptography",

        severity: "medium",

        owasp: "OWASP A02 — Cryptographic Failures",

        shortDescription:
            "Occurs when sensitive information is protected using weak or inappropriate cryptographic mechanisms.",

        description:
            "Cryptographic failures occur when sensitive information is not adequately protected through appropriate encryption, hashing, or key management.",

        how:
            "Applications may use outdated algorithms, weak keys, insecure modes, or plain hashing for passwords.",

        dangerous:
            "Sensitive information may become recoverable if an attacker obtains the stored or transmitted data.",

        vulnerableCode:
`import hashlib

password_hash = hashlib.md5(
    password.encode()
).hexdigest()`,

        secureCode:
`from werkzeug.security import generate_password_hash

password_hash = generate_password_hash(
    password
)`,

        prevention: [
            "Use modern cryptographic libraries.",
            "Use password-specific hashing algorithms for passwords.",
            "Protect cryptographic keys appropriately.",
            "Avoid deprecated or broken algorithms."
        ]
    },


    {
        id: "insecure-deserialization",

        title: "Insecure Deserialization",

        severity: "medium",

        owasp: "OWASP A08 — Software and Data Integrity Failures",

        shortDescription:
            "Occurs when untrusted serialized data is deserialized without sufficient validation.",

        description:
            "Insecure deserialization occurs when an application reconstructs objects from data that an attacker can control.",

        how:
            "Using unsafe deserialization mechanisms on untrusted data can allow unexpected objects or operations to be created.",

        dangerous:
            "Depending on the technology and context, attackers may manipulate application state or trigger unintended operations.",

        vulnerableCode:
`import pickle

data = request.data

obj = pickle.loads(data)`,

        secureCode:
`import json

data = request.data

obj = json.loads(data)`,

        prevention: [
            "Avoid deserializing untrusted data using unsafe object serialization formats.",
            "Prefer simple data formats such as JSON when appropriate.",
            "Validate deserialized data against expected schemas.",
            "Use integrity checks where necessary."
        ]
    },


    {
        id: "security-misconfiguration",

        title: "Security Misconfiguration",

        severity: "medium",

        owasp: "OWASP A05 — Security Misconfiguration",

        shortDescription:
            "Occurs when security settings are missing, incorrectly configured, or unnecessarily exposed.",

        description:
            "Security misconfiguration occurs when applications, servers, frameworks, or cloud services are configured in ways that expose unnecessary functionality or sensitive information.",

        how:
            "Examples include debug mode enabled in production, unnecessary services, default credentials, or overly permissive settings.",

        dangerous:
            "Attackers may gain additional information or functionality that helps them compromise the application.",

        vulnerableCode:
`app.run(
    debug=True,
    host="0.0.0.0"
)`,

        secureCode:
`app.run(
    debug=False,
    host="127.0.0.1"
)`,

        prevention: [
            "Disable debugging in production.",
            "Remove unnecessary services and features.",
            "Change default credentials.",
            "Use secure configuration defaults.",
            "Review configuration regularly."
        ]
    }

];


/* =========================================================
   DOM ELEMENTS
========================================================= */

const vulnerabilityGrid =
    document.getElementById("vulnerabilityGrid");

const vulnerabilitySearch =
    document.getElementById("vulnerabilitySearch");

const filterButtons =
    document.querySelectorAll(".filter-btn");

const noResults =
    document.getElementById("noResults");

const detail =
    document.getElementById("vulnerabilityDetail");

const closeDetail =
    document.getElementById("closeDetail");


/* =========================================================
   CURRENT FILTER
========================================================= */

let currentFilter = "all";


/* =========================================================
   RENDER CARDS
========================================================= */

function renderVulnerabilities() {

    const searchTerm =
        vulnerabilitySearch.value
            .trim()
            .toLowerCase();


    const filtered =
        vulnerabilities.filter(vulnerability => {

            const matchesFilter =
                currentFilter === "all" ||
                vulnerability.severity === currentFilter;


            const searchableText =
                (
                    vulnerability.title +
                    " " +
                    vulnerability.shortDescription +
                    " " +
                    vulnerability.owasp
                ).toLowerCase();


            const matchesSearch =
                searchableText.includes(searchTerm);


            return matchesFilter && matchesSearch;

        });


    vulnerabilityGrid.innerHTML = "";


    if (filtered.length === 0) {

        noResults.hidden = false;

        return;

    }


    noResults.hidden = true;


    filtered.forEach(vulnerability => {

        const card =
            document.createElement("article");

        card.className =
            "vulnerability-card";


        card.innerHTML = `

            <div class="vulnerability-card-header">

                <h3>
                    ${vulnerability.title}
                </h3>

                <span class="severity-badge severity-${vulnerability.severity}">
                    ${vulnerability.severity.toUpperCase()}
                </span>

            </div>


            <p>
                ${vulnerability.shortDescription}
            </p>


            <div class="vulnerability-card-footer">

                <span class="owasp-label">
                    ${vulnerability.owasp}
                </span>

                <span class="view-details">
                    View Details →
                </span>

            </div>

        `;


        card.addEventListener(
            "click",
            () => openVulnerability(vulnerability)
        );


        vulnerabilityGrid.appendChild(card);

    });

}


/* =========================================================
   OPEN VULNERABILITY
========================================================= */

function openVulnerability(vulnerability) {

    document.getElementById("detailSeverity").textContent =
        vulnerability.severity.toUpperCase();


    document.getElementById("detailSeverity").className =
        `detail-severity severity-${vulnerability.severity}`;


    document.getElementById("detailTitle").textContent =
        vulnerability.title;


    document.getElementById("detailOwasp").textContent =
        vulnerability.owasp;


    document.getElementById("detailDescription").textContent =
        vulnerability.description;


    document.getElementById("detailHow").textContent =
        vulnerability.how;


    document.getElementById("detailDanger").textContent =
        vulnerability.dangerous;


    document.getElementById("vulnerableExample").textContent =
        vulnerability.vulnerableCode;


    document.getElementById("secureExample").textContent =
        vulnerability.secureCode;


    const preventionList =
        document.getElementById("preventionList");


    preventionList.innerHTML = "";


    vulnerability.prevention.forEach(item => {

        const li =
            document.createElement("li");

        li.textContent = item;

        preventionList.appendChild(li);

    });


    detail.hidden = false;


    detail.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   CLOSE DETAIL
========================================================= */

if (closeDetail) {

    closeDetail.addEventListener(
        "click",
        () => {

            detail.hidden = true;

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );

}


/* =========================================================
   SEARCH
========================================================= */

if (vulnerabilitySearch) {

    vulnerabilitySearch.addEventListener(
        "input",
        renderVulnerabilities
    );

}


/* =========================================================
   FILTER BUTTONS
========================================================= */

filterButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            filterButtons.forEach(btn => {
                btn.classList.remove("active");
            });


            button.classList.add("active");


            currentFilter =
                button.dataset.filter;


            renderVulnerabilities();

        }
    );

});


/* =========================================================
   INITIAL RENDER
========================================================= */

renderVulnerabilities();


console.log(
    "CodeShield Vulnerability Guide initialized."
);