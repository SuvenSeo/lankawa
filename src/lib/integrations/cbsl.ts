const RESULTS_URL =
  "https://www.cbsl.gov.lk/cbsl_custom/exratestt/exrates_resultstt.php";

const BOT_USER_AGENT =
  "LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa)";

export interface CbslFxRate {
  date: string;
  buyRate: number;
  sellRate: number;
  observedAt: string;
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toObservedAt(day: string): string {
  return `${day}T06:30:00.000Z`;
}

function parseRatesTable(html: string): CbslFxRate[] {
  const rates: CbslFxRate[] = [];
  const rowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const cellPattern = /<td[^>]*>([\s\S]*?)<\/td>/gi;

  for (const rowMatch of html.matchAll(rowPattern)) {
    const cells: string[] = [];
    for (const cellMatch of rowMatch[1].matchAll(cellPattern)) {
      cells.push(cellMatch[1].replace(/<[^>]+>/g, "").trim());
    }

    if (cells.length !== 3) {
      continue;
    }

    const [day, buy, sell] = cells;
    const buyRate = Number.parseFloat(buy);
    const sellRate = Number.parseFloat(sell);

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(day) ||
      Number.isNaN(buyRate) ||
      Number.isNaN(sellRate)
    ) {
      continue;
    }

    rates.push({
      date: day,
      buyRate,
      sellRate,
      observedAt: toObservedAt(day),
    });
  }

  return rates;
}

export async function fetchCbslFxRates(): Promise<CbslFxRate[]> {
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 7);

  const body = new URLSearchParams({
    lookupPage: "lookup_daily_exchange_rates.php",
    startRange: "2006-11-11",
    rangeType: "dates",
    txtStart: formatDate(start),
    txtEnd: formatDate(today),
    "chk_cur[]": "USD~US Dollar",
    submit_button: "Submit",
  });

  const response = await fetch(RESULTS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": BOT_USER_AGENT,
    },
    body: body.toString(),
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`CBSL responded with ${response.status}`);
  }

  const html = await response.text();
  const rates = parseRatesTable(html);

  if (rates.length === 0) {
    throw new Error("CBSL table parsed but contained no rate rows");
  }

  return rates.sort((a, b) => b.date.localeCompare(a.date));
}

export async function fetchLatestCbslFxRate(): Promise<CbslFxRate> {
  const rates = await fetchCbslFxRates();
  return rates[0];
}
