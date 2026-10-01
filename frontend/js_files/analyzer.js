/* =========================================================
   CODESHIELD — ANALYZER
   Code Analysis + AI Chat
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const analyzeBtn =
    document.getElementById("analyzeBtn");

const chatForm =
    document.getElementById("chatForm");

const chatInput =
    document.getElementById("chatInput");

const askAiBtn =
    document.getElementById("askAiBtn");

const chatMessages =
    document.getElementById("chatMessages");


/* =========================================================
   ANALYZE CODE
========================================================= */

async function analyzeCode() {

    let code = "";

    if (typeof getEditorCode === "function") {
        code = getEditorCode();
    }

    if (!code) {

        const codeInput =
            document.getElementById("codeInput");

        if (codeInput) {
            code = codeInput.value;
        }
    }

    code = code.trim();

    if (!code) {
        alert(
            "Please paste or type some code first."
        );
        return;
    }

    const languageElement =
        document.getElementById("language");

    const language =
        languageElement
            ? languageElement.value
            : "python";

    if (analyzeBtn) {
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = "Analyzing...";
    }

    try {

        console.log(
            "CodeShield analysis started."
        );

        const data =
            await analyzeCodeAPI(
                code,
                language
            );

        console.log(
            "CodeShield API response:",
            data
        );

        displayResults(data);

    } catch (error) {

        console.error(
            "CodeShield analysis failed:",
            error
        );

        alert(
            "Analysis failed.\n\n" +
            error.message
        );

    } finally {

        if (analyzeBtn) {

            analyzeBtn.disabled = false;

            analyzeBtn.textContent =
                "Analyze Code";
        }
    }
}


/* =========================================================
   DISPLAY ANALYSIS RESULTS
========================================================= */

