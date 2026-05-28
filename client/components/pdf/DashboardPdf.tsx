import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import "./fonts";

const base = StyleSheet.create({
  page: {
    padding: 28,
    fontFamily: "Noto Sans",
    fontSize: 10,
  },
  header: {
    backgroundColor: "#2563eb",
    padding: 16,
    marginBottom: 18,
  },
  headerTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: 700,
  },
  headerSub: {
    color: "#bfdbfe",
    fontSize: 11,
    marginTop: 4,
    fontWeight: 400,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    borderBottomWidth: 1,
    paddingBottom: 4,
    marginBottom: 10,
    marginTop: 14,
  },
  grid2: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 4,
  },
  card: {
    width: "47%",
    padding: 10,
    borderWidth: 1,
    borderRadius: 4,
  },
  cardLabel: {
    fontSize: 9,
    marginBottom: 3,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: 700,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    gap: 6,
  },
  barLabelText: {
    width: 65,
    fontSize: 8,
    textAlign: "right",
    fontWeight: 400,
  },
  barTrack: {
    flex: 1,
    height: 14,
    borderRadius: 3,
  },
  barFill: {
    height: 14,
    borderRadius: 3,
  },
  barValue: {
    width: 42,
    fontSize: 8,
    fontWeight: 700,
    textAlign: "right",
  },
  table: {
    marginBottom: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingVertical: 4,
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingVertical: 5,
  },
  tableCell: {
    flex: 1,
    fontSize: 8,
    paddingHorizontal: 4,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 7,
    fontWeight: 700,
    color: "white",
    textAlign: "center",
    width: "auto",
    alignSelf: "flex-start",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 5,
  },
  badgeDate: {
    fontSize: 9,
    width: 60,
    fontWeight: 400,
  },
  footer: {
    marginTop: 20,
    borderTopWidth: 1,
    paddingTop: 8,
    fontSize: 8,
    textAlign: "center",
  },
});

const badgeColors: Record<string, string> = {
  Strong: "#22c55e",
  Stable: "#3b82f6",
  Watch: "#f59e0b",
  Critical: "#ef4444",
};

