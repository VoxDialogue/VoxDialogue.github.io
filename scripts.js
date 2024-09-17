// scripts.js

document.addEventListener("DOMContentLoaded", () => {
    const scenarioSelect = document.getElementById("scenario-select");
    const container = document.getElementById("dialogues-container");

    // Define available scenarios
    const scenarios = [
        {
            displayName: "Daily Dialogue / Acoustic Information / Emotion",
            path: "Benchmark/acoustic_information/emotion/processed_dialog.json"
        },
        {
            displayName: "Daily Dialogue / Acoustic Information / Stress",
            path: "Benchmark/acoustic_information/stress/processed_dialog.json"
        },
        {
            displayName: "Daily Dialogue / Acoustic Information / Emotion",
            path: "Benchmark/acoustic_information/non/processed_dialog.json"
        },
        {
            displayName: "Daily Dialogue / Acoustic Information / Emotion",
            path: "Benchmark/acoustic_information/fidelity/processed_dialog.json"
        },
        {
            displayName: "Daily Dialogue / Acoustic Information / Speed",
            path: "Benchmark/acoustic_information/speed/processed_dialog.json"
        },
        {
            displayName: "Daily Dialogue / Acoustic Information / Volume",
            path: "Benchmark/acoustic_information/volume/processed_dialog.json"
        },
        {
            displayName: "Daily Dialogue / Speaker Information / Language",
            path: "Benchmark/speaker_identity/language/processed_dialog.json"
        },
        {
            displayName: "Daily Dialogue / Speaker Information / Gender",
            path: "Benchmark/speaker_identity/gender/processed_dialog.json"
        },
        // {
        //     displayName: "Daily Dialogue / Speaker Information / Age",
        //     path: "Benchmark/speaker_identity/age/processed_dialog.json"
        // },
        // {
        //     displayName: "Daily Dialogue / Speaker Information / Accent",
        //     path: "Benchmark/speaker_identity/accent/processed_dialog.json"
        // },


        // Add more scenarios as needed
    ];

    // Populate the scenario dropdown
    scenarios.forEach(scenario => {
        const option = document.createElement("option");
        option.value = scenario.path;
        option.textContent = scenario.displayName;
        scenarioSelect.appendChild(option);
    });

    // Handle scenario selection
    scenarioSelect.addEventListener("change", () => {
        const selectedPath = scenarioSelect.value;
        if (selectedPath) {
            fetchDialogues(selectedPath);
        }
    });

    // Fetch and render dialogues
    function fetchDialogues(jsonPath) {
        fetch(jsonPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${jsonPath}: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                renderDialogues(data, jsonPath);
            })
            .catch(error => {
                console.error("Error fetching dialogues:", error);
                container.innerHTML = `<p style="color:red;">Error loading dialogues. Please try again later.</p>`;
            });
    }

    // Render dialogues in the container
    // Assuming jsonPath is the path to the processed_dialog.json file
    function renderDialogues(data, jsonPath) {
        container.innerHTML = ""; // Clear previous dialogues

        // Extract the base path from jsonPath
        const basePath = jsonPath.substring(0, jsonPath.lastIndexOf('/'));

        for (const [category, dialogues] of Object.entries(data)) {
            const categoryDiv = document.createElement("div");
            categoryDiv.classList.add("dialogue-category");

            const categoryHeader = document.createElement("h2");
            categoryHeader.textContent = formatCategoryName(category);
            categoryHeader.addEventListener("click", () => {
                const dialogueList = categoryDiv.querySelector(".dialogue-list");
                dialogueList.style.display = dialogueList.style.display === "block" ? "none" : "block";
            });

            const dialogueList = document.createElement("div");
            dialogueList.classList.add("dialogue-list");

            for (const [dialogId, turns] of Object.entries(dialogues)) {
                const dialogueDiv = document.createElement("div");
                dialogueDiv.classList.add("dialogue");

                const dialogueHeader = document.createElement("div");
                dialogueHeader.classList.add("dialogue-header");

                const dialogueTitle = document.createElement("h3");
                dialogueTitle.textContent = formatDialogId(dialogId);

                const toggleButton = document.createElement("button");
                toggleButton.textContent = "Expand";
                toggleButton.addEventListener("click", () => {
                    const contents = dialogueDiv.querySelector(".dialogue-contents");
                    const isVisible = contents.style.display === "block";
                    contents.style.display = isVisible ? "none" : "block";
                    toggleButton.textContent = isVisible ? "Expand" : "Collapse";
                });

                dialogueHeader.appendChild(dialogueTitle);
                dialogueHeader.appendChild(toggleButton);

                const dialogueContents = document.createElement("div");
                dialogueContents.classList.add("dialogue-contents");

                turns.forEach(turn => {
                    const turnDiv = document.createElement("div");
                    turnDiv.classList.add("turn");

                    const speaker = document.createElement("div");
                    speaker.classList.add("speaker");
                    speaker.textContent = `Speaker ${turn.speaker_id} (${turn.spk_info})`;

                    const content = document.createElement("div");
                    content.classList.add("content");
                    content.textContent = turn.content;

                    const audio = document.createElement("audio");
                    audio.controls = true;
                    // Construct the full audio path by combining the JSON path's directory with wav_path
                    const audioPath = `${basePath}/${turn.wav_path}`;
                    audio.src = audioPath;
                    audio.type = "audio/wav";

                    turnDiv.appendChild(speaker);
                    turnDiv.appendChild(content);
                    turnDiv.appendChild(audio);

                    dialogueContents.appendChild(turnDiv);
                });

                dialogueDiv.appendChild(dialogueHeader);
                dialogueDiv.appendChild(dialogueContents);

                dialogueList.appendChild(dialogueDiv);
            }

            categoryDiv.appendChild(categoryHeader);
            categoryDiv.appendChild(dialogueList);
            container.appendChild(categoryDiv);
        }
    }

    // Helper function to format category names
    function formatCategoryName(name) {
        return name.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
    }

    // Helper function to format dialogue IDs
    function formatDialogId(id) {
        return id.replace(/_/g, ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase());
    }
});