function displayResults(data) {

    if (!data) {
        return;
    }

    const staticIssues =
        Array.isArray(data.issues)
            ? data.issues
            : [];

    const llmIssues =
        Array.isArray(data.llm_issues)
            ? data.llm_issues
            : [];

    const displayedIssues =
        staticIssues.length > 0
            ? staticIssues
            : llmIssues.map(
                (issue, index) => ({
                    id:
                        `llm-${index + 1}`,

                    type:
                        issue.type ||
                        "AI Security Issue",

                    severity:
                        issue.severity ||
                        "UNKNOWN",

                    line:
                        issue.line ||
                        null,

                    description:
                        issue.description ||
                        "Potential security issue detected.",

                    vulnerable_snippet:
                        issue.evidence ||
                        ""
                })
            );


    /* =====================================================
       ISSUE CARDS
    ===================================================== */

    const issueContainer =
        document.getElementById(
            "issuesContainer"
        );

    if (issueContainer) {

        issueContainer.innerHTML = "";

        if (
            displayedIssues.length === 0
        ) {

            issueContainer.innerHTML = `
                <div class="no-issues">
                    No vulnerabilities found
                </div>
            `;

        } else {

            displayedIssues.forEach(
                (issue) => {

                    const card =
                        document.createElement(
                            "div"
                        );

                    card.className =
                        "issue-card";

                    const severity =
                        String(
                            issue.severity ||
                            "UNKNOWN"
                        ).toUpperCase();

                    card.innerHTML = `
                        <div class="issue-header">

                            <strong>
                                ${escapeHTML(
                                    issue.type ||
                                    "Security Issue"
                                )}
                            </strong>

                            <span class="severity ${severity.toLowerCase()}">
                                ${escapeHTML(
                                    severity
                                )}
                            </span>

                        </div>

                        <p>
                            <strong>Line:</strong>
                            ${escapeHTML(
                                issue.line ||
                                "N/A"
                            )}
                        </p>

                        <p>
                            ${escapeHTML(
                                issue.description ||
                                "No description available."
                            )}
                        </p>

                        <pre><code>${escapeHTML(
                            issue.vulnerable_snippet ||
                            issue.evidence ||
                            ""
                        )}</code></pre>
                    `;

                    issueContainer.appendChild(
                        card
                    );
                }
            );
        }
    }


    /* =====================================================
       ISSUE COUNT
    ===================================================== */

    const issueCount =
        document.getElementById(
            "issueCount"
        );

    if (issueCount) {

        issueCount.textContent =
            displayedIssues.length;
    }


    /* =====================================================
       AI SUMMARY
    ===================================================== */

    const summaryIssue =
        llmIssues.length > 0
            ? llmIssues[0]
            : displayedIssues.length > 0
                ? displayedIssues[0]
                : null;

    if (summaryIssue) {

        const severityElement =
            document.getElementById(
                "aiIssueSeverity"
            );

        if (severityElement) {

            severityElement.textContent =
                summaryIssue.severity ||
                "UNKNOWN";
        }


        const titleElement =
            document.getElementById(
                "aiIssueTitle"
            );

        if (titleElement) {

            titleElement.textContent =
                summaryIssue.type ||
                "Security Issue";
        }
    }


    /* =====================================================
       COMPLEXITY
    ===================================================== */

    if (data.complexity) {

        const timeElement =
            document.getElementById(
                "timeComplexity"
            );

        if (timeElement) {

            timeElement.textContent =
                data.complexity.time ||
                "N/A";
        }


        const spaceElement =
            document.getElementById(
                "spaceComplexity"
            );

        if (spaceElement) {

            spaceElement.textContent =
                data.complexity.space ||
                "N/A";
        }


        const bottleneckElement =
            document.getElementById(
                "bottleneckLines"
            );

        if (bottleneckElement) {

            bottleneckElement.textContent =
                data.complexity.bottleneck_lines ||
                "N/A";
        }
    }


    /* =====================================================
       DIFF
    ===================================================== */

    if (data.diff) {

        const vulnerableElement =
            document.getElementById(
                "vulnerableCode"
            );

        if (vulnerableElement) {

            const vulnerable =
                Array.isArray(
                    data.diff.vulnerable
                )
                    ? data.diff.vulnerable.join(
                        "\n"
                    )
                    : data.diff.vulnerable ||
                      "";

            vulnerableElement.textContent =
                vulnerable;
        }


        const secureElement =
            document.getElementById(
                "secureCode"
            );

        if (secureElement) {

            const secure =
                Array.isArray(
                    data.diff.secure
                )
                    ? data.diff.secure.join(
                        "\n"
                    )
                    : data.diff.secure ||
                      "";

            secureElement.textContent =
                secure;
        }
    }


    /* =====================================================
       EDITOR DECORATIONS
    ===================================================== */

    if (
        typeof setIssueDecorations ===
        "function"
    ) {

        setIssueDecorations(
            displayedIssues
        );
    }


    if (
        typeof setBottleneckDecoration ===
        "function" &&
        data.complexity
    ) {

        setBottleneckDecoration(
            data.complexity.bottleneck_lines
        );
    }
}


/* =========================================================
   CHATBOT
========================================================= */

async function handleChatSubmit(
    event
) {

    /*
       VERY IMPORTANT:
       Stop the HTML form from
       reloading the page.
    */

    if (event) {
        event.preventDefault();
    }


    if (!chatInput) {

        console.error(
            "chatInput not found."
        );

        return;
    }


    const question =
        chatInput.value.trim();


    if (!question) {

        return;
    }


    /*
       Find the currently detected
       vulnerability.
    */

    const severityElement =
        document.getElementById(
            "aiIssueSeverity"
        );

    const titleElement =
        document.getElementById(
            "aiIssueTitle"
        );


    const vulnerabilityType =
        titleElement &&
        titleElement.textContent.trim()
            ? titleElement.textContent.trim()
            : "Security Vulnerability";


    const vulnerabilityId =
        vulnerabilityType;


    /*
       Show user's question
    */

    addChatMessage(
        question,
        "user"
    );


    /*
       Clear input
    */

    chatInput.value = "";


    /*
       Disable button
    */

    if (askAiBtn) {

        askAiBtn.disabled = true;

        askAiBtn.textContent =
            "Thinking...";
    }


    try {

        console.log(
            "Sending question to CodeShield AI:",
            question
        );


        const response =
            await explainVulnerabilityAPI(
                vulnerabilityId,
                question
            );


        console.log(
            "CodeShield AI response:",
            response
        );


        const answer =
            response &&
            response.answer
                ? response.answer
                : "AI returned no answer.";


        addChatMessage(
            answer,
            "ai"
        );


    } catch (error) {

        console.error(
            "Chatbot error:",
            error
        );


        addChatMessage(
            "Sorry, I could not get an answer from CodeShield AI.\n\n" +
            error.message,
            "ai"
        );


    } finally {

        if (askAiBtn) {

            askAiBtn.disabled = false;

            askAiBtn.textContent =
                "Ask AI";
        }
    }
}


