/* =========================================================
   CODESHIELD — API.JS
   Handles all communication with FastAPI
========================================================= */

const API_BASE_URL = "http://127.0.0.1:8000";


/* =========================================================
   ANALYZE CODE
========================================================= */

async function analyzeCodeAPI(code, language) {

    const response = await fetch(
        `${API_BASE_URL}/api/analyze`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                code: code,
                language: language
            })
        }
    );


    if (!response.ok) {

        let message =
            `Server error: ${response.status}`;

        try {

            const errorData =
                await response.json();

            if (errorData.detail) {
                message += ` - ${errorData.detail}`;
            }

        } catch (error) {
            // Ignore JSON parsing error
        }

        throw new Error(message);
    }


    const data =
        await response.json();


    console.log(
        "CodeShield API response:",
        data
    );


    return data;
}


/* =========================================================
   EXPLAIN VULNERABILITY
========================================================= */

async function explainVulnerabilityAPI(
    vulnerabilityId,
    question
) {

    const response = await fetch(
        `${API_BASE_URL}/api/explain`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                vulnerability_id: vulnerabilityId,
                question: question
            })
        }
    );


    if (!response.ok) {

        let message =
            `Server error: ${response.status}`;

        try {

            const errorData =
                await response.json();

            if (errorData.detail) {
                message += ` - ${errorData.detail}`;
            }

        } catch (error) {}

        throw new Error(message);
    }


    return await response.json();
}


/* =========================================================
   GITHUB IMPORT
========================================================= */

async function fetchGitHubAPI(githubUrl) {

    const response = await fetch(
        `${API_BASE_URL}/api/github/fetch`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                github_url: githubUrl
            })
        }
    );


    if (!response.ok) {

        let message =
            `Server error: ${response.status}`;

        try {

            const errorData =
                await response.json();

            if (errorData.detail) {
                message += ` - ${errorData.detail}`;
            }

        } catch (error) {}

        throw new Error(message);
    }


    return await response.json();
}


/* =========================================================
   BACKEND HEALTH CHECK
========================================================= */

async function checkBackendHealth() {

    try {

        const response =
            await fetch(`${API_BASE_URL}/`);

        return response.ok;

    } catch (error) {

        console.error(
            "Backend health check failed:",
            error
        );

        return false;
    }
}