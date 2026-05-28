import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { CategoryExpense, RecurringPayment } from "@/types";
import "./fonts";

interface BudgetData {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
}

interface Props {
  created_at: string;
  healthScore: {
    total_income: number;
    total_expense: number;
    net_savings: number;
    savings_rate: number;
    health_label: string;
  };
  categoryExpense: CategoryExpense[];
  recurringPayments: RecurringPayment[];
  recommendations: string[];
  story: string;
  fraudAlerts: string[];
  budget: BudgetData | null;
  totalExpense: number;
  theme?: "light" | "dark";
}

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
    fontWeight: 400,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: 700,
  },
  cardDiff: {
    fontSize: 9,
    fontWeight: 700,
    marginTop: 2,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    gap: 6,
  },
  barLabel: {
    width: 90,
    fontSize: 8,
    fontWeight: 700,
    textAlign: "right",
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
    width: 58,
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
    fontWeight: 400,
  },
  recItem: {
    flexDirection: "row",
    marginBottom: 5,
    gap: 4,
  },
  recBullet: {
    width: 12,
    fontSize: 10,
    color: "#2563eb",
  },
  recText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.4,
    fontWeight: 400,
  },
  adviceBox: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    marginTop: 6,
  },
  adviceText: {
    fontSize: 9,
    lineHeight: 1.5,
    fontWeight: 400,
  },
  fraudBox: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    marginTop: 6,
  },
  noFraudBox: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    marginTop: 6,
  },
  footer: {
    marginTop: 20,
    borderTopWidth: 1,
    paddingTop: 8,
    fontSize: 8,
    textAlign: "center",
  },
});

const barColors = [
  "#2563eb", "#7c3aed", "#db2777", "#dc2626",
  "#ea580c", "#ca8a04", "#16a34a", "#0891b2",
  "#4f46e5", "#9333ea",
];

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

interface MdBlock {
  type: "p" | "h3" | "li";
  nodes: React.ReactNode[];
}

function parseInline(text: string): React.ReactNode[] {
  const clean = text.replace(/https?:\/\/[^\s]+/g, "link");
  const nodes: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(clean)) !== null) {
    if (m.index > last) {
      nodes.push(<Text key={`t${last}`}>{clean.slice(last, m.index)}</Text>);
    }
    if (m[2]) {
      nodes.push(<Text key={`b${m.index}`} style={{ fontWeight: 700 }}>{m[2]}</Text>);
    } else if (m[3]) {
      nodes.push(<Text key={`i${m.index}`} style={{ fontStyle: "italic" }}>{m[3]}</Text>);
    } else if (m[4]) {
      nodes.push(<Text key={`c${m.index}`} style={{ fontFamily: "Courier", fontSize: 8 }}>{m[4]}</Text>);
    }
    last = m.index + m[0].length;
  }
  if (last < clean.length) {
    nodes.push(<Text key={`t${last}`}>{clean.slice(last)}</Text>);
  }
  return nodes.length > 0 ? nodes : [<Text key="0">{clean}</Text>];
}

