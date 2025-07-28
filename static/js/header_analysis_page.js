document.addEventListener('DOMContentLoaded', () => {
    const emailContentHeaderTextArea = document.getElementById('email-content-header');
    const analyzeHeaderButton = document.getElementById('analyze-header-button');
    const loadingIndicatorHeader = document.getElementById('loading-indicator-header');
    const headerResultsSection = document.getElementById('header-results-section');
    const headerResultDisplay = document.getElementById('header-result-display');
    const clearHeaderButton = document.getElementById('clear-header-button');
    const headerInputSection = document.getElementById('header-input-section');

    analyzeHeaderButton.addEventListener('click', async () => {
        const emailContent = emailContentHeaderTextArea.value.trim();

        if (!emailContent) {
            alert('Please paste email content for header analysis.');
            return;
        }

        loadingIndicatorHeader.classList.remove('hidden');
        analyzeHeaderButton.disabled = true;
        headerResultDisplay.innerHTML = '';
        headerResultsSection.classList.add('hidden');

        try {
            const response = await fetch('/analyze_email_headers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email_content: emailContent }),
            });

            const result = await response.json();

            loadingIndicatorHeader.classList.add('hidden');
            analyzeHeaderButton.disabled = false;
            headerResultsSection.classList.remove('hidden');
            
            displayHeaderResults(result);

        } catch (error) {
            console.error('Error during header analysis:', error);
            loadingIndicatorHeader.classList.add('hidden');
            analyzeHeaderButton.disabled = false;
            headerResultsSection.classList.remove('hidden');
            headerResultDisplay.innerHTML = `<p class="text-red-600 font-bold">
                                              An error occurred during header analysis. Please check the console for details or try again.
                                            </p>`;
        }
    });

    function displayHeaderResults(result) {
        if (!result.success) {
            headerResultDisplay.innerHTML = `<p class="text-red-600 font-bold">Error: ${result.error || 'Failed to get analysis.'}</p>`;
            return;
        }

        const details = result.header_details;
        const summaryFlags = result.summary_flags;

        let outputHtml = `<h3 class="text-xl font-bold mb-4">Summary Flags:</h3>
                          <ul class="list-disc list-inside text-gray-700 mb-6 space-y-2">`;
        
        for (const flag in summaryFlags) {
            const displayFlag = flag.replace(/([A-Z])/g, ' $1').replace(/^Has/, '').trim(); // Format camelCase to readable text
            const icon = summaryFlags[flag] ? '<span class="text-red-500 font-bold">&#10007;</span>' : '<span class="text-green-500 font-bold">&#10003;</span>';
            const colorClass = summaryFlags[flag] ? 'text-red-700' : 'text-green-700';
            outputHtml += `<li class="${colorClass}">${icon} <strong>${displayFlag}:</strong> ${summaryFlags[flag] ? 'Yes' : 'No'}</li>`;
        }
        outputHtml += `</ul>`;


        outputHtml += `<h3 class="text-xl font-bold mb-4 mt-6">Detailed Header Information:</h3>
                       <ul class="list-none space-y-3">`;

        // Common Headers
        outputHtml += `<li><strong>From:</strong> <span class="font-mono break-all">${details["From Header"]}</span></li>`;
        outputHtml += `<li><strong>Subject:</strong> <span class="break-words">${details["Subject Header"]}</span></li>`;
        outputHtml += `<li><strong>Reply-To:</strong> <span class="font-mono break-all">${details["Reply-To Header"]}</span></li>`;
        outputHtml += `<li><strong>Authentication-Results:</strong> <span class="font-mono break-all">${details["Authentication-Results"]}</span></li>`;
        outputHtml += `<li><strong>Received Headers (Count):</strong> <span>${details["Received Headers (Count)"]}</span></li>`;
        outputHtml += `<li><strong>Heuristic Header Score:</strong> <span>${details["Heuristic Header Score"]}</span></li>`;
        
        // Suspicious Indicators
        outputHtml += `<li class="mt-4"><strong>Suspicious Flags:</strong></li><ul class="list-disc list-inside ml-4 space-y-1">`;
        if (details["Suspicious Header Flags"] && details["Suspicious Header Flags"].length > 0) {
            details["Suspicious Header Flags"].forEach(flag => {
                outputHtml += `<li class="text-red-700 font-semibold">${flag}</li>`;
            });
        } else {
            outputHtml += `<li class="text-green-700">None detected.</li>`;
        }
        outputHtml += `</ul>`;

        // Raw Received Headers (collapsible section)
        outputHtml += `<li class="mt-4">
                            <details class="cursor-pointer">
                                <summary class="font-semibold text-blue-800 hover:text-blue-600">Raw Received Headers (${details["Received Headers (Count)"]} found)</summary>
                                <pre class="bg-gray-100 p-3 rounded-md text-sm mt-2 whitespace-pre-wrap break-all">${details["Raw Received Headers"].join('\n') || 'None'}</pre>
                            </details>
                       </li>`;

        outputHtml += `</ul>`; // Close main ul
        headerResultDisplay.innerHTML = outputHtml;
    }

    clearHeaderButton.addEventListener('click', () => {
        emailContentHeaderTextArea.value = '';
        headerResultsSection.classList.add('hidden');
        headerInputSection.classList.remove('hidden');
        headerResultDisplay.innerHTML = '';
        analyzeHeaderButton.disabled = false;
    });
});
