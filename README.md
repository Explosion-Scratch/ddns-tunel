# Dynamic DNS Update Script for Cloudflare Tunnels

This script is designed to update Cloudflare Tunnel configurations dynamically. It retrieves the current configuration of a specified Cloudflare Tunnel, identifies the IP addresses associated with the existing configurations, and replaces them with a new IP address. This script is particularly useful for maintaining dynamic IP addresses and keeping Cloudflare Tunnel configurations up-to-date.

## Prerequisites
- Node.js
- npm (Node Package Manager)
- Cloudflare Account with API Key and Zone ID
- Cloudflare Tunnel ID

## Getting Zone ID, and Tunnel ID:
1. Login to cloudflare
2. Click on your domain
3. Copy the Zone ID from the siderail
4. Click on access, this will take you to Zero Trust dashboard
5. Click on access again:

 <img width="231" alt="image" src="https://github.com/Explosion-Scratch/ddns-tunel/assets/61319150/445c8c45-3a3d-4fba-a31d-aebd447acad6">

5. Click on a specific tunnel
6. Now the URL should look like this, copy the relevant sections.
```
https://one.dash.cloudflare.com/ACCOUNT_ID/access/tunnels/TUNNEL_ID?tab=publicHostname
```

## Configuration

Edit the script and provide your Cloudflare authentication details in the `AUTH` object:

```javascript
const AUTH = {
    apiKey: "YOUR_CLOUDFLARE_API_KEY",
    zoneId: "YOUR_CLOUDFLARE_ZONE_ID",
    accountId: "YOUR_CLOUDFLARE_ACCOUNT_ID",
    email: "YOUR_CLOUDFLARE_EMAIL",
    tunnelId: "YOUR_CLOUDFLARE_TUNNEL_ID",
};
```

## Usage

### 1. Install Dependencies
```bash
npm install
```

### 2. Running the Script

Execute the script manually:

```bash
node index.js
```

### 3. Cron Job Configuration

To automate the script execution, you can set up a cron job on Linux. For example, to run the script every hour, open the crontab editor:

```bash
crontab -e
```

Add the following line to run the script every hour:

```bash
0 * * * * /path/to/node /path/to/index.js
```

Save and exit the editor. The script will now run automatically every hour.

Replace `/path/to/node` and `/path/to/index.js` with the actual paths to your Node.js executable and the script file.

## Important Notes

- Ensure that your Cloudflare Tunnel is configured to use the desired domain(s).
- Keep your Cloudflare API key and account details secure.
- Review Cloudflare API rate limits and adjust the cron job frequency accordingly.


## Troubleshooting

- If encountering issues, check the console output for error messages.
- Review Cloudflare Tunnel configurations and ensure they match the script's expectations.
- Double-check API key, email, and other authentication details in the script.

## License

This script is licensed under the [MIT License](LICENSE). Feel free to customize and share it.