/* =========================================================
   ADD CHAT MESSAGE
========================================================= */

function addChatMessage(
    message,
    sender
) {

    if (!chatMessages) {

        console.error(
            "chatMessages element not found."
        );

        return;
    }


    const messageElement =
        document.createElement(
            "div"
        );


    messageElement.className =
        `chat-message ${sender}`;


   if (sender === "ai") {
    messageElement.innerHTML =
        formatAIResponse(message);
} else {
    messageElement.textContent =
        message;
}

    chatMessages.appendChild(
        messageElement
    );


    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}


function formatAIResponse(message) {

    if (!message) {
        return "";
    }

    let html = escapeHTML(message);

    /* =====================================================
       CODE BLOCKS
    ===================================================== */

    html = html.replace(
        /```(?:python|javascript|java|cpp|c|sql|bash|json)?\s*([\s\S]*?)```/gi,
        function(match, code) {

            return `
                <pre class="ai-code-block"><code>${code.trim()}</code></pre>
            `;
        }
    );


    /* =====================================================
       INLINE CODE
    ===================================================== */

    html = html.replace(
        /`([^`]+)`/g,
        "<code class=\"ai-inline-code\">$1</code>"
    );


    /* =====================================================
       HEADINGS
    ===================================================== */

    html = html.replace(
        /^### (.+)$/gm,
        "<h4>$1</h4>"
    );

    html = html.replace(
        /^## (.+)$/gm,
        "<h3>$1</h3>"
    );

    html = html.replace(
        /^\*\*(.+?)\*\*$/gm,
        "<h3>$1</h3>"
    );


    /* =====================================================
       BOLD TEXT
    ===================================================== */

    html = html.replace(
        /\*\*(.+?)\*\*/g,
        "<strong>$1</strong>"
    );


    /* =====================================================
       BULLET POINTS
    ===================================================== */

    html = html.replace(
        /^[•*-]\s+(.+)$/gm,
        "<li>$1</li>"
    );

    html = html.replace(
        /(<li>.*<\/li>)/gs,
        "<ul>$1</ul>"
    );


    /* =====================================================
       NUMBERED LIST
    ===================================================== */

    html = html.replace(
        /^\d+\.\s+(.+)$/gm,
        "<li>$1</li>"
    );


    /* =====================================================
       NEWLINES
    ===================================================== */

    html = html.replace(
        /\n{2,}/g,
        "<br><br>"
    );

    html = html.replace(
        /\n/g,
        "<br>"
    );


    return html;
}

/* =========================================================
   HTML ESCAPING
========================================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   EVENT LISTENERS
========================================================= */


/* Analyze button */

if (analyzeBtn) {

    analyzeBtn.addEventListener(
        "click",
        analyzeCode
    );
}


/* Chat form */

if (chatForm) {

    chatForm.addEventListener(
        "submit",
        handleChatSubmit
    );
}


/*
   Extra protection:
   If Ask AI is a button outside
   the form, handle its click too.
*/

if (
    askAiBtn &&
    !chatForm
) {

    askAiBtn.addEventListener(
        "click",
        handleChatSubmit
    );
}


console.log(
    "CodeShield analyzer + chatbot loaded."
);