<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Financialo bank statement analyser. The project already had a strong foundation (posthog-js + posthog-node installed, `instrumentation-client.ts` initialising the client, a server-side `getPostHogClient()` helper, and user identification via `SyncUser`). The wizard filled in the remaining gaps:

- **Environment variables** — confirmed and updated `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` in `.env.local`.
- **`generate_summary_clicked`** — the "Generate Summary" `<Link>` in the server component `app/dashboard/statements/page.tsx` was replaced with a new `<GenerateSummaryLink>` client component (`components/application/GenerateSummaryLink.tsx`) that fires the event on click.
- **`statement_viewed`** — a server-side `posthog.capture()` call was added to `app/dashboard/[id]/page.tsx` so every statement detail page view is tracked with `statement_id`, `health_label`, and `transaction_count`.

All other events (`statement_file_dropped`, `statement_upload_succeeded`, `statement_upload_failed`, `statement_upload_retried`, `statement_file_deleted`, `statement_parsed`, `statement_parse_failed`, `ai_advice_generated`, `fraud_alert_detected`) were already instrumented in previous work and were not modified.

| Event | Description | File |
|---|---|---|
| `statement_file_dropped` | User drops/selects a bank statement file | `components/application/file-upload/statement-upload.tsx` |
| `statement_upload_succeeded` | Bank statement uploaded and parsed successfully | `components/application/file-upload/statement-upload.tsx` |
| `statement_upload_failed` | Statement upload or parsing failed | `components/application/file-upload/statement-upload.tsx` |
| `statement_upload_retried` | User retries a failed upload | `components/application/file-upload/statement-upload.tsx` |
| `statement_file_deleted` | User removes a selected file from the upload UI | `components/application/file-upload/statement-upload.tsx` |
| `generate_summary_clicked` | User clicks the "Generate Summary" button | `app/dashboard/statements/page.tsx` (via `components/application/GenerateSummaryLink.tsx`) |
| `statement_viewed` | User views the detail page of a specific statement | `app/dashboard/[id]/page.tsx` |
| `statement_parsed` | Server: parse API route returned successfully | `app/api/parse/route.ts` |
| `statement_parse_failed` | Server: parse API route returned an error | `app/api/parse/route.ts` |
| `ai_advice_generated` | Server: AI financial story generated via Groq | `lib/actions/insights.action.ts` |
| `fraud_alert_detected` | Server: suspicious transactions detected | `lib/actions/insights.action.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](https://us.posthog.com/project/437977/dashboard/1623065)
- [Statement uploads over time](https://us.posthog.com/project/437977/insights/JnQASVpz) — daily file drop count
- [Upload success vs failure](https://us.posthog.com/project/437977/insights/x3EzHBba) — succeeded vs failed uploads side-by-side
- [Upload-to-statement-viewed funnel](https://us.posthog.com/project/437977/insights/UYCaebuu) — conversion funnel: file dropped → upload succeeded → statement viewed
- [AI advice & fraud alerts generated](https://us.posthog.com/project/437977/insights/W3ACQstd) — AI story + fraud alert daily frequency
- [Statement parse success rate](https://us.posthog.com/project/437977/insights/iDRiyDlg) — server-side parse success vs failure

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
