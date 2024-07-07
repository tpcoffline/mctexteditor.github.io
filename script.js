document.addEventListener("DOMContentLoaded", () => {
    addEntry(true); // Add the default entry on load
});

function toggleAnimation() {
    const animationCheck = document.getElementById("animationCheck").checked;
    const animationOptions = document.getElementById("animationOptions");
    const outputContainer = document.getElementById("outputContainer");
    if (animationCheck) {
        animationOptions.classList.remove("hidden");
        outputContainer.classList.add("hidden");
    } else {
        animationOptions.classList.add("hidden");
        outputContainer.classList.remove("hidden");
    }
    toggleAnimationType();
}

function toggleAnimationType() {
    const animationType = document.querySelector('input[name="animationType"]:checked').value;
    const bossbarOptions = document.getElementById("bossbarOptions");
    const tellrawOptions = document.getElementById("tellrawOptions");
    if (animationType === "bossbar") {
        bossbarOptions.classList.remove("hidden");
        tellrawOptions.classList.add("hidden");
    } else {
        bossbarOptions.classList.add("hidden");
        tellrawOptions.classList.remove("hidden");
    }
}

function addEntry(isDefault = false) {
    const entries = document.getElementById("entries");
    const entryDiv = document.createElement("div");

    entryDiv.innerHTML = `
        <label>Metin: <input type="text" class="text"></label>
        <label><input type="checkbox" class="bold"> Bold</label>
        <label><input type="checkbox" class="italic"> Italic</label>
        <label>Renk: <input type="color" class="color" value="#FFFFFF"></label>
        <label>Harf Süresi: <input type="number" class="letterDelay" value="5" min="0"></label>
        <label>Geçiş Süresi: <input type="number" class="transitionDelay" value="5" min="0"></label>
    `;
    if (!isDefault) {
        const removeButton = document.createElement("button");
        removeButton.textContent = "Kaldır";
        removeButton.onclick = () => removeEntry(entryDiv);
        entryDiv.appendChild(removeButton);
    }

    entries.appendChild(entryDiv);
}

function removeEntry(entryDiv) {
    entryDiv.parentNode.removeChild(entryDiv);
}

function generateOutput() {
    const animationCheck = document.getElementById("animationCheck").checked;
    const animationType = document.querySelector('input[name="animationType"]:checked').value;
    const output = document.getElementById("output");
    const entries = document.querySelectorAll("#entries > div");

    const data = Array.from(entries).map(entry => ({
        text: entry.querySelector(".text").value,
        bold: entry.querySelector(".bold").checked,
        italic: entry.querySelector(".italic").checked,
        color: entry.querySelector(".color").value,
        letter_delay: parseInt(entry.querySelector(".letterDelay").value),
        transition_delay: parseInt(entry.querySelector(".transitionDelay").value)
    }));

    if (animationCheck) {
        let commands = [];
        let commandIndex = 1;

        if (animationType === "bossbar") {
            const bossbarName = document.getElementById("bossbarName").value;
            const datapackName = document.getElementById("datapackName").value;
            const folderName = document.getElementById("folderName").value;

            let combinedText = [];
            for (let i = 0; i < data.length; i++) {
                const entry = data[i];
                for (let j = 0; j < entry.text.length; j++) {
                    combinedText.push({
                        text: entry.text[j],
                        bold: entry.bold,
                        italic: entry.italic,
                        color: entry.color
                    });
                    let message = combinedText.map(item => ({
                        text: item.text,
                        bold: item.bold,
                        italic: item.italic,
                        color: item.color
                    }));
                    commands.push({
                        filename: `${folderName}/${commandIndex}.mcfunction`,
                        content: `bossbar set ${bossbarName} name ${JSON.stringify(message)}\nschedule function ${datapackName}:${folderName}/${commandIndex + 1} ${entry.letter_delay}t`
                    });
                    commandIndex++;
                }
                if (i < data.length - 1) {
                    let message = combinedText.map(item => ({
                        text: item.text,
                        bold: item.bold,
                        italic: item.italic,
                        color: item.color
                    }));
                    commands.push({
                        filename: `${folderName}/${commandIndex}.mcfunction`,
                        content: `bossbar set ${bossbarName} name ${JSON.stringify(message)}\nschedule function ${datapackName}:${folderName}/${commandIndex + 1} ${entry.transition_delay}t`
                    });
                    commandIndex++;
                }
            }
        } else if (animationType === "tellraw") {
            const datapackName = document.getElementById("datapackName2").value;
            const folderName = document.getElementById("folderName2").value;
            const playerSelector = document.getElementById("playerSelector").value;

            let combinedText = [];
            for (let i = 0; i < data.length; i++) {
                const entry = data[i];
                for (let j = 0; j < entry.text.length; j++) {
                    combinedText.push({
                        text: entry.text[j],
                        bold: entry.bold,
                        italic: entry.italic,
                        color: entry.color
                    });
                    let message = combinedText.map(item => ({
                        text: item.text,
                        bold: item.bold,
                        italic: item.italic,
                        color: item.color
                    }));
                    message = JSON.stringify([{ text: "\n\n\n\n\n\n" }, ...message, { text: "\n\n\n\n" }]);
                    commands.push({
                        filename: `${folderName}/${commandIndex}.mcfunction`,
                        content: `tellraw ${playerSelector} ${message}\nschedule function ${datapackName}:${folderName}/${commandIndex + 1} ${entry.letter_delay}t`
                    });
                    commandIndex++;
                }
                if (i < data.length - 1) {
                    let message = combinedText.map(item => ({
                        text: item.text,
                        bold: item.bold,
                        italic: item.italic,
                        color: item.color
                    }));
                    message = JSON.stringify([{ text: "\n\n\n\n\n\n" }, ...message, { text: "\n\n\n\n" }]);
                    commands.push({
                        filename: `${folderName}/${commandIndex}.mcfunction`,
                        content: `tellraw ${playerSelector} ${message}\nschedule function ${datapackName}:${folderName}/${commandIndex + 1} ${entry.transition_delay}t`
                    });
                    commandIndex++;
                }
            }
        }
        downloadZip(commands);
    } else {
        const outputData = data.map(entry => {
            const { letter_delay, transition_delay, ...rest } = entry;
            return rest;
        });
        output.value = JSON.stringify(outputData);
    }
}

function downloadZip(files) {
    const zip = new JSZip();
    files.forEach(file => {
        zip.file(file.filename, file.content);
    });
    zip.generateAsync({ type: "blob" }).then(content => {
        saveAs(content, "minecraft_text.zip");
    });
}
