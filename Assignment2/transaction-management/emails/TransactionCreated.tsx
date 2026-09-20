// emails/TransactionCreated.tsx
// React Email template for new transaction confirmation

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────

interface TransactionCreatedEmailProps {
  userName: string;
  transactionId: string;
  title: string;
  description?: string;
  amount: number;
  type: "CREDIT" | "DEBIT";
  status: string;
  reference: string;
  createdAt: Date;
  appUrl: string;
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const formatAmount = (amount: number, type: "CREDIT" | "DEBIT") => {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
  return type === "CREDIT" ? `+${formatted}` : `-${formatted}`;
};

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export const TransactionCreatedEmail = ({
  userName = "User",
  transactionId = "clx000000000000",
  title = "Payment Received",
  description,
  amount = 250.0,
  type = "CREDIT",
  status = "COMPLETED",
  reference = "REF-0000",
  createdAt = new Date(),
  appUrl = "http://localhost:3000",
}: TransactionCreatedEmailProps) => {
  const isCredit = type === "CREDIT";
  const amountColor = isCredit ? "#16a34a" : "#dc2626";
  const amountDisplay = formatAmount(amount, type);

  return (
    <Html>
      <Head />
      <Preview>
        Transaction {isCredit ? "Received" : "Sent"}: {amountDisplay} — {title}
      </Preview>

      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Heading style={styles.headerTitle}>TxnManager</Heading>
            <Text style={styles.headerSubtitle}>
              Transaction Management System
            </Text>
          </Section>

          {/* Main */}
          <Section style={styles.main}>
            <Heading as="h2" style={styles.greeting}>
              Hi {userName},
            </Heading>
            <Text style={styles.body_text}>
              A new transaction has been recorded on your account.
            </Text>

            {/* Amount Card */}
            <Section style={styles.amountCard}>
              <Text style={{ ...styles.amountLabel, color: amountColor }}>
                {isCredit ? "Amount Received" : "Amount Sent"}
              </Text>
              <Text style={{ ...styles.amountValue, color: amountColor }}>
                {amountDisplay}
              </Text>
              <Text style={styles.amountStatus}>Status: {status}</Text>
            </Section>

            {/* Transaction Details */}
            <Section style={styles.detailsSection}>
              <Heading as="h3" style={styles.detailsTitle}>
                Transaction Details
              </Heading>

              <Row style={styles.detailRow}>
                <Text style={styles.detailLabel}>Title</Text>
                <Text style={styles.detailValue}>{title}</Text>
              </Row>

              {description && (
                <Row style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Description</Text>
                  <Text style={styles.detailValue}>{description}</Text>
                </Row>
              )}

              <Row style={styles.detailRow}>
                <Text style={styles.detailLabel}>Reference</Text>
                <Text style={styles.detailValue}>{reference}</Text>
              </Row>

              <Row style={styles.detailRow}>
                <Text style={styles.detailLabel}>Transaction ID</Text>
                <Text style={styles.detailValue}>{transactionId}</Text>
              </Row>

              <Row style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date &amp; Time</Text>
                <Text style={styles.detailValue}>{formatDate(createdAt)}</Text>
              </Row>
            </Section>

            <Hr style={styles.hr} />

            {/* CTA */}
            <Section style={styles.ctaSection}>
              <Text style={styles.ctaText}>
                View full transaction history in your dashboard.
              </Text>
              <Button
                href={`${appUrl}/transactions`}
                style={styles.ctaButton}
              >
                View Transaction
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              This is an automated notification from TxnManager. If you did not
              initiate this transaction, please contact support immediately.
            </Text>
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} TxnManager. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default TransactionCreatedEmail;

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  body: {
    backgroundColor: "#f4f4f5",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, sans-serif',
    margin: 0,
    padding: 0,
  },
  container: {
    backgroundColor: "#ffffff",
    margin: "40px auto",
    padding: 0,
    maxWidth: "600px",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
  },
  header: {
    backgroundColor: "#1e293b",
    padding: "32px 40px",
    textAlign: "center" as const,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: "24px",
    fontWeight: "700",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  headerSubtitle: {
    color: "#94a3b8",
    fontSize: "13px",
    margin: "4px 0 0",
  },
  main: {
    padding: "40px",
  },
  greeting: {
    color: "#1e293b",
    fontSize: "20px",
    fontWeight: "600",
    margin: "0 0 8px",
  },
  body_text: {
    color: "#64748b",
    fontSize: "15px",
    lineHeight: "1.6",
    margin: "0 0 24px",
  },
  amountCard: {
    backgroundColor: "#f8fafc",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    padding: "24px",
    textAlign: "center" as const,
    marginBottom: "28px",
  },
  amountLabel: {
    fontSize: "13px",
    fontWeight: "600",
    textTransform: "uppercase" as const,
    letterSpacing: "0.8px",
    margin: "0 0 4px",
  },
  amountValue: {
    fontSize: "36px",
    fontWeight: "700",
    margin: "0 0 8px",
    letterSpacing: "-1px",
  },
  amountStatus: {
    color: "#94a3b8",
    fontSize: "13px",
    margin: 0,
  },
  detailsSection: {
    marginBottom: "28px",
  },
  detailsTitle: {
    color: "#1e293b",
    fontSize: "15px",
    fontWeight: "600",
    margin: "0 0 16px",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "8px",
  },
  detailRow: {
    marginBottom: "10px",
  },
  detailLabel: {
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "500",
    margin: 0,
    width: "140px",
    display: "inline-block",
  },
  detailValue: {
    color: "#1e293b",
    fontSize: "13px",
    margin: 0,
    display: "inline-block",
  },
  hr: {
    borderColor: "#e2e8f0",
    margin: "28px 0",
  },
  ctaSection: {
    textAlign: "center" as const,
  },
  ctaText: {
    color: "#64748b",
    fontSize: "14px",
    margin: "0 0 16px",
  },
  ctaButton: {
    backgroundColor: "#1e293b",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    padding: "12px 24px",
    textDecoration: "none",
    display: "inline-block",
  },
  footer: {
    backgroundColor: "#f8fafc",
    borderTop: "1px solid #e2e8f0",
    padding: "24px 40px",
  },
  footerText: {
    color: "#94a3b8",
    fontSize: "12px",
    lineHeight: "1.6",
    margin: "0 0 8px",
    textAlign: "center" as const,
  },
};
