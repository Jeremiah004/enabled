import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';
import { FLAT_SESSION_PAYOUT_NGN } from '@/lib/sessions';

export type TutorPayoutReceiptProps = {
  tutorName: string;
  amountPaid?: number;
  date: string;
  sessionCount: number;
};

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function TutorPayoutReceipt({
  tutorName,
  amountPaid,
  date,
  sessionCount,
}: TutorPayoutReceiptProps) {
  const totalPaid =
    amountPaid ?? sessionCount * FLAT_SESSION_PAYOUT_NGN;
  const perSession = FLAT_SESSION_PAYOUT_NGN;

  return (
    <Html lang="en">
      <Head />
      <Preview>
        Payout receipt — {formatNaira(totalPaid)} from Enabled Multi Concept
      </Preview>
      <Tailwind>
        <Body className="bg-neutral-100 font-sans py-8">
          <Container className="mx-auto max-w-[520px] rounded-xl border border-neutral-200 bg-white px-8 py-10 shadow-sm">
            <Text className="m-0 text-xs font-semibold uppercase tracking-widest text-emerald-600">
              Enabled Multi Concept
            </Text>
            <Heading className="mt-2 mb-6 text-2xl font-bold text-neutral-900">
              Payout receipt
            </Heading>

            <Text className="m-0 mb-4 text-sm leading-6 text-neutral-600">
              Hello {tutorName},
            </Text>
            <Text className="m-0 mb-6 text-sm leading-6 text-neutral-600">
              Your tutor payout has been processed successfully via Paystack. This
              email confirms the transfer to your bank account on file.
            </Text>

            <Section className="rounded-lg border border-neutral-200 bg-neutral-50 px-5 py-4">
              <table className="w-full text-sm" cellPadding={0} cellSpacing={0}>
                <tbody>
                  <tr>
                    <td className="py-2 text-neutral-500">Payment date</td>
                    <td className="py-2 text-right font-medium text-neutral-900">
                      {date}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-neutral-500">Sessions paid</td>
                    <td className="py-2 text-right font-medium text-neutral-900">
                      {sessionCount}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-neutral-500">Rate per session</td>
                    <td className="py-2 text-right font-medium text-neutral-900">
                      {formatNaira(perSession)}
                    </td>
                  </tr>
                </tbody>
              </table>
              <Hr className="my-4 border-neutral-200" />
              <table className="w-full text-sm" cellPadding={0} cellSpacing={0}>
                <tbody>
                  <tr>
                    <td className="py-1 text-neutral-600 font-semibold">
                      Total paid
                    </td>
                    <td className="py-1 text-right text-lg font-bold text-emerald-600">
                      {formatNaira(totalPaid)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            <Text className="mt-6 mb-0 text-xs leading-5 text-neutral-400">
              If you have questions about this payout, contact your administrator.
              This is an automated receipt from Enabled Multi Concept.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