interface S {
  id: string;
  created_at: string;
  summary: {
    health_score: {
      total_income: number;
      total_expense: number;
      net_savings: number;
      savings_rate: number;
      expense_ratio: number;
      avg_expense: number;
      health_label: string;
    };
  };
}

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export function DashboardPdf({ summaries, theme }: { summaries: S[]; theme?: "light" | "dark" }) {
  const isDark = theme === "dark";
  const sorted = [...summaries].reverse();
  const n = summaries.length;

  const avgRate = n > 0
    ? summaries.reduce((s, x) => s + x.summary.health_score.savings_rate, 0) / n
    : 0;
  const totalIncome = summaries.reduce((s, x) => s + x.summary.health_score.total_income, 0);
  const totalExpense = summaries.reduce((s, x) => s + x.summary.health_score.total_expense, 0);
  const bestLabel = n > 0
    ? summaries.reduce((best, s) => {
        const order = ["Critical", "Watch", "Stable", "Strong"];
        return order.indexOf(s.summary.health_score.health_label) >
          order.indexOf(best)
          ? s.summary.health_score.health_label
          : best;
      }, "Critical" as string)
    : "N/A";

  const maxRate = Math.max(...summaries.map((s) => s.summary.health_score.savings_rate), 1);

  const t = (light: string, dark: string) => (isDark ? dark : light);
  const sectionTitleColor = t("#1e293b", "#e2e8f0");
  const sectionTitleBorder = t("#e2e8f0", "#334155");
  const labelColor = t("#64748b", "#94a3b8");
  const textColor = t("#1e293b", "#e2e8f0");
  const cardBg = t("#ffffff", "#1e293b");
  const cardBorder = t("#e2e8f0", "#334155");
  const barTrackBg = t("#f1f5f9", "#334155");
  const footerColor = t("#94a3b8", "#64748b");
  const footerBorder = t("#e2e8f0", "#334155");
  const tableHeaderBg = t("#f8fafc", "#1e293b");
  const tableHeaderBorder = t("#cbd5e1", "#475569");
  const tableRowBorder = t("#e2e8f0", "#334155");

  return (
    <Document>
      <Page
        size="A4"
        style={[base.page, { color: textColor, backgroundColor: t("#ffffff", "#0f172a") }]}
        wrap
      >
        <View style={base.header}>
          <Text style={base.headerTitle}>Dashboard</Text>
          <Text style={base.headerSub}>Financial Overview</Text>
        </View>

        <Text style={[base.sectionTitle, { color: sectionTitleColor, borderBottomColor: sectionTitleBorder }]}>
          Key Metrics
        </Text>
        <View style={base.grid2}>
          <View style={[base.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Text style={[base.cardLabel, { color: labelColor }]}>Avg Savings Rate</Text>
            <Text style={[base.cardValue, { color: avgRate >= 20 ? "#22c55e" : "#ef4444" }]}>
              {avgRate.toFixed(1)}%
            </Text>
          </View>
          <View style={[base.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Text style={[base.cardLabel, { color: labelColor }]}>Total Income</Text>
            <Text style={[base.cardValue, { color: textColor }]}>{fmt(totalIncome)}</Text>
          </View>
          <View style={[base.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Text style={[base.cardLabel, { color: labelColor }]}>Total Expenses</Text>
            <Text style={[base.cardValue, { color: "#ef4444" }]}>{fmt(totalExpense)}</Text>
          </View>
          <View style={[base.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Text style={[base.cardLabel, { color: labelColor }]}>Best Health</Text>
            <Text style={[base.cardValue, { color: badgeColors[bestLabel] || textColor }]}>
              {bestLabel}
            </Text>
          </View>
        </View>

        <Text style={[base.sectionTitle, { color: sectionTitleColor, borderBottomColor: sectionTitleBorder }]}>
          Savings Rate Trend
        </Text>
        {sorted.map((s) => {
          const rate = s.summary.health_score.savings_rate;
          const pct = maxRate > 0 ? rate / maxRate : 0;
          const barColor = rate >= 20 ? "#22c55e" : "#ef4444";
          return (
            <View key={s.id} style={[base.barRow, { marginBottom: 7 }]}>
              <Text style={[base.barLabelText, { color: labelColor }]}>{fmtDate(s.created_at)}</Text>
              <View style={[base.barTrack, { backgroundColor: barTrackBg }]}>
                <View style={[base.barFill, { width: `${pct * 100}%`, backgroundColor: barColor }]} />
              </View>
              <Text style={[base.barValue, { color: textColor }]}>{rate.toFixed(1)}%</Text>
            </View>
          );
        })}

        <Text style={[base.sectionTitle, { color: sectionTitleColor, borderBottomColor: sectionTitleBorder }]}>
          Income vs Expense
        </Text>
        <View style={base.table}>
          <View style={[base.tableHeaderRow, { backgroundColor: tableHeaderBg, borderBottomColor: tableHeaderBorder }]}>
            <Text style={[base.tableCell, { flex: 0.8, color: textColor, fontWeight: 700 }]}>Date</Text>
            <Text style={[base.tableCell, { color: textColor, fontWeight: 700 }]}>Income</Text>
            <Text style={[base.tableCell, { color: textColor, fontWeight: 700 }]}>Expense</Text>
            <Text style={[base.tableCell, { color: textColor, fontWeight: 700 }]}>Net</Text>
            <Text style={[base.tableCell, { flex: 0.7, color: textColor, fontWeight: 700 }]}>Rate</Text>
          </View>
          {sorted.map((s) => (
            <View key={s.id} style={[base.tableRow, { borderBottomColor: tableRowBorder }]}>
              <Text style={[base.tableCell, { flex: 0.8, color: labelColor }]}>{fmtDate(s.created_at)}</Text>
              <Text style={[base.tableCell, { color: textColor }]}>{fmt(s.summary.health_score.total_income)}</Text>
              <Text style={[base.tableCell, { color: textColor }]}>{fmt(s.summary.health_score.total_expense)}</Text>
              <Text style={[base.tableCell, { color: s.summary.health_score.net_savings >= 0 ? "#22c55e" : "#ef4444" }]}>
                {fmt(s.summary.health_score.net_savings)}
              </Text>
              <Text style={[base.tableCell, { flex: 0.7, color: textColor }]}>
                {s.summary.health_score.savings_rate.toFixed(1)}%
              </Text>
            </View>
          ))}
        </View>

        <Text style={[base.sectionTitle, { color: sectionTitleColor, borderBottomColor: sectionTitleBorder }]}>
          Health Timeline
        </Text>
        {sorted.map((s) => (
          <View key={s.id} style={base.badgeRow}>
            <Text style={[base.badgeDate, { color: labelColor }]}>{fmtDate(s.created_at)}</Text>
            <View
              style={[
                base.badge,
                { backgroundColor: badgeColors[s.summary.health_score.health_label] || "#94a3b8" },
              ]}
            >
              <Text>{s.summary.health_score.health_label}</Text>
            </View>
          </View>
        ))}

        <Text style={[base.footer, { color: footerColor, borderTopColor: footerBorder }]}>
          Generated on {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
        </Text>
      </Page>
    </Document>
  );
}
