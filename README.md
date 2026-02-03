## How to use

1. **Start the browser container** (runs Chrome with remote debugging):
```bash
docker run -d -p 9221:9222 -v ./sessions:/app/sessions -v ./data:/app/data -v ./backend-services:/app/backend-services -v ./secrets:/app/secrets/ --name katokult-browser katokult-scraper node ./backend-services/start-scraper-browser.js
```

2. **Sign in to Facebook manually** (one-time setup):
   - Open Chrome on your host machine
   - Go to `chrome://inspect`
   - Click "Configure" and add `localhost:9221` to the targets
   - You should see the remote browser appear under "Remote Target"
   - Click "inspect" to open DevTools
   - You should see the Facebook login page - sign in with your credentials
   - The session will be saved in the browser container

3. **Run the scraper** (connects to the running browser):
```bash
./scrap_and_rebuild.sh
```

The scraper will automatically find the running browser container and use its WebSocket endpoint to connect and scrape events.
2.2 schedule
```bash
pm2 start pm2_runner.js --cron "15 13 * * *" --name "ultramarynia-daily"
```


## How to run scrapper from files
1. put in current folder secrets.json & service-key.json
2. download katokult-scrapper.tar and run `docker load -i katokult-scrapper.tar`
3. Test if works running  `docker run -v ./secrets:/app/secrets/ katokult-scraper`
4. Add to crontab running this
run `crontab -e` and paste the thing below
- `00 15 * * * cd /folder-with-secrets && docker run -v ./:/app/secrets/ katokult-scrapper | logger -t katokult`


This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
