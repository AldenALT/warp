document.addEventListener("DOMContentLoaded", async () => {
    const threads = document.getElementsByClassName("tr-thread");

    for (const thread of threads) {
        const statusElement = document.querySelectorAll(
            `tr.tr-thread#${thread.id} > td.status`
        )[0];
        const statusTextElement = document.querySelectorAll(
            `tr.tr-thread#${thread.id} > td.status > a > span`
        )[0];

        statusTextElement.innerHTML = `Connecting...`;

        let status;

        try {
            const res = await axios.get(
                `https://warp-plus-${thread.id.replace(
                    "thread-",
                    ""
                )}.aldenalt.repl.co/`
            );
            status = res.status;
        } catch (err) {
            status = err?.response?.status;
        }

        if (status === 200) {
            statusElement.id = "online";
        } else {
            statusElement.id = "offline";
        }

        statusTextElement.innerHTML = `${status}`;
    }
});
