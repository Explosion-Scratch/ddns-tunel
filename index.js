const { execSync } = require("child_process");

// TODO: Update these
const AUTH = {
    apiKey: "",
    zoneId: "",
    accountId: "",
    email: "",
    tunnelId: "",
};

const PARAMS = {
    headers: {
        "X-Auth-Email": AUTH.email,
        "X-Auth-Key": AUTH.apiKey,
        "Content-Type": "application/json",
    },
};

const IP_RE = /((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}/;

const NEW_IP = process.env.NEW_IP || getInternalIP();

const main = async () => {
    console.log('Fetching records for tunnel ' + AUTH.tunnelId);
    const records = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${AUTH.accountId}/cfd_tunnel/${AUTH.tunnelId}/configurations`,
        { ...PARAMS },
    ).then((r) => r.json());
    console.log('Found ' + records.result.config.ingress.length + ' records');
    let domains = records.result.config.ingress;
    const old_domains = [...domains];

    const OLD_IPS = [
        ...new Set(domains.map((i) => i.service.match(IP_RE)?.[0])),
    ].filter(Boolean);
    if ((OLD_IPS.length > 1 || OLD_IPS.length === 0) && !process.env.OLD_IP) {
        console.error("[ERROR] More than one/no IPs found in records:", OLD_IPS);
        console.error(
            `[ERROR] Set the OLD_IP environment variable:\n\n\tOLD_IP="IP_TO_REPLACE_HERE" node index.js\nSorry!`,
        );
        process.exit(1);
    }


    const TO_REPLACE = process.env.OLD_IP || OLD_IPS[0];

    if (NEW_IP === TO_REPLACE) {
        console.warn("[WARN] New IP is the same as the old one:", NEW_IP);
        process.exit(0);
    }

    for (let i = 0; i < domains.length; i++) {
        domains[i].service = domains[i].service.replace(TO_REPLACE, NEW_IP);
    }

    console.log(`Updating ${domains.length} records:\n\n${old_domains.map((i, idx) => `\n${i.service} -> ${domains[idx].service}`).join("\n")}\n\n`);

    fetch(
        `https://api.cloudflare.com/client/v4/accounts/${AUTH.accountId}/cfd_tunnel/${AUTH.tunnelId}/configurations`,
        {
            body: JSON.stringify({
                config: {
                    ingress: domains,
                },
            }),
            method: "PUT",
            ...PARAMS,
        },
    ).then(r => r.json()).then(console.log.bind(console, "Output: "));
};

main();

function getInternalIP() {
    const result = execSync("ip addr show wlan0").toString();
    return result
        .split("\n")
        .find((i) => i.includes("inet "))
        .match(IP_RE)[0];
}

async function getIP() {
    const ipv4Regex = "((25[0-5]|(2[0-4]|1d|[1-9]|)d).?\b){4}";

    try {
        // Attempt to get the IP from cloudflare.com/cdn-cgi/trace
        const response = await fetch("https://cloudflare.com/cdn-cgi/trace");
        if (!response.ok) {
            throw new Error("Failed to get IP from cloudflare.com");
        }

        const text = await response.text();
        const ipLine = text.split("\n").find((line) => line.startsWith("ip="));
        if (ipLine) {
            // Extract just the IP from the ip line from cloudflare.
            const ip = ipLine.match(new RegExp(`^ip=(${ipv4Regex})$`));
            if (ip?.[1]) {
                return ip[1];
            }
        }
    } catch (error) {
        console.error(error.message);
    }

    try {
        // Attempt to get the IP from other websites if cloudflare fails
        const responseIpify = await fetch("https://api.ipify.org");
        const responseIcanhazip = await fetch("https://ipv4.icanhazip.com");

        const ipifyIp = await responseIpify.text();
        const icanhazipIp = await responseIcanhazip.text();

        return ipifyIp || icanhazipIp || null;
    } catch (error) {
        console.error(error.message);
        return null;
    }
}
