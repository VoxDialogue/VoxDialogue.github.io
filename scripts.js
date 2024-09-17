// scripts.js

document.addEventListener("DOMContentLoaded", () => {
    const scenarioSelect = document.getElementById("scenario-select");
    const container = document.getElementById("dialogues-container");
    const paginationContainer = document.getElementById("pagination");

    // 每页显示的对话数量
    const dialoguesPerPage = 40;
    let currentPage = 1;
    let currentDialogues = [];
    let currentJsonPath = ""; // 存储当前的jsonPath

    // 定义可用的场景
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
            displayName: "Daily Dialogue / Acoustic Information / Non",
            path: "Benchmark/acoustic_information/non/processed_dialog.json"
        },
        {
            displayName: "Daily Dialogue / Acoustic Information / Fidelity",
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

    // 填充场景下拉菜单
    scenarios.forEach(scenario => {
        const option = document.createElement("option");
        option.value = scenario.path;
        option.textContent = scenario.displayName;
        scenarioSelect.appendChild(option);
    });

    // 处理场景选择
    scenarioSelect.addEventListener("change", () => {
        const selectedPath = scenarioSelect.value;
        if (selectedPath) {
            fetchDialogues(selectedPath);
        }
    });

    // 获取并渲染对话
    function fetchDialogues(jsonPath) {
        console.log(`Fetching dialogues from: ${jsonPath}`); // 调试
        fetch(jsonPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${jsonPath}: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Fetched data:", data); // 调试
                currentJsonPath = jsonPath; // 更新当前jsonPath
                processDialogues(data, jsonPath);
            })
            .catch(error => {
                console.error("Error fetching dialogues:", error);
                container.innerHTML = `<p style="color:red;">Error loading dialogues. Please try again later.</p>`;
                paginationContainer.innerHTML = "";
            });
    }

    // 处理并扁平化对话列表
    function processDialogues(data, jsonPath) {
        currentDialogues = []; // 重置当前对话列表

        // 提取 jsonPath 的基路径
        const basePath = jsonPath.substring(0, jsonPath.lastIndexOf('/'));
        console.log(`Base path for audio files: ${basePath}`); // 调试

        // 假设数据结构为：{ "Category": { "dialog_id": [turns], ... }, ... }
        for (const [category, dialogues] of Object.entries(data)) {
            for (const [dialogId, turns] of Object.entries(dialogues)) {
                currentDialogues.push({
                    category: category,
                    dialogId: dialogId,
                    turns: turns
                });
            }
        }

        console.log(`Total dialogues: ${currentDialogues.length}`); // 调试

        // 初始化为第一页
        currentPage = 1;
        renderPage(currentPage);
        setupPagination();
    }

    // 渲染特定页面的对话
    function renderPage(page) {
        container.innerHTML = ""; // 清除之前的对话

        const startIndex = (page - 1) * dialoguesPerPage;
        const endIndex = startIndex + dialoguesPerPage;
        const dialoguesToShow = currentDialogues.slice(startIndex, endIndex);

        // 按类别分组对话
        const grouped = {};
        dialoguesToShow.forEach(dialogue => {
            if (!grouped[dialogue.category]) {
                grouped[dialogue.category] = [];
            }
            grouped[dialogue.category].push(dialogue);
        });

        for (const [category, dialogues] of Object.entries(grouped)) {
            console.log(`Processing category: ${category}`); // 调试

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

            dialogues.forEach(dialogue => {
                console.log(`Processing dialogue: ${dialogue.dialogId}`); // 调试

                const dialogueDiv = document.createElement("div");
                dialogueDiv.classList.add("dialogue");

                const dialogueHeader = document.createElement("div");
                dialogueHeader.classList.add("dialogue-header");

                const dialogueTitle = document.createElement("h3");
                dialogueTitle.textContent = formatDialogId(dialogue.dialogId);

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

                dialogue.turns.forEach(turn => {
                    console.log(`Processing turn: ${turn.turn_id}`); // 调试

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
                    audio.preload = "none"; // 防止预加载

                    // 检查 wav_path 是否存在且非空
                    if (turn.wav_path && typeof turn.wav_path === 'string' && turn.wav_path.trim() !== "") {
                        const audioPath = `${currentJsonPath.substring(0, currentJsonPath.lastIndexOf('/'))}/${turn.wav_path}`;
                        console.log(`Audio path: ${audioPath}`); // 调试
                        // audio.setAttribute("data-src", audioPath);
                        audio.type = "audio/wav";
                        audio.src = audioPath
                        // // 监听 play 事件，动态设置 src
                        // const playHandler = () => {
                        //     if (!audio.src) {
                        //         const src = audio.getAttribute("data-src");
                        //         if (src && src.trim() !== "") {
                        //             audio.src = src;
                        //             audio.load();
                        //         } else {
                        //             console.warn(`Invalid wav_path for dialogue: ${dialogue.dialogId}, turn: ${turn.turn_id}`);
                        //         }
                        //         audio.removeEventListener("play", playHandler); // 移除事件监听，避免重复设置
                        //     }
                        // };
                        //
                        // audio.addEventListener("play", playHandler);
                    } else {
                        console.warn(`No valid wav_path found for dialogue: ${dialogue.dialogId}, turn: ${turn.turn_id}`);
                        // 如果没有音频路径，可以选择隐藏音频控件或显示占位信息
                        // 例如：
                        // const noAudioMsg = document.createElement("p");
                        // noAudioMsg.textContent = "No audio available.";
                        // turnDiv.appendChild(noAudioMsg);
                    }

                    turnDiv.appendChild(speaker);
                    turnDiv.appendChild(content);
                    turnDiv.appendChild(audio);

                    dialogueContents.appendChild(turnDiv);
                });

                dialogueDiv.appendChild(dialogueHeader);
                dialogueDiv.appendChild(dialogueContents);

                dialogueList.appendChild(dialogueDiv);
            });

            categoryDiv.appendChild(categoryHeader);
            categoryDiv.appendChild(dialogueList);
            container.appendChild(categoryDiv);
        }
    }

    // 设置分页控件
    function setupPagination() {
        paginationContainer.innerHTML = ""; // 清除之前的分页

        const totalPages = Math.ceil(currentDialogues.length / dialoguesPerPage);
        if (totalPages <= 1) return; // 不需要分页

        // 上一页按钮
        const prevButton = document.createElement("button");
        prevButton.textContent = "Prev";
        prevButton.disabled = currentPage === 1;
        if (currentPage === 1) {
            prevButton.classList.add("disabled");
        }
        prevButton.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                renderPage(currentPage);
                setupPagination();
                window.scrollTo(0, 0); // 页面切换时滚动到顶部
            }
        });
        paginationContainer.appendChild(prevButton);

        // 页码按钮
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement("button");
            pageButton.textContent = i;
            if (i === currentPage) {
                pageButton.classList.add("active");
            }
            pageButton.addEventListener("click", () => {
                currentPage = i;
                renderPage(currentPage);
                setupPagination();
                window.scrollTo(0, 0); // 页面切换时滚动到顶部
            });
            paginationContainer.appendChild(pageButton);
        }

        // 下一页按钮
        const nextButton = document.createElement("button");
        nextButton.textContent = "Next";
        nextButton.disabled = currentPage === totalPages;
        if (currentPage === totalPages) {
            nextButton.classList.add("disabled");
        }
        nextButton.addEventListener("click", () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderPage(currentPage);
                setupPagination();
                window.scrollTo(0, 0); // 页面切换时滚动到顶部
            }
        });
        paginationContainer.appendChild(nextButton);
    }

    // 格式化类别名称
    function formatCategoryName(name) {
        return name.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
    }

    // 格式化对话ID
    function formatDialogId(id) {
        return id.replace(/_/g, ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase());
    }
});