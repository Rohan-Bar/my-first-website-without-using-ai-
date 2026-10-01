/* =========================================================
   CODESHIELD — MONACO EDITOR
========================================================= */

let monacoEditor = null;
let vulnerabilityDecorations = [];
let bottleneckDecorations = [];


/* =========================================================
   INITIALIZE MONACO
========================================================= */

function initializeMonaco() {

    const editorContainer = document.getElementById("monacoEditor");
    const codeInput = document.getElementById("codeInput");

    if (!editorContainer) {
        console.error("Monaco container not found.");
        return;
    }

    /*
        Hide fallback textarea.

        Monaco is the real editor.
        We still keep the textarea in the HTML because
        analyzer.js may use #codeInput.
    */
    if (codeInput) {
        codeInput.style.display = "none";
    }

    require.config({
        paths: {
            vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs"
        }
    });

    require(
        ["vs/editor/editor.main"],
        function () {

            const initialCode = `# Write or paste your code here

def login(username):
    query = "SELECT * FROM users WHERE username = '" + username + "'"
    cursor.execute(query)
`;

            monacoEditor = monaco.editor.create(
                editorContainer,
                {
                    value: initialCode,

                    language: "python",

                    theme: "vs-dark",

                    automaticLayout: true,

                    minimap: {
                        enabled: true
                    },

                    fontSize: 13,

                    lineHeight: 22,

                    tabSize: 4,

                    insertSpaces: true,

                    wordWrap: "off",

                    scrollBeyondLastLine: false,

                    padding: {
                        top: 15,
                        bottom: 15
                    },

                    suggestOnTriggerCharacters: true,

                    quickSuggestions: true,

                    renderWhitespace: "selection",

                    cursorBlinking: "smooth",

                    readOnly: false,

                    domReadOnly: false
                }
            );


            /* =================================================
               SYNC MONACO → TEXTAREA
            ================================================= */

            function syncCodeInput() {

                if (!monacoEditor || !codeInput) {
                    return;
                }

                codeInput.value = monacoEditor.getValue();
            }

            syncCodeInput();


            monacoEditor.onDidChangeModelContent(
                function () {

                    syncCodeInput();

                }
            );


            /* =================================================
               FORCE FOCUS / INTERACTION
            ================================================= */

            editorContainer.style.pointerEvents = "auto";

            editorContainer.addEventListener(
                "click",
                function () {

                    if (monacoEditor) {
                        monacoEditor.focus();
                    }

                }
            );


            console.log("Monaco Editor initialized successfully.");

        }
    );
}


/* =========================================================
   CHANGE LANGUAGE
========================================================= */

function changeEditorLanguage(language) {

    if (!monacoEditor) {
        return;
    }

    const model = monacoEditor.getModel();

    if (!model) {
        return;
    }

    /*
        Convert HTML select values to Monaco language IDs.
    */

    const languageMap = {
        python: "python",
        javascript: "javascript",
        java: "java",
        cpp: "cpp"
    };

    const monacoLanguage =
        languageMap[language] || language;

    monaco.editor.setModelLanguage(
        model,
        monacoLanguage
    );
}


/* =========================================================
   GET CODE
========================================================= */

function getEditorCode() {

    if (!monacoEditor) {

        const codeInput =
            document.getElementById("codeInput");

        return codeInput
            ? codeInput.value
            : "";
    }

    return monacoEditor.getValue();
}


/* =========================================================
   SET CODE
========================================================= */

function setEditorCode(code) {

    if (!monacoEditor) {
        return;
    }

    monacoEditor.setValue(code || "");

    /*
        Keep fallback textarea synchronized.
    */

    const codeInput =
        document.getElementById("codeInput");

    if (codeInput) {
        codeInput.value = code || "";
    }
}


/* =========================================================
   CLEAR EDITOR
========================================================= */

function clearEditor() {

    if (!monacoEditor) {
        return;
    }

    monacoEditor.setValue("");

    const codeInput =
        document.getElementById("codeInput");

    if (codeInput) {
        codeInput.value = "";
    }

    /*
        Remove old vulnerability decorations.
    */

    vulnerabilityDecorations =
        monacoEditor.deltaDecorations(
            vulnerabilityDecorations,
            []
        );

    /*
        Remove old bottleneck decorations.
    */

    bottleneckDecorations =
        monacoEditor.deltaDecorations(
            bottleneckDecorations,
            []
        );

    console.log("Editor cleared.");
}


/* =========================================================
   ISSUE DECORATIONS
========================================================= */

function setIssueDecorations(issues) {

    if (!monacoEditor) {
        return;
    }

    /*
        Remove previous vulnerability decorations.
    */

    vulnerabilityDecorations =
        monacoEditor.deltaDecorations(
            vulnerabilityDecorations,
            []
        );

    if (!Array.isArray(issues)) {
        return;
    }

    const decorations = [];

    issues.forEach(function (issue) {

        if (!issue || !issue.line) {
            return;
        }

        const lineNumber =
            Number(issue.line);

        if (lineNumber < 1) {
            return;
        }

        decorations.push({

            range: new monaco.Range(
                lineNumber,
                1,
                lineNumber,
                1
            ),

            options: {

                isWholeLine: true,

                className:
                    "codeshield-vulnerability-line",

                glyphMarginClassName:
                    "codeshield-vulnerability-glyph",

                overviewRuler: {

                    color: "#b91c1c",

                    position:
                        monaco.editor.OverviewRulerLane.Full
                },

                minimap: {

                    color: "#b91c1c",

                    position:
                        monaco.editor.MinimapPosition.Inline
                }
            }
        });

    });


    vulnerabilityDecorations =
        monacoEditor.deltaDecorations(
            vulnerabilityDecorations,
            decorations
        );
}


/* =========================================================
   BOTTLENECK DECORATIONS
========================================================= */

function setBottleneckDecoration(
    lineStart,
    lineEnd
) {

    if (!monacoEditor) {
        return;
    }

    /*
        Remove previous bottleneck decorations.
    */

    bottleneckDecorations =
        monacoEditor.deltaDecorations(
            bottleneckDecorations,
            []
        );

    if (!lineStart || !lineEnd) {
        return;
    }

    const start =
        Number(lineStart);

    const end =
        Number(lineEnd);

    if (start < 1 || end < start) {
        return;
    }

    const decorations = [];

    for (
        let line = start;
        line <= end;
        line++
    ) {

        decorations.push({

            range: new monaco.Range(
                line,
                1,
                line,
                1
            ),

            options: {

                isWholeLine: true,

                className:
                    "codeshield-bottleneck-line"
            }
        });

    }


    bottleneckDecorations =
        monacoEditor.deltaDecorations(
            bottleneckDecorations,
            decorations
        );
}


/* =========================================================
   LANGUAGE SELECTOR
========================================================= */

const languageSelect =
    document.getElementById("language");

if (languageSelect) {

    languageSelect.addEventListener(
        "change",
        function () {

            changeEditorLanguage(
                languageSelect.value
            );

        }
    );
}


/* =========================================================
   CLEAR BUTTON
========================================================= */

const clearCodeBtn =
    document.getElementById("clearCodeBtn");

if (clearCodeBtn) {

    clearCodeBtn.addEventListener(
        "click",
        function () {

            clearEditor();

        }
    );
}


/* =========================================================
   WINDOW RESIZE
========================================================= */

window.addEventListener(
    "resize",
    function () {

        if (monacoEditor) {
            monacoEditor.layout();
        }

    }
);


/* =========================================================
   START MONACO
========================================================= */

initializeMonaco();