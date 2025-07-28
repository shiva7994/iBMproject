document.addEventListener('DOMContentLoaded', () => {
    // Get references to DOM elements for analysis
    const emailContentTextArea = document.getElementById('email-content');
    const emailFileInput = document.getElementById('email-file');
    const analyzeButton = document.getElementById('analyze-button');
    const loadingIndicator = document.getElementById('loading-indicator');
    const resultsSection = document.getElementById('results-section');
    const resultDisplay = document.getElementById('result-display');
    const clearButton = document.getElementById('clear-button');
    const inputSection = document.getElementById('input-section');

    // --- Event Listener for Analyze Button ---
    analyzeButton.addEventListener('click', async () => {
        const emailContent = emailContentTextArea.value.trim();
        const emailFile = emailFileInput.files[0];

        if (!emailContent && !emailFile) {
            alert('Please paste email content or upload an email file to analyze.');
            return;
        }

        // Show loading indicator and disable the analyze button
        loadingIndicator.classList.remove('hidden');
        analyzeButton.disabled = true;
        resultDisplay.innerHTML = ''; // Clear any previous results
        resultsSection.classList.add('hidden'); // Hide results section until new results are ready

        let dataToSend = {};
        if (emailFile) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                dataToSend = { file_content: e.target.result };
                await sendAnalysisRequest(dataToSend);
            };
            reader.readAsText(emailFile);
        } else {
            dataToSend = { email_content: emailContent };
            await sendAnalysisRequest(dataToSend);
        }
    });

    /**
     * Sends the email content to the backend for analysis.
     * @param {Object} data - An object containing either 'email_content' or 'file_content'.
     */
    async function sendAnalysisRequest(data) {
        try {
            const response = await fetch('/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            loadingIndicator.classList.add('hidden');
            analyzeButton.disabled = false;
            resultsSection.classList.remove('hidden');
            
            displayResults(result);

        } catch (error) {
            console.error('Error during email analysis:', error);
            loadingIndicator.classList.add('hidden');
            analyzeButton.disabled = false;
            resultsSection.classList.remove('hidden');
            resultDisplay.innerHTML = `<p class="result-phishing text-red-600 font-bold">
                                        An error occurred during analysis. Please check the console for details or try again.
                                      </p>`;
        }
    }

    /**
     * Renders the analysis results in the result-display div.
     * @param {Object} result - The JSON object received from the backend.
     */
    function displayResults(result) {
        let outputHtml = `<h3 class="text-xl font-bold mb-4">Detection Result:</h3>`;

        if (result.is_phishing) {
            outputHtml += `<p class="result-phishing text-red-600 text-2xl mb-2">
                            <strong><span class="font-extrabold">&#9888; Potential Phishing Email Detected!</span></strong>
                           </p>`;
        } else {
            outputHtml += `<p class="result-safe text-green-600 text-2xl mb-2">
                            <strong><span class="font-extrabold">&#10003; This email appears to be legitimate.</span></strong>
                           </p>`;
        }

        if (result.confidence !== undefined && result.confidence !== null) {
            outputHtml += `<p class="result-detail text-gray-700 text-lg">
                            Confidence Score: <span class="font-semibold">${Math.round(result.confidence * 100)}%</span>
                           </p>`;
        }

        if (result.details && Object.keys(result.details).length > 0) {
            outputHtml += `<div class="result-detail mt-4">
                            <h4 class="text-lg font-semibold text-blue-800 mb-2">Analysis Details:</h4>
                            <ul class="list-none space-y-2">`;
            for (const key in result.details) {
                let value = result.details[key];
                if (Array.isArray(value)) {
                    value = value.join(', ') || 'None';
                } else if (value === null || value === undefined || value === '') {
                    value = 'N/A';
                }
                outputHtml += `<li class="flex items-start">
                                <span class="font-semibold w-32 flex-shrink-0">${key}:</span> 
                                <span class="flex-grow">${value}</span>
                               </li>`;
            }
            outputHtml += `</ul></div>`;
        } else {
            outputHtml += `<p class="result-detail text-gray-700 mt-4">No specific details available for this analysis.</p>`;
        }
        
        resultDisplay.innerHTML = outputHtml;
    }

    // --- Event Listener for Clear Button ---
    clearButton.addEventListener('click', () => {
        emailContentTextArea.value = '';
        emailFileInput.value = '';
        resultsSection.classList.add('hidden');
        inputSection.classList.remove('hidden');
        resultDisplay.innerHTML = '';
        analyzeButton.disabled = false;
    });
});
