import LegalPage from "@/components/legal/LegalPage";

const sections = [
  {
    heading: "Overview",
    paragraphs: [
      "This Refund & Cancellation Policy explains how subscriptions, renewals, and payments are handled on MakeMistakes. The platform may offer free and paid plans, but the final refund and cancellation configuration must be approved by the business owner and aligned with Indian consumer protection rights.",
      "This policy is intended to be transparent and to set out the terms that apply to subscription activation, cancellation, renewals, failed payments, plan changes, and refunds. It does not replace any legal rights a user may hold under applicable law."
    ],
  },
  {
    heading: "Subscription Plans",
    paragraphs: [
      "MakeMistakes may offer multiple subscription plans with different feature access, usage limits, or support coverage. Users are responsible for selecting the relevant plan and for reviewing plan details before purchase. Plan availability and final pricing should be managed in the administrator configuration and not hardcoded as legally fixed claims."
    ],
  },
  {
    heading: "Subscription Duration",
    paragraphs: [
      "Subscription plans may be billed monthly, quarterly, or annually depending on the configuration set by the business. Renewal timing and billing may vary by plan. Users should review the billing cycle shown at checkout and the current subscription details before confirming payment."
    ],
  },
  {
    heading: "Payment Processing",
    paragraphs: [
      "Payments are processed through authorized third-party payment gateways. MakeMistakes does not store raw payment card data in the application unless required by the payment provider and disclosed in product documentation. Payment records include plan information, order or transaction identifiers, payment status, and billing metadata necessary to operate subscriptions."
    ],
  },
  {
    heading: "Subscription Activation",
    paragraphs: [
      "A subscription becomes active when the payment is confirmed and the order is marked as successful. If a payment is pending, failed, or reversed, the plan may remain inactive or restricted until the issue is resolved. Important activation details must be visible before checkout and in the billing dashboard."
    ],
  },
  {
    heading: "Cancellation",
    paragraphs: [
      "Users may cancel their subscription at any time through the account or billing portal, subject to the configured cancellation rules and applicable law. Cancellation may stop future renewals but does not necessarily reverse charges already incurred. The exact rules and notices should be managed in the administrator configuration."
    ],
  },
  {
    heading: "Automatic Renewals",
    paragraphs: [
      "If automatic renewal is enabled, the user's plan will renew at the configured interval unless the user cancels before the renewal date. Users should be informed clearly before checkout and in the billing settings that automatic renewals may apply. The renewal setting must be configurable by an administrator, rather than treated as a fixed statement."
    ],
  },
  {
    heading: "Failed Payments",
    paragraphs: [
      "Failed payments may result in plan suspension, failed activation, or renewal failure. Users may need to update payment details or retry the transaction. Payment failures should be communicated clearly and quickly to minimize user confusion and to protect the integrity of the platform."
    ],
  },
  {
    heading: "Duplicate Payments",
    paragraphs: [
      "Duplicate or repeated charges due to payment retries, network errors, or system retries should be investigated promptly. The platform will reconcile duplicate or ambiguous payments through its payment operations and may issue a refund or adjustment when appropriate and as required by law."
    ],
  },
  {
    heading: "Refund Eligibility",
    paragraphs: [
      "Refund eligibility depends on the plan, the timing of the request, the payment status, and applicable legal protections. The business owner must configure the refund rules, including the refund window and any grounds for refusal. This policy should not state a specific refund period unless the administrator has confirmed it."
    ],
  },
  {
    heading: "Refund Processing",
    paragraphs: [
      "If a refund is approved, it will typically be processed through the original payment method and may take time to settle depending on the payment processor, bank, or financial partner. The processing timeline is configurable by the administrator and should be reviewed before being published as a final commitment."
    ],
  },
  {
    heading: "Subscription Expiration",
    paragraphs: [
      "When a subscription expires, the user's access will be limited according to the plan terms and the current billing state. If the subscription is not renewed or cannot be activated, certain premium features may become unavailable on the effective date."
    ],
  },
  {
    heading: "Plan Upgrades and Downgrades",
    paragraphs: [
      "Users may upgrade or downgrade plans according to the current subscription configuration and the payment rules in effect. Upgrades may take effect immediately or on the next billing cycle depending on the platform's settings, while downgrades may reduce access when the new cycle begins. Any resulting billing adjustments should be clearly communicated."
    ],
  },
  {
    heading: "Consumer Rights",
    paragraphs: [
      "This policy does not waive or remove any statutory consumer rights that apply under Indian law. If a user has rights that differ from the policy, the user may rely on the applicable legal standard, and the business should update the policy configuration to match the legal position."
    ],
  },
];

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund & Cancellation Policy"
      version="1.0"
      effectiveDate="2026-11-01"
      lastUpdated="2026-11-01"
      description="This refund and cancellation policy sets out the subscription terms, billing mechanics, and the operational process for cancellations and reimbursements. The final configuration should be reviewed and approved by the business administrator before publication."
      sections={sections}
    />
  );
}
