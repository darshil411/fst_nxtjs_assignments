// emails/AccountActivityAlert.tsx
// React Email template for account activity alerts

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────

interface AccountActivityAlertEmailProps {
  userName: string;
  activityType:
    | "LOGIN"
    | "PASSWORD_CHANGE"
    | "ROLE_CHANGE"
    | "SUSPICIOUS_ACTIVITY"
    | "ACCOUNT_CREATED";
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  newRole?: string;
  appUrl: string;
}

// ─────────────────────────────────────────────────────────────
// Activity config
// ─────────────────────────────────────────────────────────────

const activityConfig = {
  LOGIN: {
    title: "New Sign-In Detected",
    description: "A new sign-in was detected on your account.",
    severity: "info" as const,
    icon: "🔐",
  },
  PASSWORD_CHANGE: {
    title: "Password Changed",
    description: "Your account password was recently changed.",
    severity: "warning" as const,
    icon: "🔑",
  },
  ROLE_CHANGE: {
    title: "Account Role Updated",
    description: "Your account role has been updated by an administrator.",
    severity: "info" as const,
    icon: "👤",
  },
  SUSPICIOUS_ACTIVITY: {
    title: "Suspicious Activity Detected",
    description:
      "We detected unusual activity on your account. If this wasn't you, please secure your account immediately.",
    severity: "danger" as const,
    icon: "⚠️",
  },
  ACCOUNT_CREATED: {
    title: "Welcome to TxnManager",
    description: "Your account has been successfully created.",
    severity: "success" as const,
    icon: "✅",
  },
};

const severityColors = {
  info: { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" },
  warning: { bg: "#fffbeb", border: "#fde68a", text: "#d97706" },
  danger: { bg: "#fef2f2", border: "#fecaca", text: "#dc2626" },
  success: { bg: "#f0fdf4", border: "#bbf7d0", text: "#16a34a" },
};

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export const AccountActivityAlertEmail = ({
  userName = "User",
  activityType = "LOGIN",
  ipAddress,
  userAgent,
  timestamp = new Date(),
  newRole,
  appUrl = "http://localhost:3000",
}: AccountActivityAlertEmailProps) => {
  const config = activityConfig[activityType];
  const colors = severityColors[config.severity];

  return (
    <Html>
      <Head />
      <Preview>
        {config.icon} {config.title} — TxnManager Security Alert
      </Preview>

      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Heading style={styles.headerTitle}>TxnManager</Heading>
            <Text style={styles.headerSubtitle}>Security Notification</Text>
          </Section>

          {/* Main */}
          <Section style={styles.main}>
            <Heading as="h2" style={styles.greeting}>
              Hi {userName},
            </Heading>

            {/* Alert Banner */}
            <Section
              style={{
                ...styles.alertBanner,
                backgroundColor: colors.bg,
                border: `1px solid ${colors.border}`,
              }}
            >
              <Text
                style={{
                  ...styles.alertTitle,
                  color: colors.text,
                }}
              >
                {config.icon} {config.title}
              </Text>
              <Text style={styles.alertDescription}>{config.description}</Text>
            </Section>

            {/* Activity Details */}
            <Section style={styles.detailsSection}>
              <Heading as="h3" style={styles.detailsTitle}>
                Activity Details
              </Heading>

              <table style={styles.detailTable}>
                <tbody>
                  <tr>
                    <td style={styles.tdLabel}>Activity</td>
                    <td style={styles.tdValue}>{config.title}</td>
                  </tr>
                  <tr>
                    <td style={styles.tdLabel}>Date &amp; Time</td>
                    <td style={styles.tdValue}>{formatDate(timestamp)}</td>
                  </tr>
                  {ipAddress && (
                    <tr>
                      <td style={styles.tdLabel}>IP Address</td>
                      <td style={styles.tdValue}>{ipAddress}</td>
                    </tr>
                  )}
                  {userAgent && (
                    <tr>
                      <td style={styles.tdLabel}>Device</td>
                      <td style={styles.tdValue}>
                        {userAgent.substring(0, 60)}
                        {userAgent.length > 60 ? "..." : ""}
                      </td>
                    </tr>
                  )}
                  {newRole && (
                    <tr>
                      <td style={styles.tdLabel}>New Role</td>
                      <td style={styles.tdValue}>{newRole}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Section>

            <Hr style={styles.hr} />

            {/* CTA */}
            <Section style={styles.ctaSection}>
              <Text style={styles.ctaText}>
                {config.severity === "danger"
                  ? "If you did not perform this action, secure your account immediately."
                  : "Review your account activity to ensure everything looks correct."}
              </Text>
              <Button href={`${appUrl}/dashboard`} style={styles.ctaButton}>
                Go to Dashboard
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              This security alert was sent because activity was detected on your
              TxnManager account. If this was you, no further action is needed.
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

export default AccountActivityAlertEmail;

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
    margin: "0 0 20px",
  },
  alertBanner: {
    borderRadius: "10px",
    padding: "20px 24px",
    marginBottom: "28px",
  },
  alertTitle: {
    fontSize: "16px",
    fontWeight: "700",
    margin: "0 0 6px",
  },
  alertDescription: {
    color: "#374151",
    fontSize: "14px",
    lineHeight: "1.6",
    margin: 0,
  },
  detailsSection: {
    marginBottom: "24px",
  },
  detailsTitle: {
    color: "#1e293b",
    fontSize: "15px",
    fontWeight: "600",
    margin: "0 0 12px",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "8px",
  },
  detailTable: {
    width: "100%",
    borderCollapse: "collapse" as const,
  },
  tdLabel: {
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "500",
    padding: "6px 0",
    width: "140px",
    verticalAlign: "top" as const,
  },
  tdValue: {
    color: "#1e293b",
    fontSize: "13px",
    padding: "6px 0",
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
    lineHeight: "1.6",
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
