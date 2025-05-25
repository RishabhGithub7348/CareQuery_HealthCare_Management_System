import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Section,
  Text,
} from "@react-email/components";

interface EmailProps {
  patient: {
    name: string;
    medical_id: string;
    dob: string;
    medical_condition: string;
    email: string;
    contact: string;
    address: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appointments: any[];
}

export const Email = ({ patient, appointments }: EmailProps) => (
  <Html>
    <Head />
    <Body style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <Container>
        <Heading>Patient Summary</Heading>
        <Section>
          <Text>
            <strong>Name:</strong> {patient.name}
          </Text>
          <Text>
            <strong>Medical ID:</strong> {patient.medical_id}
          </Text>
          <Text>
            <strong>Date of Birth:</strong> {patient.dob}
          </Text>
          <Text>
            <strong>Medical Condition:</strong>{" "}
            {patient.medical_condition || "N/A"}
          </Text>
          <Text>
            <strong>Email:</strong> {patient.email || "N/A"}
          </Text>
          <Text>
            <strong>Contact:</strong> {patient.contact || "N/A"}
          </Text>
          <Text>
            <strong>Address:</strong> {patient.address || "N/A"}
          </Text>
        </Section>
        <Section>
          <Heading as="h2">Appointments</Heading>
          {appointments.length > 0 ? (
            appointments.map((appt, index) => (
              <Text key={appt.id}>
                {index + 1}. {appt.date} at {appt.time} - {appt.reason || "N/A"}{" "}
                ({appt.status})
              </Text>
            ))
          ) : (
            <Text>No appointments scheduled.</Text>
          )}
        </Section>
        <Text>Please find the attached PDF for a detailed summary.</Text>
      </Container>
    </Body>
  </Html>
);