function parseMarkdown(text: string): MdBlock[] {
  return text.split(/\n\n+/).filter(Boolean).map((block) => {
    const trimmed = block.trim();
    let content = trimmed;
    let type: MdBlock["type"] = "p";

    if (/^###\s/.test(trimmed)) {
      type = "h3";
      content = trimmed.replace(/^###\s+/, "");
    } else if (/^##\s/.test(trimmed)) {
      type = "h3";
      content = trimmed.replace(/^##\s+/, "");
    } else if (/^[-*]\s/.test(trimmed)) {
      type = "li";
      content = trimmed.replace(/^[-*]\s+/, "");
    } else if (/^\d+\.\s/.test(trimmed)) {
      type = "li";
      content = trimmed.replace(/^\d+\.\s+/, "");
    }

    return { type, nodes: parseInline(content) };
  });
}

export function AnalyticsPdf({
  created_at,
  healthScore,
  categoryExpense,
  recurringPayments,
  recommendations,
  story,
  fraudAlerts,
  budget,
  totalExpense,
  theme,
}: Props) {
  const isDark = theme === "dark";
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

  const stmtDate = created_at
    ? new Date(created_at).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Unknown";

  const budgetCards = budget && budget.daily > 0
    ? [
        { label: "Daily Budget", budget: budget.daily, actual: Math.round(totalExpense / 365) },
        { label: "Weekly Budget", budget: budget.weekly, actual: Math.round(totalExpense / 52) },
        { label: "Monthly Budget", budget: budget.monthly, actual: Math.round(totalExpense / 12) },
        { label: "Yearly Budget", budget: budget.yearly, actual: totalExpense },
      ]
    : null;

  const maxExpense = Math.max(...categoryExpense.map((c) => c.debit_value), 1);
  const topCategories = [...categoryExpense]
    .sort((a, b) => b.debit_value - a.debit_value)
    .slice(0, 10);

  return (
    <Document>
      <Page
        size="A4"
        style={[base.page, { color: textColor, backgroundColor: t("#ffffff", "#0f172a") }]}
        wrap
      >
        <View style={base.header}>
          <Text style={base.headerTitle}>Statement Analysis</Text>
          <Text style={base.headerSub}>{stmtDate}</Text>
        </View>

        {budgetCards && (
          <>
            <Text style={[base.sectionTitle, { color: sectionTitleColor, borderBottomColor: sectionTitleBorder }]}>
              Budget Overview
            </Text>
            <View style={base.grid2}>
              {budgetCards.map((c) => {
                const over = c.actual > c.budget;
                const diff = Math.abs(c.budget - c.actual);
                return (
                  <View key={c.label} style={[base.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                    <Text style={[base.cardLabel, { color: labelColor }]}>{c.label}</Text>
                    <Text style={[base.cardValue, { color: over ? "#ef4444" : "#22c55e" }]}>
                      {over ? "-" : "+"}{fmt(diff)}
                    </Text>
                    <Text style={[base.cardDiff, { color: labelColor }]}>
                      Budget: {fmt(c.budget)}  Spent: {fmt(c.actual)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        <Text style={[base.sectionTitle, { color: sectionTitleColor, borderBottomColor: sectionTitleBorder }]}>
          Health Metrics
        </Text>
        <View style={base.grid2}>
          <View style={[base.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Text style={[base.cardLabel, { color: labelColor }]}>Total Income</Text>
            <Text style={[base.cardValue, { color: "#22c55e" }]}>{fmt(healthScore.total_income)}</Text>
          </View>
          <View style={[base.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Text style={[base.cardLabel, { color: labelColor }]}>Total Expenses</Text>
            <Text style={[base.cardValue, { color: "#ef4444" }]}>{fmt(healthScore.total_expense)}</Text>
          </View>
          <View style={[base.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Text style={[base.cardLabel, { color: labelColor }]}>Net Savings</Text>
            <Text style={[base.cardValue, { color: healthScore.net_savings >= 0 ? "#22c55e" : "#ef4444" }]}>
              {fmt(healthScore.net_savings)}
            </Text>
          </View>
          <View style={[base.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Text style={[base.cardLabel, { color: labelColor }]}>Savings Rate</Text>
            <Text style={[base.cardValue, { color: healthScore.savings_rate >= 20 ? "#22c55e" : "#ef4444" }]}>
              {healthScore.savings_rate.toFixed(1)}%
            </Text>
          </View>
        </View>

        {topCategories.length > 0 && (
          <>
            <Text style={[base.sectionTitle, { color: sectionTitleColor, borderBottomColor: sectionTitleBorder }]}>
              Top Expense Categories
            </Text>
            {topCategories.map((c, i) => {
              const pct = maxExpense > 0 ? c.debit_value / maxExpense : 0;
              return (
                <View key={c.ai_category} style={base.barRow}>
                  <Text style={[base.barLabel, { color: textColor }]}>{c.ai_category}</Text>
                  <View style={[base.barTrack, { backgroundColor: barTrackBg }]}>
                    <View style={[base.barFill, { width: `${pct * 100}%`, backgroundColor: barColors[i % barColors.length] }]} />
                  </View>
                  <Text style={[base.barValue, { color: textColor }]}>{fmt(c.debit_value)}</Text>
                </View>
              );
            })}
          </>
        )}

        {recurringPayments.length > 0 && (
          <>
            <Text style={[base.sectionTitle, { color: sectionTitleColor, borderBottomColor: sectionTitleBorder }]}>
              Top Recurring Payments
            </Text>
            <View style={base.table}>
              <View style={[base.tableHeaderRow, { backgroundColor: tableHeaderBg, borderBottomColor: tableHeaderBorder }]}>
                <Text style={[base.tableCell, { flex: 1.5, color: textColor, fontWeight: 700 }]}>Merchant</Text>
                <Text style={[base.tableCell, { flex: 0.6, color: textColor, fontWeight: 700 }]}>Occurrences</Text>
                <Text style={[base.tableCell, { color: textColor, fontWeight: 700 }]}>Average</Text>
                <Text style={[base.tableCell, { color: textColor, fontWeight: 700 }]}>Total</Text>
              </View>
              {recurringPayments.slice(0, 8).map((p, i) => (
                <View key={i} style={[base.tableRow, { borderBottomColor: tableRowBorder }]}>
                  <Text style={[base.tableCell, { flex: 1.5, color: textColor }]}>{p.merchant}</Text>
                  <Text style={[base.tableCell, { flex: 0.6, color: textColor }]}>{p.occurrences}</Text>
                  <Text style={[base.tableCell, { color: textColor }]}>{fmt(p.average_amount)}</Text>
                  <Text style={[base.tableCell, { color: textColor }]}>{fmt(p.total_amount)}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {recommendations.length > 0 && (
          <>
            <Text style={[base.sectionTitle, { color: sectionTitleColor, borderBottomColor: sectionTitleBorder }]}>
              Recommendations
            </Text>
            {recommendations.map((r, i) => (
              <View key={i} style={base.recItem}>
                <Text style={base.recBullet}>{"\u2022"}</Text>
                <Text style={[base.recText, { color: t("#334155", "#cbd5e1") }]}>{r}</Text>
              </View>
            ))}
          </>
        )}

        {story && (
          <>
            <Text style={[base.sectionTitle, { color: sectionTitleColor, borderBottomColor: sectionTitleBorder }]}>
              AI Advice
            </Text>
            <View style={[base.adviceBox, { backgroundColor: t("#f8fafc", "#1e293b"), borderColor: t("#e2e8f0", "#334155") }]}>
              {(() => {
                const blocks = parseMarkdown(story);
                const pStyle = [base.adviceText, { color: t("#334155", "#cbd5e1") }];
                const h3Style = { fontSize: 11, fontWeight: 700 as const, marginTop: 6, marginBottom: 2, color: t("#1e293b", "#e2e8f0") };
                const liStyle = { fontSize: 9, lineHeight: 1.5, color: t("#334155", "#cbd5e1"), marginLeft: 8 };
                return blocks.map((block, i) => {
                  if (block.type === "h3") {
                    return <Text key={i} style={h3Style} wrap>{block.nodes}</Text>;
                  }
                  if (block.type === "li") {
                    return (
                      <View key={i} style={{ flexDirection: "row", marginBottom: 3, gap: 4, alignItems: "flex-start" }}>
                        <Text style={{ fontSize: 9, color: "#2563eb" }}>{"\u2022"}</Text>
                        <Text style={liStyle} wrap>{block.nodes}</Text>
                      </View>
                    );
                  }
                  return <Text key={i} style={pStyle} wrap>{block.nodes}</Text>;
                });
              })()}
            </View>
          </>
        )}

        <Text style={[base.sectionTitle, { color: sectionTitleColor, borderBottomColor: sectionTitleBorder }]}>
          Fraud Detection
        </Text>
        {fraudAlerts.length > 0 ? (
          <View style={[base.fraudBox, { backgroundColor: t("#fef2f2", "#450a0a"), borderColor: t("#fca5a5", "#dc2626") }]}>
            {fraudAlerts.map((a, i) => (
              <Text key={i} style={{ fontSize: 9, color: t("#991b1b", "#fca5a5"), fontWeight: 700, lineHeight: 1.4 }} wrap>{a}</Text>
            ))}
          </View>
        ) : (
          <View style={[base.noFraudBox, { backgroundColor: t("#f0fdf4", "#052e16"), borderColor: t("#86efac", "#22c55e") }]}>
            <Text style={{ fontSize: 9, color: t("#166534", "#86efac") }}>No fraud has been detected</Text>
          </View>
        )}

        <Text style={[base.footer, { color: footerColor, borderTopColor: footerBorder }]}>
          Generated on {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
        </Text>
      </Page>
    </Document>
  );
}
